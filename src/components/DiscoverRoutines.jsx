import { useState, useEffect } from 'react';
import { getAllRoutines, activarRutina } from '../services/routineService';

const ALL_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_INITIALS = {
  MONDAY: 'L', TUESDAY: 'M', WEDNESDAY: 'M', THURSDAY: 'J', FRIDAY: 'V', SATURDAY: 'S', SUNDAY: 'D',
};

export default function DiscoverRoutines({ onNavigate }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState({ routineId: null, dayKey: null });
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const data = await getAllRoutines(0, 50);
      setRoutines(data.content || data || []);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar rutinas de la comunidad');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activarRutina(id);
      localStorage.setItem('activeRoutineId', id.toString());
      showToast('¡Rutina activada con éxito!');
      setTimeout(() => onNavigate('rutina'), 1500);
    } catch (err) {
      showToast('Error al activar rutina');
    }
  };

  if (loading) {
    return (
      <div className="gym-grid">
        {[1,2,3,4].map(i => <div key={i} className="animate-pulse card p-lg h-32"></div>)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex-col gap-lg relative">
      <div className="section-header">
        <div>
          <h2 className="section-title text-2xl font-bold flex items-center gap-sm">
            Descubrir Rutinas
          </h2>
          <p className="text-secondary text-sm mt-sm">
            Explorá las rutinas creadas por la comunidad y activalas con un clic.
          </p>
        </div>
      </div>

      {routines.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon" style={{ opacity: 0.7 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <h3>No hay rutinas públicas</h3>
          <p>Aún nadie ha creado rutinas en la plataforma.</p>
        </div>
      ) : (
        <div className="routine-grid">
          {routines.map((routine, index) => {
            const isExpanded = selectedDay.routineId === routine.id;
            const expandedDay = isExpanded ? routine.diaRutinas?.find(d => d.diaDeLaSemana === selectedDay.dayKey) : null;
            
            return (
              <div key={routine.id} className="routine-card animate-scale-in" style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}>
                
                <div className="flex-between mb-sm">
                  <h3 className="routine-card-title" style={{ marginBottom: 0 }}>{routine.nombre}</h3>
                  {routine.creador?.username && (
                    <span className="badge badge-accent text-xs">por @{routine.creador.username}</span>
                  )}
                </div>
                
                <div className="routine-calendar flex-between mt-md mb-md">
                  {ALL_DAYS.map(dayKey => {
                    const activeDay = routine.diaRutinas?.find(d => d.diaDeLaSemana === dayKey);
                    const exerciseCount = activeDay?.ejercicioRutinas?.length || 0;
                    
                    return (
                      <div 
                        key={dayKey} 
                        className={`calendar-day ${activeDay ? 'active' : ''} ${selectedDay.routineId === routine.id && selectedDay.dayKey === dayKey ? 'selected' : ''}`}
                        title={activeDay ? `${exerciseCount} ejercicios (Clic para ver)` : 'Descanso'}
                        onClick={() => {
                          if (activeDay) {
                            if (selectedDay.routineId === routine.id && selectedDay.dayKey === dayKey) {
                              setSelectedDay({ routineId: null, dayKey: null });
                            } else {
                              setSelectedDay({ routineId: routine.id, dayKey });
                            }
                          }
                        }}
                        style={{ cursor: activeDay ? 'pointer' : 'default' }}
                      >
                        {DAY_INITIALS[dayKey]}
                        {activeDay && <span className="calendar-day-dot"></span>}
                      </div>
                    );
                  })}
                </div>

                {isExpanded && expandedDay && (
                  <div className="animate-fade-in-up bg-tertiary p-sm rounded-md mb-md border border-border">
                    <div className="flex-between mb-sm">
                      <span className="text-xs font-bold text-accent uppercase">Ejercicios del Día</span>
                      <button className="text-xs text-muted pointer" onClick={() => setSelectedDay({ routineId: null, dayKey: null })}>✕</button>
                    </div>
                    <div className="flex-col gap-xs">
                      {expandedDay.ejercicioRutinas?.map(ex => (
                        <div key={ex.id || ex.ejercicioId} className="flex-between text-sm py-xs border-b border-border" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                          <span className="text-primary truncate" style={{ maxWidth: '70%' }}>{ex.nombreEjercicio}</span>
                          <span className="text-secondary font-bold" style={{ fontSize: '0.75rem' }}>{ex.series}x{ex.repeticiones}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="routine-actions mt-auto pt-md flex-wrap">
                  <button className="btn btn-primary flex-1 w-full" onClick={() => handleActivate(routine.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    ¡Usar esta rutina!
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="toast toast-success animate-fade-in-up" style={{ zIndex: 9999 }}>
          <div className="toast-success-dot"></div>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
