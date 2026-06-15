import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMisGimnasios, updateGimnasio, activarSuscripcion } from '../services/adminService';

export default function AdminGimnasioPanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [miGimnasio, setMiGimnasio] = useState(null);
  const [toast, setToast] = useState('');
  const [subIdInput, setSubIdInput] = useState('');

  // Forms
  const [gymForm, setGymForm] = useState({ nombre: '', direccion: '', horarioApertura: '08:00', horarioCierre: '22:00', diasAbierto: [], precioCuota: 0 });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (user?.rol === 'ADMIN_GIMNASIO') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getMisGimnasios();
      if (data && data.length > 0) {
        const gym = data[0];
        setMiGimnasio(gym);
        setGymForm({
          nombre: gym.nombre || '',
          direccion: gym.direccion || '',
          horarioApertura: gym.horarioApertura?.substring(0, 5) || '08:00',
          horarioCierre: gym.horarioCierre?.substring(0, 5) || '22:00',
          diasAbierto: gym.diasAbierto || ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'],
          precioCuota: gym.precioCuota || 0
        });
      }
    } catch (err) {
      console.error('Error loading gym', err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.rol !== 'ADMIN_GIMNASIO') {
    return <div className="alert alert-error">Exclusivo para Dueños/Administradores de Gimnasios.</div>;
  }

  const handleUpdateGym = async (e) => {
    e.preventDefault();
    try {
      await updateGimnasio({
        ...gymForm,
        horarioApertura: gymForm.horarioApertura + ':00',
        horarioCierre: gymForm.horarioCierre + ':00'
      });
      showToast('Configuración del gimnasio actualizada');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar el gimnasio');
    }
  };

  const handleActivar = async (e) => {
    e.preventDefault();
    if (!subIdInput) return;
    try {
      await activarSuscripcion(subIdInput);
      showToast('Suscripción activada con éxito');
      setSubIdInput('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al activar suscripción');
    }
  };

  return (
    <div className="animate-fade-in flex-col gap-lg">

      {/* ── Header ──────────────────────────────── */}
      <div className="section-header">
        <div>
          <h2 className="section-title text-2xl font-bold flex items-center gap-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', color: 'var(--accent)' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Mi Gimnasio
          </h2>
          <p className="text-secondary text-sm mt-sm">
            Configura los datos de tu local y activa suscripciones manualmente.
          </p>
        </div>
      </div>

      {/* ── Loading skeleton ────────────────────── */}
      {loading ? (
        <div className="flex gap-lg">
          <div className="animate-shimmer" style={{ flex: '0 0 65%', height: 320, borderRadius: 'var(--radius-lg)' }} />
          <div className="animate-shimmer" style={{ flex: 1, height: 320, borderRadius: 'var(--radius-lg)' }} />
        </div>
      ) : !miGimnasio ? (

        /* ── Empty State ────────────────────────── */
        <div className="empty-state animate-scale-in">
          <div className="empty-state-icon flex-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold">Gimnasio No Encontrado</h3>
          <p className="text-secondary">
            Aún no tienes un gimnasio asignado a tu cuenta. Contacta al soporte o al administrador para que te asigne uno.
          </p>
        </div>
      ) : (

        /* ── Two-column layout ─────────────────── */
        <div className="flex gap-lg items-start animate-fade-in-up" style={{ flexWrap: 'wrap' }}>

          {/* ── LEFT: Gym config (~65%) ─────────── */}
          <div className="flex-col gap-lg" style={{ flex: '1 1 62%', minWidth: 360 }}>
            <div className="card-glow p-xl">

              {/* Title row */}
              <div className="flex items-center gap-md mb-lg">
                <div className="flex-center" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-glow)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12" y2="18.01"/>
                    <path d="M8 6h8"/>
                    <path d="M8 10h8"/>
                    <path d="M8 14h4"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{miGimnasio.nombre}</h3>
                  <p className="text-secondary text-sm">Configuración del local</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="badge-accent">Activo</span>
                </div>
              </div>

              {/* Quick stat-cards */}
              <div className="flex gap-md mb-lg" style={{ flexWrap: 'wrap' }}>
                <div className="stat-card" style={{ flex: 1, minWidth: 140 }}>
                  <div className="stat-label flex items-center gap-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    Precio Cuota
                  </div>
                  <div className="stat-value text-accent">
                    ${gymForm.precioCuota}
                  </div>
                </div>

                <div className="stat-card" style={{ flex: 1, minWidth: 140 }}>
                  <div className="stat-label flex items-center gap-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Apertura
                  </div>
                  <div className="stat-value">{gymForm.horarioApertura}</div>
                </div>

                <div className="stat-card" style={{ flex: 1, minWidth: 140 }}>
                  <div className="stat-label flex items-center gap-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 8 14"/>
                    </svg>
                    Cierre
                  </div>
                  <div className="stat-value">{gymForm.horarioCierre}</div>
                </div>
              </div>

              <hr className="divider" />

              {/* Edit form */}
              <form onSubmit={handleUpdateGym} className="flex-col gap-md mt-md">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre del Gimnasio</label>
                    <input
                      required
                      className="input"
                      placeholder="Ej: FitPlace Central"
                      value={gymForm.nombre}
                      onChange={e => setGymForm({...gymForm, nombre: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <input
                      required
                      className="input"
                      placeholder="Ej: Av. Siempreviva 742"
                      value={gymForm.direccion}
                      onChange={e => setGymForm({...gymForm, direccion: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Horario Apertura</label>
                    <input
                      type="time"
                      required
                      className="input"
                      value={gymForm.horarioApertura}
                      onChange={e => setGymForm({...gymForm, horarioApertura: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Horario Cierre</label>
                    <input
                      type="time"
                      required
                      className="input"
                      value={gymForm.horarioCierre}
                      onChange={e => setGymForm({...gymForm, horarioCierre: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio de la Cuota ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="input"
                      value={gymForm.precioCuota}
                      onChange={e => setGymForm({...gymForm, precioCuota: e.target.value})}
                    />
                  </div>
                  <div style={{ flex: 1 }} />
                </div>

                <div className="mt-sm">
                  <button type="submit" className="btn-primary btn-full w-full">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── RIGHT: Validar Acceso (~35%) ────── */}
          <div className="flex-col gap-lg" style={{ flex: '1 1 33%', minWidth: 300 }}>
            <div className="card p-xl relative overflow-hidden" style={{ background: 'linear-gradient(160deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)' }}>

              {/* Decorative background shield */}
              <div style={{ position: 'absolute', right: -30, top: -30, opacity: 0.04, pointerEvents: 'none' }}>
                <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1" style={{ display: 'inline-block' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>

              {/* Title row */}
              <div className="flex items-center gap-md mb-sm" style={{ position: 'relative', zIndex: 1 }}>
                <div className="flex-center" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(46, 160, 67, 0.12)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Validar Acceso</h3>
                </div>
              </div>

              <p className="text-secondary text-sm mb-lg" style={{ position: 'relative', zIndex: 1, lineHeight: 1.7 }}>
                Cuando un alumno se anota al gimnasio, te mostrará un código. Ingresalo acá para activar su membresía.
              </p>

              <hr className="divider" />

              <form onSubmit={handleActivar} className="flex-col gap-md mt-md" style={{ position: 'relative', zIndex: 1 }}>
                <div className="form-group">
                  <label className="text-sm font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                    Código de Activación
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                      lineHeight: 1
                    }}>#</span>
                    <input
                      type="number"
                      required
                      className="input"
                      placeholder="0000"
                      value={subIdInput}
                      onChange={e => setSubIdInput(e.target.value)}
                      style={{
                        paddingLeft: 42,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        height: 64,
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderColor: 'var(--border-hover)'
                      }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary btn-full w-full">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Aprobar Membresía
                </button>
              </form>

              {/* Info note */}
              <div className="flex items-center gap-sm mt-lg p-md" style={{ background: 'rgba(1, 105, 255, 0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(1, 105, 255, 0.12)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span className="text-xs text-secondary">
                  El alumno recibe el código al inscribirse desde la app.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────── */}
      {toast && (
        <div className="toast toast-success animate-fade-in-up">
          <div className="toast-success-dot" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}
    </div>
  );
}
