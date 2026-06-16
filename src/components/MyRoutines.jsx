import { useState, useEffect } from 'react';
import { getMyRoutines, deleteRutina, activarRutina } from '../services/routineService';
import { useAuth } from '../context/AuthContext';

const ALL_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_INITIALS = {
  MONDAY: 'L',
  TUESDAY: 'M',
  WEDNESDAY: 'M',
  THURSDAY: 'J',
  FRIDAY: 'V',
  SATURDAY: 'S',
  SUNDAY: 'D',
};

export default function MyRoutines({ onNavigate, onEdit }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState({ routineId: null, dayKey: null });
  const [routineToDelete, setRoutineToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [activeRoutineId, setActiveRoutineId] = useState(() => {
    return localStorage.getItem('activeRoutineId');
  });

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
      const data = await getMyRoutines();
      setRoutines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activarRutina(id);
      localStorage.setItem('activeRoutineId', id.toString());
      setActiveRoutineId(id.toString());
      showToast('Rutina activada con éxito');
    } catch (err) {
      showToast('Error al activar rutina');
    }
  };

  const handleDeleteClick = (routine) => {
    setDeleteError('');
    setRoutineToDelete(routine);
  };

  const confirmDelete = async () => {
    if (!routineToDelete) return;
    setDeleteError('');
    try {
      await deleteRutina(routineToDelete.id);
      setRoutines(routines.filter(r => r.id !== routineToDelete.id));
      if (activeRoutineId === routineToDelete.id.toString()) {
        localStorage.removeItem('activeRoutineId');
        setActiveRoutineId(null);
      }
      setRoutineToDelete(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error desconocido al eliminar.';
      setDeleteError(msg);
    }
  };

  if (loading) {
    return <div className="animate-pulse card p-lg h-32"></div>;
  }

  return (
    <div className="animate-fade-in flex-col gap-lg">
      <div className="section-header">
        <h2 className="section-title">Mis Rutinas</h2>
        <button className="btn btn-primary" onClick={() => onNavigate('crearRutina')}>
          + Nueva Rutina
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon" style={{ opacity: 0.7 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <h3>No tienes rutinas</h3>
          <p>Crea tu primera rutina para empezar a organizar tus entrenamientos.</p>
        </div>
      ) : (
        <div className="routine-grid">
          {routines.map((routine, index) => {
            const isActive = activeRoutineId === routine.id.toString();
            const isExpanded = selectedDay.routineId === routine.id;
            const expandedDay = isExpanded ? routine.diaRutinas?.find(d => d.diaDeLaSemana === selectedDay.dayKey) : null;
            
            return (
              <div key={routine.id} className={`routine-card animate-scale-in ${isActive ? 'active' : ''}`} style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}>
                {isActive && <div className="active-badge">Activa</div>}
                
                <h3 className="routine-card-title">{routine.nombre}</h3>
                
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
                  {!isActive && (
                    <button className="btn btn-secondary flex-1" onClick={() => handleActivate(routine.id)}>
                      Activar
                    </button>
                  )}
                  <button className="btn btn-ghost flex-1" onClick={() => onEdit(routine)}>
                    Editar
                  </button>
                  <button className="btn btn-danger flex-1" onClick={() => handleDeleteClick(routine)}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {routineToDelete && (
        <div className="modal-overlay" onClick={() => setRoutineToDelete(null)}>
          <div className="modal-content p-lg text-center animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px' }}>
            <h3 className="font-bold text-xl mb-xs">¿Eliminar Rutina?</h3>
            <p className="text-secondary mb-md">
              Estás a punto de eliminar <strong>"{routineToDelete.nombre}"</strong>. Esta acción no se puede deshacer.
            </p>
            
            {deleteError && (
              <div className="alert alert-error mb-md text-sm text-left">
                <strong>Error:</strong> {deleteError}
              </div>
            )}

            <div className="flex gap-sm">
              <button className="btn btn-secondary flex-1" onClick={() => setRoutineToDelete(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger flex-1" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
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
