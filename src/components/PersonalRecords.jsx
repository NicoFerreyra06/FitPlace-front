import { useState, useEffect } from 'react';
import { getMyPersonalRecords } from '../services/recordService';
import { useAuth } from '../context/AuthContext';
import { Trophy, ArrowUpRight } from 'lucide-react';
import ProgressAnalytics from './ProgressAnalytics';

export default function PersonalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPersonalRecords(user.id)
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <div className="text-slate-400">Cargando récords...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Trophy className="text-neon-blue" /> Récords Personales
      </h2>

      {/* Gráfico Analítico de Progreso */}
      <ProgressAnalytics />
      
      {records.length === 0 ? (
        <div className="text-slate-500 text-center py-10 bg-dark-bg rounded-xl border border-dark-border">
          <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-2" />
          No hay récords registrados aún. Sigue entrenando para romper tus límites.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((rec, idx) => (
            <div key={idx} className="bg-gradient-to-br from-dark-card to-dark-bg p-5 rounded-xl border border-neon-blue/20 shadow-lg shadow-neon-blue/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-neon-blue/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              
              <h3 className="text-lg font-semibold text-slate-200 mb-1 z-10 relative">
                {rec.ejercicioNombre || rec.nombreEjercicio || 'Ejercicio'}
              </h3>
              
              <div className="flex items-end gap-2 mt-4 z-10 relative">
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-blue-800">
                  {rec.pesoMaximo || rec.pesoLevantado || 0}
                </span>
                <span className="text-slate-400 mb-1 font-medium">kg</span>
              </div>
              
              <div className="text-xs text-slate-500 mt-3 flex items-center gap-1 z-10 relative">
                <ArrowUpRight size={14} className="text-emerald-400" />
                Alcanzado el {Array.isArray(rec.fechaAlcanzado || rec.fecha) ? (rec.fechaAlcanzado || rec.fecha).join('-') : (rec.fechaAlcanzado || rec.fecha || 'Desconocida')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
