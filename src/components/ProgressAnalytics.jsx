import { useState, useEffect, useMemo } from 'react';
import { getMyTrainingHistory } from '../services/trainingService';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, AlertCircle } from 'lucide-react';

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
        dateKey = session.fecha.join('-');
      } else {
        dateKey = String(session.fecha);
      }
      
      if (!dataByDate[dateKey]) dataByDate[dateKey] = { fecha: dateKey };

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
      return new Date(a.fecha) - new Date(b.fecha);
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
      <div className="bg-dark-bg p-8 rounded-2xl border border-dark-border flex flex-col items-center justify-center animate-pulse h-80">
        <Activity className="w-10 h-10 text-neon-blue mb-4 animate-spin" />
        <p className="text-slate-400">Procesando métricas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-bg p-8 rounded-2xl border border-red-500/30 flex flex-col items-center justify-center h-80">
        <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  if (availableExercises.length === 0 || chartData.length === 0) {
    return (
      <div className="bg-dark-bg p-8 rounded-2xl border border-dark-border flex flex-col items-center justify-center h-80 text-center">
        <TrendingUp className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="text-xl font-medium text-slate-300">Sin Datos Suficientes</h3>
        <p className="text-slate-500 mt-2 max-w-md">Registra más entrenamientos para desbloquear las analíticas de progreso y ver tus curvas de fuerza.</p>
      </div>
    );
  }

  // Filter out data points that don't have the selected exercise
  const filteredChartData = chartData.filter(d => d[selectedExercise] !== undefined);

  return (
    <div className="bg-gradient-to-b from-dark-card to-dark-bg p-6 rounded-2xl border border-dark-border shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
            <TrendingUp className="text-neon-blue" /> Analíticas de Progreso
          </h2>
          <p className="text-sm text-slate-400 mt-1">Evolución de peso máximo (kg)</p>
        </div>
        
        <select 
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="bg-dark-bg border border-dark-border rounded-lg p-2.5 text-slate-200 focus:border-neon-blue outline-none min-w-[200px]"
        >
          {availableExercises.map(ex => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      </div>

      {filteredChartData.length < 1 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <Activity className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-slate-400">No hay datos registrados para {selectedExercise}.</p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredChartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="fecha" 
                stroke="#64748b" 
                tick={{fill: '#94a3b8', fontSize: 12}}
                tickMargin={10}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{fill: '#94a3b8', fontSize: 12}}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #1e293b',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)'
                }}
                itemStyle={{ color: '#0169ff', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey={selectedExercise} 
                name="Peso Máximo (kg)"
                stroke="#0169ff" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#0169ff', strokeWidth: 2, stroke: '#0f172a' }}
                activeDot={{ r: 6, fill: '#0169ff', stroke: '#fff' }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
