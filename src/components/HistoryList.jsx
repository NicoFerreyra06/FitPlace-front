import { useState, useEffect } from 'react';
import { getMyTrainingHistory } from '../services/trainingService';
import { useAuth } from '../context/AuthContext';
import { Calendar, Dumbbell, Clock } from 'lucide-react';

export default function HistoryList() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyTrainingHistory(user.id, 0, 20) // Últimos 20 entrenamientos
      .then(data => {
        // Asumiendo que el backend retorna un Page (data.content)
        setHistory(data.content || data || []);
      })
      .catch(err => setError('Error al cargar tu historial.'))
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <div className="text-slate-400">Cargando historial...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (history.length === 0) return <div className="text-slate-400">Aún no tienes entrenamientos registrados.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="text-blue-700" /> Mi Historial
      </h2>
      
      <div className="grid gap-4">
        {history.map((log, idx) => (
          <div key={log.id || idx} className="bg-dark-bg p-5 rounded-xl border border-dark-border hover:border-blue-700/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-slate-200">{log.nombreRutina || 'Entrenamiento General'}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock size={14} /> {Array.isArray(log.fecha) ? log.fecha.join('-') : (log.fecha || 'Fecha desconocida')}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              {log.marcasEjercicio && log.marcasEjercicio.map((marca, i) => (
                <div key={i} className="flex justify-between text-sm bg-dark-card p-2 rounded border border-dark-border/50">
                  <span className="text-slate-300 font-medium flex items-center gap-2">
                    <Dumbbell size={14} className="text-emerald-400" /> 
                    {marca.nombreEjercicio}
                  </span>
                  <span className="text-slate-400">
                    {marca.pesoLevantado} kg × {marca.repeticionesLogradas} reps
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
