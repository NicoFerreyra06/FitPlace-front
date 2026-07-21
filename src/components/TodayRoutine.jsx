import { useState, useEffect } from 'react';
import { getTodayRoutine } from '../services/routineService';
import { getAllEjercicios } from '../services/ejercicioService';

const DAY_TRANSLATION = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

export default function TodayRoutine({ onNavigate }) {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ACTIVE'); // ACTIVE, NO_ROUTINE, REST_DAY, ERROR
  const [allEjercicios, setAllEjercicios] = useState([]);

  useEffect(() => {
    loadTodayRoutine();
    getAllEjercicios().then(data => setAllEjercicios(data || [])).catch(console.error);
  }, []);

  const loadTodayRoutine = async () => {
    try {
      setLoading(true);
      const data = await getTodayRoutine();
      setRoutine(data);
      setStatus('ACTIVE');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('No tiene rutina activa')) {
        setStatus('NO_ROUTINE');
      } else if (msg.includes('no tiene día configurado')) {
        setStatus('REST_DAY');
      } else {
        setStatus('ERROR');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse card p-lg"><div className="h-32 bg-tertiary rounded"></div></div>;
  }

  if (status === 'NO_ROUTINE') {
    return (
      <div className="empty-state animate-fade-in-up card-glow">
        <div className="empty-state-icon" style={{ opacity: 0.7 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
        </div>
        <h3>¡Es hora de empezar!</h3>
        <p>No tienes ninguna rutina activa en este momento. Crea una nueva o activa una de tus rutinas guardadas para comenzar a entrenar.</p>
        <div className="empty-state-actions">
          <button className="btn btn-primary" onClick={() => onNavigate('crearRutina')}>
            Crear Nueva Rutina
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('misRutinas')}>
            Ver Mis Rutinas
          </button>
        </div>
      </div>
    );
  }

  if (status === 'REST_DAY') {
    return (
      <div className="empty-state animate-fade-in-up" style={{ borderColor: 'var(--success)' }}>
        <div className="empty-state-icon" style={{ opacity: 0.7, color: 'var(--success)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
        </div>
        <h3 className="text-success">Día de Descanso</h3>
        <p>Tu rutina activa no tiene ejercicios programados para hoy. ¡Aprovecha para descansar y recuperar energías!</p>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="alert alert-error">
        Error al cargar la rutina de hoy. Por favor, intenta nuevamente más tarde.
      </div>
    );
  }

  if (!routine) return null;

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">Ejercicios de Hoy</h2>
          <p className="text-secondary mt-xs">{DAY_TRANSLATION[routine.diaDeLaSemana]}</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('entrenamiento')}>
          Registrar Entrenamiento
        </button>
      </div>

      {routine.ejercicioRutinas?.length === 0 ? (
        <div className="card p-md text-center text-secondary">
          No hay ejercicios cargados para este día.
        </div>
      ) : (
        <div className="exercise-list">
          {routine.ejercicioRutinas.map((ej, idx) => {
            const fullExercise = ej.ejercicio || allEjercicios.find(e => e.id === ej.ejercicioId || e.nombre === ej.nombreEjercicio);
            
            return (
            <div key={ej.id || idx} className="exercise-card animate-scale-in" style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}>
              <div>
                <h4 className="exercise-name">{ej.nombreEjercicio}</h4>
                <p className="exercise-detail">
                  {ej.series} series x {ej.repeticiones} repeticiones
                </p>
                
                {/* Músculos afectados */}
                {fullExercise && (fullExercise.musculoPrincipal || fullExercise.musculosSecundarios?.length > 0) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '8px' }}>
                    {fullExercise.musculoPrincipal && (
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        color: 'var(--accent)', 
                        background: 'rgba(55, 71, 244, 0.1)', 
                        border: '1px solid rgba(55, 71, 244, 0.2)', 
                        padding: '2px 8px', 
                        borderRadius: '999px' 
                      }}>
                        {fullExercise.musculoPrincipal?.nombre || fullExercise.musculoPrincipal}
                      </span>
                    )}
                    {fullExercise.musculosSecundarios?.map((m, mIdx) => (
                      <span key={m.id || mIdx} style={{ 
                        fontSize: '11px', 
                        fontWeight: '500', 
                        color: 'var(--text-secondary)', 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border)', 
                        padding: '2px 8px', 
                        borderRadius: '999px' 
                      }}>
                        {m.nombre || m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
