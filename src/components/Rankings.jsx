import { useState, useEffect } from 'react';
import { getAllEjercicios } from '../services/ejercicioService';
import { getRankingPorEjercicio } from '../services/progressService';
import { useAuth } from '../context/AuthContext';

export default function Rankings() {
  const { user } = useAuth();
  const [ejercicios, setEjercicios] = useState([]);
  const [selectedEjercicioId, setSelectedEjercicioId] = useState('');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(false);

  useEffect(() => {
    loadEjercicios();
  }, []);

  useEffect(() => {
    if (selectedEjercicioId) {
      loadRanking(selectedEjercicioId);
    }
  }, [selectedEjercicioId]);

  const loadEjercicios = async () => {
    try {
      setLoading(true);
      const data = await getAllEjercicios();
      setEjercicios(data);
      if (data.length > 0) {
        setSelectedEjercicioId(data[0].id || data[0].ejercicioId || '');
      }
    } catch (err) {
      console.error('Error al cargar ejercicios:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRanking = async (ejercicioId) => {
    try {
      setLoadingRanking(true);
      const data = await getRankingPorEjercicio(ejercicioId, 0, 50); // Get top 50
      setRanking(data.content || data || []);
    } catch (err) {
      console.error('Error al cargar el ranking:', err);
      setRanking([]);
    } finally {
      setLoadingRanking(false);
    }
  };

  const getMedalColor = (index) => {
    if (index === 0) return 'var(--warning)'; // Gold
    if (index === 1) return '#94a3b8'; // Silver
    if (index === 2) return '#b45309'; // Bronze
    return 'transparent';
  };

  const getMedalIcon = (index) => {
    if (index > 2) return null;
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={getMedalColor(index)} stroke={getMedalColor(index)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
        <path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10" /><path d="M17 4v8a5 5 0 0 1-10 0V4" /><path d="M4 9h3" /><path d="M17 9h3" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="card p-xl flex-center flex-col animate-pulse" style={{ height: '400px' }}>
        <div className="empty-state-icon mb-sm" style={{ opacity: 0.5 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10" /><path d="M17 4v8a5 5 0 0 1-10 0V4" />
          </svg>
        </div>
        <p className="text-secondary">Cargando gimnasio de campeones...</p>
      </div>
    );
  }

  const selectedEj = ejercicios.find(e => String(e.id || e.ejercicioId) === String(selectedEjercicioId));

  return (
    <div className="animate-fade-in-up flex-col gap-lg">
      <div className="section-header">
        <div>
          <h2 className="section-title text-2xl font-bold flex items-center gap-sm">
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(210,153,34,0.15), rgba(210,153,34,0.05))',
              border: '1px solid rgba(210,153,34,0.2)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10" /><path d="M17 4v8a5 5 0 0 1-10 0V4" /><path d="M4 9h3" /><path d="M17 9h3" />
              </svg>
            </span>
            Ranking Global
          </h2>
          <p className="text-secondary text-sm mt-xs">
            Compara tus récords personales con toda la comunidad de FitPlace.
          </p>
        </div>
      </div>

      <div className="card-glow p-lg">
        <div className="flex-between items-center mb-md" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <h3 className="font-bold text-lg text-primary">
            Top Levantadores: <span className="text-accent">{selectedEj?.nombre || 'Ejercicio'}</span>
          </h3>
          <div className="form-group" style={{ margin: 0, minWidth: '220px' }}>
            <select 
              className="input" 
              value={selectedEjercicioId} 
              onChange={(e) => setSelectedEjercicioId(e.target.value)}
              disabled={loadingRanking}
            >
              {ejercicios.map(ej => (
                <option key={ej.id || ej.ejercicioId} value={ej.id || ej.ejercicioId}>
                  {ej.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingRanking ? (
          <div className="flex-col gap-sm mt-lg">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-shimmer" style={{ height: '70px', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : ranking.length === 0 ? (
          <div className="empty-state animate-scale-in" style={{ height: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="empty-state-icon flex-center mx-auto mb-md" style={{ opacity: 0.5 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Sin Récords</h3>
            <p className="text-secondary mt-xs max-w-md mx-auto">
              Nadie ha registrado un récord personal para este ejercicio todavía. ¡Sé el primero!
            </p>
          </div>
        ) : (
          <div className="flex-col gap-sm mt-lg">
            {ranking.map((rec, index) => {
              const isCurrentUser = rec.nombreUsuario === user?.username;
              const isPodium = index < 3;
              
              return (
                <div 
                  key={rec.id} 
                  className={`card p-md flex-between items-center animate-fade-in-up ${isCurrentUser ? 'border-accent' : ''}`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    background: isPodium ? `linear-gradient(90deg, ${getMedalColor(index)}11, transparent)` : 'var(--bg-secondary)',
                    borderColor: isCurrentUser ? 'var(--accent)' : 'var(--border)'
                  }}
                >
                  <div className="flex items-center gap-md">
                    <div style={{ width: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: isPodium ? '1.2rem' : '1rem', color: isPodium ? getMedalColor(index) : 'var(--text-muted)' }}>
                      #{index + 1}
                    </div>
                    {isPodium ? (
                      <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${getMedalColor(index)}22` }}>
                        {getMedalIcon(index)}
                      </div>
                    ) : (
                      <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-primary)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {rec.nombreUsuario.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-primary flex items-center gap-xs">
                        {rec.nombreUsuario}
                        {isCurrentUser && <span className="badge-accent" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>TÚ</span>}
                      </div>
                      <div className="text-xs text-secondary mt-xs">
                        {rec.fechaLogro ? new Date(rec.fechaLogro).toLocaleDateString() : 'Desconocida'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-black" style={{ color: isPodium ? getMedalColor(index) : 'var(--primary)', textShadow: isPodium ? `0 0 10px ${getMedalColor(index)}44` : 'none' }}>
                      {rec.pesoMaximo} <span className="text-sm font-medium text-secondary">kg</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
