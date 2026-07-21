import { useState, useEffect, useMemo } from 'react';
import { getMyTrainingHistory } from '../services/trainingService';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, AlertCircle } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function ProgressAnalytics() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');

  useEffect(() => {
    // Fetch a good amount of history to build the chart
    getMyTrainingHistory(user.id, 0, 100)
      .then(data => {
        const rawData = data.content || data || [];
        setHistory(rawData);
      })
      .catch(err => {
        console.error(err);
        setError('Error al cargar datos de analíticas.');
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  // Process data for the chart
  const { chartData, availableExercises } = useMemo(() => {
    if (!history.length) return { chartData: [], availableExercises: [] };

    // 1. Extract all unique exercises
    const exerciseNames = new Set();
    
    // 2. Map data: [ { fecha: 'YYYY-MM-DD', exerciseName: maxWeight } ]
    // First, group by Date -> Exercise -> Max Weight
    const dataByDate = {};

    history.forEach(session => {
      if (!session.fecha || !session.marcasEjercicio) return;
      
      // Parsear fecha de forma segura (por si es Array o String)
      let dateKey = 'Desconocida';
      if (typeof session.fecha === 'string') {
        dateKey = session.fecha.split('T')[0];
      } else if (Array.isArray(session.fecha)) {
        const [y, m, d] = session.fecha;
        dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      } else {
        dateKey = String(session.fecha);
      }
      
      if (!dataByDate[dateKey]) dataByDate[dateKey] = { fecha: dateKey, timestamp: new Date(dateKey).getTime() || 0 };

      session.marcasEjercicio.forEach(marca => {
        const name = marca.nombreEjercicio;
        if (!name) return;
        
        exerciseNames.add(name);
        
        const weight = parseFloat(marca.pesoLevantado);
        if (!isNaN(weight)) {
          // Keep the highest weight for this exercise on this date
          if (!dataByDate[dateKey][name] || weight > dataByDate[dateKey][name]) {
            dataByDate[dateKey][name] = weight;
          }
        }
      });
    });

    // Convert Set to Array and sort alphabetically
    const availableExList = Array.from(exerciseNames).sort();

    // Convert object to sorted array by date
    const sortedChartData = Object.values(dataByDate).sort((a, b) => {
      return a.timestamp - b.timestamp;
    });

    return { chartData: sortedChartData, availableExercises: availableExList };
  }, [history]);

  // Set initial selected exercise once data loads
  useEffect(() => {
    if (availableExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(availableExercises[0]);
    }
  }, [availableExercises, selectedExercise]);

  if (loading) {
    return (
      <div className="card p-xl flex-center flex-col animate-pulse" style={{ height: '320px' }}>
        <Activity className="w-10 h-10 text-accent mb-sm animate-spin" style={{ opacity: 0.7 }} />
        <p className="text-secondary">Procesando métricas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-xl flex-center flex-col" style={{ height: '320px', borderColor: 'rgba(255, 71, 87, 0.3)' }}>
        <AlertCircle className="w-10 h-10 text-danger mb-sm" />
        <p className="text-secondary">{error}</p>
      </div>
    );
  }

  if (availableExercises.length === 0 || chartData.length === 0) {
    return (
      <div className="empty-state animate-scale-in" style={{ height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="empty-state-icon flex-center mx-auto mb-md" style={{ opacity: 0.5 }}>
          <TrendingUp className="w-12 h-12" />
        </div>
        <h3 className="text-xl font-bold">Sin Datos Suficientes</h3>
        <p className="text-secondary mt-xs max-w-md mx-auto">
          Registra más entrenamientos para desbloquear las analíticas de progreso y ver tus curvas de fuerza.
        </p>
      </div>
    );
  }

  // Filter out data points that don't have the selected exercise
  const filteredChartData = chartData.filter(d => d[selectedExercise] !== undefined);

  return (
    <div className="card-glow p-xl animate-fade-in-up" style={{ minHeight: '400px' }}>
      <div className="flex-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-sm">
            <TrendingUp className="text-accent" /> Analíticas de Progreso
          </h2>
          <p className="text-secondary text-sm mt-xs">Evolución de peso máximo (kg)</p>
        </div>
        
        <div style={{ width: '100%', minWidth: '220px', maxWidth: '300px' }}>
          <CustomSelect 
            options={availableExercises.map(ex => ({ value: ex, label: ex }))}
            value={selectedExercise}
            onChange={(val) => setSelectedExercise(val)}
            placeholder="Seleccionar Ejercicio"
          />
        </div>
      </div>

      {filteredChartData.length < 1 ? (
        <div className="empty-state animate-fade-in" style={{ height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Activity className="w-10 h-10 mx-auto mb-sm" style={{ opacity: 0.5 }} />
          <p className="text-secondary">No hay datos registrados para {selectedExercise}.</p>
        </div>
      ) : (
        <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredChartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey="fecha" 
                stroke="var(--text-muted)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickMargin={12}
                tickFormatter={(val) => {
                  const parts = val ? val.split('-') : [];
                  if (parts.length === 3) {
                    const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
                    if (!isNaN(dObj.getTime())) return dObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                  }
                  return val;
                }}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                labelFormatter={(val) => {
                  const parts = val ? val.split('-') : [];
                  if (parts.length === 3) {
                    const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
                    if (!isNaN(dObj.getTime())) return dObj.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
                  }
                  return val;
                }}
              />
              <Line 
                type="monotone" 
                dataKey={selectedExercise} 
                name="Peso Máximo (kg)"
                stroke="var(--accent)" 
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 2, stroke: 'var(--bg-primary)' }}
                activeDot={{ r: 6, fill: 'var(--accent)', stroke: '#fff', strokeWidth: 0 }}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
