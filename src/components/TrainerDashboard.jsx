import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAlumnos } from '../services/socialService';
import { getRecordsPersonales, getHistorialEntrenamientos } from '../services/progressService';
import { getMyRoutines, asignarRutinaAAlumno } from '../services/routineService';
import CustomSelect from './CustomSelect';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [prs, setPrs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const [myRoutines, setMyRoutines] = useState([]);
  const [selectedRoutineToAssign, setSelectedRoutineToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (user?.rol === 'ENTRENADOR') {
      loadAlumnos();
      loadRoutines();
    }
  }, [user]);

  const loadRoutines = async () => {
    try {
      const data = await getMyRoutines();
      setMyRoutines(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAlumnos = async () => {
    setLoading(true);
    try {
      const data = await getAlumnos();
      setAlumnos(data || []);
    } catch (err) {
      console.error('Error al cargar alumnos', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlumno = async (alumno) => {
    setSelectedAlumno(alumno);
    setLoadingStats(true);
    try {
      const [prData, logsData] = await Promise.all([
        getRecordsPersonales(alumno.id),
        getHistorialEntrenamientos(alumno.id, 0, 5)
      ]);
      setPrs(prData || []);
      setLogs(logsData.content || logsData || []);
    } catch (err) {
      console.error('Error loading stats', err);
      setPrs([]);
      setLogs([]);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAssignRoutine = async () => {
    if (!selectedRoutineToAssign || !selectedAlumno) return;
    setAssigning(true);
    try {
      await asignarRutinaAAlumno(selectedAlumno.id, selectedRoutineToAssign);
      showToast(`¡Rutina asignada exitosamente a ${selectedAlumno.username}!`);
      setSelectedRoutineToAssign('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al asignar la rutina.');
    } finally {
      setAssigning(false);
    }
  };

  if (user?.rol !== 'ENTRENADOR') {
    return <div className="alert alert-error">Área exclusiva para entrenadores.</div>;
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  const computeIMC = (peso, altura) => {
    if (!peso || !altura || altura <= 0) return '—';
    const imc = peso / (altura * altura);
    return imc.toFixed(1);
  };

  return (
    <div className="animate-fade-in flex-col gap-lg">
      {/* ── Header ─────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(1,105,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div className="section-header">
          <div>
            <h2 className="text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>
              <span className="flex items-center gap-sm">
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(1,105,255,0.15), rgba(1,105,255,0.05))',
                  border: '1px solid rgba(1,105,255,0.2)',
                  flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                Panel de Entrenador
              </span>
            </h2>
            <p className="text-secondary text-sm mt-sm">
              Monitorea el progreso, récords y actividad de tus alumnos en tiempo real.
            </p>
          </div>
          <span className="badge-accent" style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {alumnos.length} {alumnos.length === 1 ? 'alumno' : 'alumnos'}
          </span>
        </div>
      </div>

      {/* ── Two-Column Layout ──────────────────── */}
      <div className="flex gap-lg" style={{ alignItems: 'flex-start' }}>

        {/* ── LEFT COLUMN: Alumno List (30%) ──── */}
        <div className="flex-col gap-sm" style={{ width: '30%', minWidth: '260px', flexShrink: 0 }}>
          <div className="card p-lg flex-col gap-sm">
            <div className="flex-between items-center mb-sm">
              <h3 className="font-semibold text-lg flex items-center gap-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                Mis Alumnos
              </h3>
              <span className="badge-accent" style={{ fontSize: '0.7rem' }}>{alumnos.length}</span>
            </div>
            <div className="divider" style={{ margin: '0 0 4px' }} />

            {loading ? (
              <div className="flex-col gap-sm">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-shimmer" style={{ height: '60px', borderRadius: 'var(--radius-md)' }} />
                ))}
              </div>
            ) : alumnos.length === 0 ? (
              <div className="flex-col flex-center p-lg gap-sm" style={{ opacity: 0.6 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
                <p className="text-muted text-sm text-center">No tienes alumnos asignados aún.</p>
              </div>
            ) : (
              <div className="flex-col gap-xs" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                {alumnos.map((al, idx) => {
                  const isSelected = selectedAlumno?.id === al.id;
                  return (
                    <button
                      key={al.id}
                      onClick={() => handleSelectAlumno(al)}
                      className={isSelected ? 'card-glow animate-fade-in' : 'friend-card'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '12px 16px',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(1,105,255,0.06)' : undefined,
                        animationDelay: `${idx * 40}ms`,
                      }}
                    >
                      <div className="friend-avatar" style={isSelected ? {
                        background: 'var(--accent)',
                        color: '#fff',
                        boxShadow: '0 0 12px rgba(1,105,255,0.4)',
                      } : {}}>
                        {getInitials(al.username)}
                      </div>
                      <div className="friend-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                        <span className={`font-semibold text-sm ${isSelected ? 'text-accent' : 'text-primary'}`} style={{ display: 'block' }}>
                          {al.username}
                        </span>
                        <span className="text-xs text-muted truncate" style={{ display: 'block', maxWidth: '100%' }}>
                          {al.email}
                        </span>
                      </div>
                      {isSelected && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', flexShrink: 0 }}>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Detail Panel (70%) ── */}
        <div className="flex-col gap-lg" style={{ flex: 1, minWidth: 0 }}>

          {!selectedAlumno ? (
            /* ── Empty State ──────────────────── */
            <div className="empty-state animate-fade-in" style={{ borderStyle: 'dashed' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(1,105,255,0.1), rgba(1,105,255,0.03))',
                border: '1px solid rgba(1,105,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', opacity: 0.7 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="font-bold">Selecciona un alumno</h3>
              <p className="text-secondary">
                Elige un alumno de la lista para ver sus estadísticas, récords personales y actividad reciente.
              </p>
            </div>
          ) : (
            <>
              {/* ── Assign Routine Section ────────── */}
              <div className="card p-lg animate-fade-in-up" style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(1, 105, 255, 0.05))',
                borderColor: 'rgba(139, 92, 246, 0.2)'
              }}>
                <h3 className="font-bold mb-sm text-lg flex items-center gap-xs text-accent">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  Asignar Rutina a {selectedAlumno.username}
                </h3>
                <div className="flex gap-md" style={{ alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label>Elegí una de tus rutinas</label>
                    <CustomSelect
                      options={myRoutines.map(r => ({ value: r.id, label: r.nombre }))}
                      value={selectedRoutineToAssign}
                      onChange={val => setSelectedRoutineToAssign(val)}
                      placeholder="-- Seleccionar Rutina --"
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleAssignRoutine}
                    disabled={!selectedRoutineToAssign || assigning}
                    style={{ height: '45px' }}
                  >
                    {assigning ? 'Asignando...' : 'Asignar'}
                  </button>
                </div>
              </div>

              {/* ── Stats Row ──────────────────── */}
              <div className="animate-scale-in" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
              }}>
                {/* Username */}
                <div className="stat-card p-md" style={{
                  borderColor: 'rgba(1,105,255,0.2)',
                  background: 'linear-gradient(135deg, rgba(1,105,255,0.06) 0%, var(--bg-secondary) 100%)',
                }}>
                  <div className="stat-label flex items-center gap-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Alumno
                  </div>
                  <div className="stat-value text-xl text-accent">{selectedAlumno.username}</div>
                </div>

                {/* Racha */}
                <div className="stat-card p-md" style={{
                  borderColor: 'rgba(210,153,34,0.2)',
                  background: 'linear-gradient(135deg, rgba(210,153,34,0.06) 0%, var(--bg-secondary) 100%)',
                }}>
                  <div className="stat-label flex items-center gap-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                      <path d="M12 2c.5 3.5 3 6 3 9a6 6 0 0 1-12 0c0-3 2.5-5.5 3-9" />
                      <path d="M12 15a3 3 0 0 0 3-3c0-1.5-1-2.5-1.5-4.5-.5 2-1.5 3-1.5 4.5a3 3 0 0 0 3 3" />
                    </svg>
                    Racha
                  </div>
                  <div className="stat-value text-xl text-warning">{selectedAlumno.rachaDias || 0}<span className="text-sm text-secondary font-medium"> días</span></div>
                </div>

                {/* Peso */}
                <div className="stat-card p-md">
                  <div className="stat-label flex items-center gap-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                      <circle cx="12" cy="5" r="3" />
                      <path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.23A2 2 0 0 0 4 21h16a2 2 0 0 0 1.9-2.77l-2.495-8.77A2 2 0 0 0 17.5 8" />
                    </svg>
                    Peso
                  </div>
                  <div className="stat-value text-xl">{selectedAlumno.peso || '—'}<span className="text-sm text-secondary font-medium"> kg</span></div>
                </div>

                {/* Altura */}
                <div className="stat-card p-md">
                  <div className="stat-label flex items-center gap-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                      <path d="M2 12h5" />
                      <path d="M2 6h3" />
                      <path d="M2 18h3" />
                      <path d="M7 3v18" />
                      <path d="M17 10l-5-3 5-3v6z" />
                    </svg>
                    Altura
                  </div>
                  <div className="stat-value text-xl">{selectedAlumno.altura || '—'}<span className="text-sm text-secondary font-medium"> m</span></div>
                </div>

                {/* IMC */}
                <div className="stat-card p-md">
                  <div className="stat-label flex items-center gap-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    IMC
                  </div>
                  <div className="stat-value text-xl">{computeIMC(selectedAlumno.peso, selectedAlumno.altura)}</div>
                </div>
              </div>

              {loadingStats ? (
                <div className="flex-col gap-md">
                  <div className="animate-shimmer" style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} />
                  <div className="animate-shimmer" style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} />
                </div>
              ) : (
                <>
                  {/* ── PR Card ────────────────── */}
                  <div className="card p-lg animate-fade-in-up">
                    <div className="flex-between items-center mb-md">
                      <h3 className="font-bold text-lg flex items-center gap-sm">
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(210,153,34,0.1)',
                          border: '1px solid rgba(210,153,34,0.2)',
                          flexShrink: 0,
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                            <path d="M8 21h8" />
                            <path d="M12 17v4" />
                            <path d="M7 4h10" />
                            <path d="M17 4v8a5 5 0 0 1-10 0V4" />
                            <path d="M4 9h3" />
                            <path d="M17 9h3" />
                          </svg>
                        </span>
                        Récords Personales
                      </h3>
                      {prs.length > 0 && (
                        <span className="badge-warning" style={{ fontSize: '0.7rem' }}>{prs.length} PRs</span>
                      )}
                    </div>

                    {prs.length === 0 ? (
                      <div className="flex-col flex-center p-lg gap-sm" style={{ opacity: 0.5 }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                          <path d="M8 21h8" />
                          <path d="M12 17v4" />
                          <path d="M7 4h10" />
                          <path d="M17 4v8a5 5 0 0 1-10 0V4" />
                        </svg>
                        <p className="text-muted text-sm">El alumno aún no tiene récords registrados.</p>
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '12px',
                      }}>
                        {prs.map((pr, idx) => (
                          <div
                            key={pr.id}
                            className="pr-card p-md animate-fade-in-up"
                            style={{
                              borderRadius: 'var(--radius-md)',
                              animationDelay: `${idx * 60}ms`,
                            }}
                          >
                            <div className="stat-label truncate" style={{ marginBottom: '6px', fontSize: '0.75rem' }}>
                              {pr.nombreEjercicio}
                            </div>
                            <div className="stat-value flex items-center gap-xs" style={{ fontSize: '1.5rem' }}>
                              <span className="text-warning">{pr.pesoMaximo}</span>
                              <span className="text-xs text-muted font-medium">kg</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Activity Card ──────────── */}
                  <div className="card p-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex-between items-center mb-md">
                      <h3 className="font-bold text-lg flex items-center gap-sm">
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(46,160,67,0.1)',
                          border: '1px solid rgba(46,160,67,0.2)',
                          flexShrink: 0,
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                          </svg>
                        </span>
                        Actividad Reciente
                      </h3>
                      {logs.length > 0 && (
                        <span className="badge-success" style={{ fontSize: '0.7rem' }}>{logs.length} sesiones</span>
                      )}
                    </div>

                    {logs.length === 0 ? (
                      <div className="flex-col flex-center p-lg gap-sm" style={{ opacity: 0.5 }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <p className="text-muted text-sm">El alumno no ha registrado entrenamientos aún.</p>
                      </div>
                    ) : (
                      <div className="flex-col gap-sm">
                        {logs.map((log, idx) => (
                          <div
                            key={log.id}
                            className="training-card flex-between items-center animate-fade-in"
                            style={{
                              marginBottom: 0,
                              animationDelay: `${idx * 60}ms`,
                            }}
                          >
                            <div className="flex items-center gap-md">
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'rgba(46,160,67,0.08)',
                                border: '1px solid rgba(46,160,67,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="16" y1="13" x2="8" y2="13" />
                                  <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-primary">
                                  {log.rutina?.nombre || 'Rutina Desconocida'}
                                </div>
                                <div className="text-xs text-muted mt-sm" style={{ marginTop: '2px' }}>
                                  {log.fechaRealizacion}
                                </div>
                              </div>
                            </div>
                            <span className="badge-accent">
                              {log.ejerciciosRealizados?.length || 0} ejercicios
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast toast-success animate-fade-in-up" style={{ zIndex: 9999 }}>
          <div className="toast-success-dot"></div>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
