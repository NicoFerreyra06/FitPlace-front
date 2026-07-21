import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRecordsPersonales, getHistorialEntrenamientos, getEvolucionEjercicio } from '../services/progressService';
import { getAllEjercicios } from '../services/ejercicioService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomSelect from './CustomSelect';

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10"/><path d="M17 4v8a5 5 0 0 1-10 0V4"/><path d="M4 9h3"/><path d="M17 9h3"/>
  </svg>
);

const MedalIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning mb-xs">
    <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export default function MiProgreso() {
  const { user } = useAuth();
  
  const [prs, setPrs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  
  const [selectedEjercicioId, setSelectedEjercicioId] = useState('');
  const [chartData, setChartData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEjercicioId && user) {
      loadChartData(selectedEjercicioId);
    }
  }, [selectedEjercicioId, user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [prsData, logsData, ejerciciosData] = await Promise.all([
        getRecordsPersonales(user.id).catch(() => []),
        getHistorialEntrenamientos(user.id, 0, 10).catch(() => ({ content: [] })),
        getAllEjercicios().catch(() => [])
      ]);

      setPrs(prsData || []);
      setLogs(logsData?.content || logsData || []);
      setEjercicios(ejerciciosData || []);
      
      // Auto-select first exercise if available
      if (ejerciciosData && ejerciciosData.length > 0) {
        setSelectedEjercicioId(ejerciciosData[0].id.toString());
      }
    } catch (err) {
      console.error("Error loading progress data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async (ejId) => {
    try {
      setChartLoading(true);
      const dataMap = await getEvolucionEjercicio(user.id, ejId);
      
      // Determine if data is a direct array or wrapped in a map { "Ejercicio": [...] }
      let targetArray = [];
      if (Array.isArray(dataMap)) {
        targetArray = dataMap;
      } else if (dataMap && typeof dataMap === 'object') {
        const key = Object.keys(dataMap)[0];
        if (key && Array.isArray(dataMap[key])) {
          targetArray = dataMap[key];
        }
      }

      if (targetArray.length > 0) {
        // Parse and sort the data
        const formattedData = targetArray.map((d, index) => {
          let dateStr = d.fecha;
          if (Array.isArray(dateStr)) {
            // Arrays from backend: [year, month, day, hour, minute]
            const [year, month, day] = dateStr;
            dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
            dateStr = dateStr.split('T')[0];
          }
          
          // To prevent multiple workouts on the same day from collapsing into a single vertical spike,
          // we add zero-width spaces or a counter to make the X-Axis keys technically unique for Recharts
          const uniqueLabel = dateStr + '\u200B'.repeat(index); 
          
          return { ...d, fecha: uniqueLabel, rawDate: dateStr, originalIndex: index };
        }).sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate) || a.originalIndex - b.originalIndex);
        
        setChartData(formattedData);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error("Error loading chart data", err);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse card p-lg h-64 flex justify-center items-center"><span className="text-secondary">Cargando progreso...</span></div>;
  }

  // Calculate max weight for chart scaling
  const maxChartWeight = chartData.length > 0 ? Math.max(...chartData.map(d => d.pesoMaximo)) : 0;

  return (
    <div className="animate-fade-in flex-col gap-xl">
      <div className="section-header">
        <h2 className="section-title">Mi Progreso</h2>
        <p className="text-secondary">Tu historial de sudor y esfuerzo.</p>
      </div>

      {/* 1. Personal Records (PRs) */}
      <div className="flex-col gap-sm">
        <h3 className="font-bold text-lg text-warning flex items-center gap-xs">
          <TrophyIcon /> Salón de la Fama (PRs)
        </h3>
        
        {prs.length === 0 ? (
          <div className="card p-md text-center text-secondary border border-dashed border-border">
            Aún no hay récords personales. ¡Registrá tu primer entrenamiento para empezar a brillar!
          </div>
        ) : (
          <div className="routine-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {prs.map((pr, index) => (
              <div key={pr.id} className="card pr-card p-md animate-scale-in flex-col items-center justify-center text-center" style={{ animationDelay: `${index * 100}ms` }}>
                <MedalIcon />
                <h4 className="font-bold text-primary mb-xs">{pr.nombreEjercicio}</h4>
                <div className="text-2xl font-black text-warning mb-xs">{pr.pesoMaximo} <span className="text-sm font-medium">kg</span></div>
                <div className="badge badge-warning mt-auto">{pr.fechaLogro}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Custom CSS Chart */}
      <div className="card p-lg card-glow animate-fade-in-up">
        <div className="flex-between flex-wrap gap-md mb-lg">
          <div>
            <h3 className="font-bold text-xl">Evolución de Cargas</h3>
            <p className="text-sm text-secondary">Mirá cómo suben esos pesos a lo largo del tiempo.</p>
          </div>
          
          <div style={{ width: '100%', minWidth: '220px', maxWidth: '300px' }}>
            <CustomSelect 
              options={ejercicios.map(ej => ({ value: ej.id, label: ej.nombre }))}
              value={selectedEjercicioId}
              onChange={(val) => setSelectedEjercicioId(val)}
              placeholder="Seleccionar Ejercicio"
            />
          </div>
        </div>

        {chartLoading ? (
          <div className="chart-container flex justify-center items-center">
            <span className="text-secondary animate-pulse">Cargando gráfico...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="chart-container flex justify-center items-center border border-dashed border-border rounded-md">
            <span className="text-secondary">No hay datos suficientes para mostrar un gráfico.</span>
          </div>
        ) : (
          <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="fecha" 
                  tickFormatter={(val) => {
                    const cleanVal = val ? val.replace(/\u200B/g, '') : '';
                    const parts = cleanVal.split('-');
                    if (parts.length === 3) {
                      const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
                      if (!isNaN(dObj.getTime())) return dObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                    }
                    return cleanVal;
                  }} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
                  labelFormatter={(val) => {
                    const cleanVal = val ? val.replace(/\u200B/g, '') : '';
                    const parts = cleanVal.split('-');
                    if (parts.length === 3) {
                      const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
                      if (!isNaN(dObj.getTime())) return dObj.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
                    }
                    return cleanVal;
                  }}
                />
                <Area type="monotone" dataKey="pesoMaximo" name="Peso (kg)" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)" activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--bg-primary)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. Recent Logs Timeline */}
      <div className="card p-lg animate-fade-in-up delay-200">
        <h3 className="font-bold text-xl mb-lg flex items-center gap-sm">
          <CalendarIcon /> Bitácora Reciente
        </h3>

        {logs.length === 0 ? (
          <p className="text-secondary">Aún no registraste ningún entrenamiento.</p>
        ) : (
          <div className="timeline">
            {logs.map((log, index) => (
              <div key={log.id} className="timeline-item animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="timeline-dot"></div>
                <div className="flex-col gap-xs">
                  <div className="flex items-center gap-sm">
                    <span className="badge badge-accent font-mono">
                      {Array.isArray(log.fecha) ? `${log.fecha[0]}-${String(log.fecha[1]).padStart(2, '0')}-${String(log.fecha[2]).padStart(2, '0')}` : (log.fecha?.split('T')[0] || 'Fecha desconocida')}
                    </span>
                    <h4 className="font-bold text-lg">{log.nombreRutina || 'Rutina Personalizada'}</h4>
                  </div>
                  
                  <div className="bg-tertiary p-md rounded-md mt-sm border border-border">
                    <div className="grid grid-cols-2 gap-sm">
                      {log.marcasEjercicio?.map(marca => (
                        <div key={marca.id} className="text-sm">
                          <span className="text-primary font-medium">{marca.nombreEjercicio}</span>
                          <span className="text-secondary ml-xs">— {marca.pesoLevantado}kg x {marca.repeticionesLogradas}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
