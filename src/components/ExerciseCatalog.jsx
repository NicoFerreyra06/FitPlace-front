import { useState, useEffect } from 'react';
import { getAllEjercicios, buscarEjercicios } from '../services/ejercicioService';
import { Dumbbell, Search, Sparkles, Filter, ShieldAlert } from 'lucide-react';

export default function ExerciseCatalog() {
  const [exercises, setExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadExercises = async (query = '') => {
    try {
      setLoading(true);
      setError('');
      if (query.trim()) {
        const data = await buscarEjercicios(query);
        setExercises(data || []);
      } else {
        const data = await getAllEjercicios();
        setExercises(data || []);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los ejercicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadExercises(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    loadExercises('');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="text-neon-blue" /> Catálogo de Ejercicios
          </h2>
          <p className="text-slate-400">Busca y explora ejercicios disponibles en el sistema.</p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-card border border-dark-border rounded-xl py-2 pl-9 pr-4 text-sm focus:border-neon-blue outline-none text-slate-200"
            />
          </div>
          <button 
            type="submit" 
            className="bg-neon-blue text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-neon-blue/90 transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-2">
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400">Buscando ejercicios...</div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl text-slate-500">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-slate-300">No se encontraron resultados</h3>
          <p className="text-sm mt-1 text-slate-400">Intenta buscar con otros términos o limpia tu búsqueda.</p>
          <button 
            onClick={clearSearch} 
            className="mt-4 text-xs font-semibold text-neon-blue hover:underline"
          >
            Limpiar Búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex, idx) => (
            <div key={ex.id || idx} className="bg-dark-card p-5 rounded-xl border border-dark-border hover:border-neon-blue/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg text-slate-200 group-hover:text-white transition-colors">{ex.nombre}</h3>
                </div>
                
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">{ex.descripcion || 'Sin descripción disponible.'}</p>
                
                {/* Musculos */}
                <div className="mt-4 space-y-2">
                  {ex.musculoPrincipal && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Músculo Principal:</span>
                      <span className="text-xs font-bold text-neon-blue bg-neon-blue/10 border border-neon-blue/20 px-2 py-0.5 rounded-full">
                        {ex.musculoPrincipal.nombre}
                      </span>
                    </div>
                  )}
                  {ex.musculosSecundarios && ex.musculosSecundarios.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-500">Músculos Secundarios:</span>
                      {ex.musculosSecundarios.map((m, mIdx) => (
                        <span key={m.id || mIdx} className="text-[10px] font-medium text-slate-400 bg-dark-bg border border-dark-border px-2 py-0.5 rounded-full">
                          {m.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
