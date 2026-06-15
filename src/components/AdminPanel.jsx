import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllGimnasios } from '../services/gimnasioService';
import { createGimnasio, deleteGimnasio } from '../services/adminService';
import { getAllEjercicios, createEjercicio, deleteEjercicio } from '../services/ejercicioService';
import { getUsuarios, cambiarRol } from '../services/socialService';

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('gimnasios');

  const [gimnasios, setGimnasios] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Forms
  const [gymForm, setGymForm] = useState({ nombre: '', direccion: '', horarioApertura: '08:00', horarioCierre: '22:00', diasAbierto: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'], precioCuota: 50, adminId: '' });
  const [ejercicioForm, setEjercicioForm] = useState({ nombre: '', descripcion: '', musculosPrincipalesIds: [], musculosSecundariosIds: [] });

  useEffect(() => {
    if (user?.rol === 'ADMIN' || user?.rol === 'ADMIN_GIMNASIO') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const gymData = await getAllGimnasios(0, 100).catch(() => []);
      setGimnasios(gymData.content || gymData || []);

      const ejData = await getAllEjercicios().catch(() => []);
      setEjercicios(ejData || []);

      const usrData = await getUsuarios(0, 100).catch(err => {
        console.warn('No se pudieron cargar usuarios. Quizás falte rol ADMIN.', err);
        return [];
      });
      setUsuarios(usrData.content || usrData || []);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.rol !== 'ADMIN' && user?.rol !== 'ADMIN_GIMNASIO') {
    return <div className="alert alert-error">No tienes permisos para ver esta página.</div>;
  }

  // Handle Gym Creation
  const handleCreateGym = async (e) => {
    e.preventDefault();
    try {
      await createGimnasio({
        ...gymForm,
        horarioApertura: gymForm.horarioApertura + ':00',
        horarioCierre: gymForm.horarioCierre + ':00',
        adminId: parseInt(gymForm.adminId)
      });
      showToast('Gimnasio creado con éxito');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear gimnasio');
    }
  };

  // Handle Ejercicio Creation
  const handleCreateEjercicio = async (e) => {
    e.preventDefault();
    try {
      await createEjercicio(ejercicioForm);
      showToast('Ejercicio creado correctamente');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear ejercicio');
    }
  };

  const handleCambiarRol = async (userId, nuevoRol) => {
    try {
      await cambiarRol(userId, nuevoRol);
      showToast('Rol actualizado correctamente');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al cambiar rol');
    }
  };

  // ── Inline SVG Icons ──────────────────────────────────
  const IconShield = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );

  const IconBuilding = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
  );

  const IconDumbbell = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
      <path d="M6.5 6.5h11"/><path d="M17.5 17.5h-11"/><path d="M14.5 6.5 18 3"/><path d="M9.5 6.5 6 3"/><path d="M14.5 17.5 18 21"/><path d="M9.5 17.5 6 21"/><rect x="7" y="6" width="10" height="12" rx="1"/>
    </svg>
  );

  const IconPlus = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );

  const IconTrash = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );

  const IconCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  const IconUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );

  return (
    <div className="animate-fade-in flex-col gap-lg">

      {/* ── Header ─────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '300px',
          background: 'radial-gradient(circle, rgba(1,105,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div className="section-header flex-col" style={{ alignItems: 'flex-start', gap: '8px', position: 'relative' }}>
          <div className="flex items-center gap-md">
            <div style={{
              width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
              background: 'rgba(1,105,255,0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
            }}>
              <IconShield />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
                Panel de Administración
              </h2>
              <p className="text-secondary text-sm mt-sm">
                Gestiona gimnasios, ejercicios y catálogo muscular desde un solo lugar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────── */}
      <div className="stats-grid animate-fade-in-up">
        <div className="stat-card">
          <div className="flex items-center gap-sm mb-sm">
            <div style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(1,105,255,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
            }}>
              <IconBuilding />
            </div>
            <span className="stat-label" style={{ marginBottom: 0 }}>Gimnasios</span>
          </div>
          <div className="stat-value text-accent">{gimnasios.length}</div>
          <div className="stat-sub">Registrados en la plataforma</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-sm mb-sm">
            <div style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(46,160,67,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--success)'
            }}>
              <IconDumbbell />
            </div>
            <span className="stat-label" style={{ marginBottom: 0 }}>Ejercicios</span>
          </div>
          <div className="stat-value text-success">{ejercicios.length}</div>
          <div className="stat-sub">Disponibles en catálogo</div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────── */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'gimnasios' ? 'active' : ''}`}
          onClick={() => setActiveTab('gimnasios')}
        >
          <span className="flex items-center gap-sm">
            <IconBuilding />
            Gimnasios
          </span>
        </button>
        <button
          className={`tab ${activeTab === 'ejercicios' ? 'active' : ''}`}
          onClick={() => setActiveTab('ejercicios')}
        >
          <span className="flex items-center gap-sm">
            <IconDumbbell />
            Ejercicios
          </span>
        </button>
        <button
          className={`tab ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          <span className="flex items-center gap-sm">
            <IconUsers />
            Usuarios
          </span>
        </button>
      </div>

      {/* ── Tab Content ────────────────────────────── */}
      {loading ? (
        <div className="card p-xl flex-center" style={{ minHeight: '200px' }}>
          <div className="flex-col flex-center gap-md">
            <div className="spinner" />
            <span className="text-secondary text-sm">Cargando datos...</span>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in-up">

          {/* ══════════════════════════════════════════
              TAB: USUARIOS
              ══════════════════════════════════════════ */}
          {activeTab === 'usuarios' && (
            <div className="flex-col gap-lg">
              <div className="card p-lg">
                <div className="section-header">
                  <h3 className="section-title">Gestión de Usuarios y Roles</h3>
                  <span className="badge-accent">{usuarios.length} total</span>
                </div>
                
                <table className="data-table mt-md">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Rol Actual</th>
                      <th style={{ textAlign: 'right' }}>Cambiar Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id}>
                        <td><span className="badge-accent text-xs font-bold">#{u.id}</span></td>
                        <td><span className="font-semibold text-primary">{u.username}</span></td>
                        <td><span className="text-secondary">{u.email}</span></td>
                        <td>
                          <span className={`badge ${u.rol === 'ADMIN' ? 'badge-danger' : u.rol === 'ENTRENADOR' ? 'badge-accent' : 'badge-success'}`}>
                            {u.rol}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <select 
                            className="input" 
                            style={{ padding: '4px 8px', width: '160px', display: 'inline-block', fontSize: '0.85rem', opacity: user?.rol !== 'ADMIN' ? 0.5 : 1 }}
                            value={u.rol}
                            disabled={user?.rol !== 'ADMIN'}
                            onChange={(e) => {
                              if(confirm(`¿Estás seguro de cambiar el rol de ${u.username} a ${e.target.value}?`)) {
                                handleCambiarRol(u.id, e.target.value);
                              }
                            }}
                          >
                            <option value="USUARIO">USUARIO</option>
                            <option value="ENTRENADOR">ENTRENADOR</option>
                            <option value="ADMIN_GIMNASIO">ADMIN_GIMNASIO</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: GIMNASIOS
              ══════════════════════════════════════════ */}
          {activeTab === 'gimnasios' && (
            <div className="flex-col gap-lg">

              {/* Create Gym Form */}
              <div className="card-glow p-xl">
                <div className="section-header mb-lg">
                  <div className="flex items-center gap-sm">
                    <div style={{
                      width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(1,105,255,0.12)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                    }}>
                      <IconPlus />
                    </div>
                    <div>
                      <h3 className="section-title">Crear Nuevo Gimnasio</h3>
                      <p className="text-muted text-xs mt-sm">Complete los datos para registrar un nuevo gimnasio en la plataforma</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateGym} className="flex-col gap-lg">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre del Gimnasio</label>
                      <input
                        required
                        value={gymForm.nombre}
                        onChange={e => setGymForm({...gymForm, nombre: e.target.value})}
                        placeholder="Ej: FitCenter Elite"
                      />
                    </div>
                    <div className="form-group">
                      <label>Dirección</label>
                      <input
                        required
                        value={gymForm.direccion}
                        onChange={e => setGymForm({...gymForm, direccion: e.target.value})}
                        placeholder="Ej: Av. Principal 123"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Horario de Apertura</label>
                      <input
                        type="time"
                        required
                        value={gymForm.horarioApertura}
                        onChange={e => setGymForm({...gymForm, horarioApertura: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Horario de Cierre</label>
                      <input
                        type="time"
                        required
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
                        value={gymForm.precioCuota}
                        onChange={e => setGymForm({...gymForm, precioCuota: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Usuario Administrador</label>
                      <select
                        required
                        value={gymForm.adminId}
                        onChange={e => setGymForm({...gymForm, adminId: e.target.value})}
                      >
                        <option value="" disabled>Selecciona quién lo administrará...</option>
                        {usuarios.map(u => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}
                      </select>
                    </div>
                  </div>

                  <hr className="divider" />

                  <button type="submit" className="btn-primary btn-full">
                    <IconPlus />
                    Registrar Gimnasio y Asignar Rol
                  </button>
                </form>
              </div>

              {/* Gym List Table */}
              <div className="card p-lg">
                <div className="section-header">
                  <h3 className="section-title">Gimnasios Registrados</h3>
                  <span className="badge-accent">{gimnasios.length} total</span>
                </div>

                {gimnasios.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', opacity: 0.5 }}>
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/>
                      </svg>
                    </div>
                    <h3>Sin gimnasios aún</h3>
                    <p className="text-secondary">Crea tu primer gimnasio usando el formulario de arriba.</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Precio</th>
                        <th>Admin</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gimnasios.map(g => (
                        <tr key={g.id}>
                          <td>
                            <span className="badge-accent text-xs font-bold">#{g.id}</span>
                          </td>
                          <td>
                            <span className="font-semibold text-primary">{g.nombre}</span>
                          </td>
                          <td>{g.direccion}</td>
                          <td>
                            <span className="font-bold text-accent">${g.precioCuota}</span>
                          </td>
                          <td>
                            <span className="badge-success text-xs">{g.adminUsername || '—'}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn-danger btn-sm"
                              onClick={async () => {
                                if (confirm(`¿Eliminar gimnasio ${g.nombre}?`)) {
                                  try {
                                    await deleteGimnasio(g.id);
                                    showToast('Gimnasio eliminado');
                                    loadData();
                                  } catch (err) {
                                    const errMsg = err.response?.data?.message || err.message || '';
                                    if (errMsg.includes('Cannot delete or update a parent row') || errMsg.includes('constraint')) {
                                      showToast('No puedes eliminar este gimnasio porque tiene usuarios con suscripciones activas o pasadas.');
                                    } else {
                                      showToast(errMsg || 'Error al eliminar el gimnasio');
                                    }
                                  }
                                }
                              }}
                            >
                              <IconTrash />
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: EJERCICIOS
              ══════════════════════════════════════════ */}
          {activeTab === 'ejercicios' && (
            <div className="flex-col gap-lg">

              {/* Create Exercise Form */}
              <div className="card-glow p-xl">
                <div className="section-header mb-lg">
                  <div className="flex items-center gap-sm">
                    <div style={{
                      width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(46,160,67,0.12)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--success)'
                    }}>
                      <IconPlus />
                    </div>
                    <div>
                      <h3 className="section-title">Crear Nuevo Ejercicio</h3>
                      <p className="text-muted text-xs mt-sm">Agrega ejercicios al catálogo global de la plataforma</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateEjercicio} className="flex-col gap-md">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre del Ejercicio</label>
                      <input
                        required
                        value={ejercicioForm.nombre}
                        onChange={e => setEjercicioForm({...ejercicioForm, nombre: e.target.value})}
                        placeholder="Ej: Press de Banca"
                      />
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <input
                        required
                        value={ejercicioForm.descripcion}
                        onChange={e => setEjercicioForm({...ejercicioForm, descripcion: e.target.value})}
                        placeholder="Ej: Ejercicio compuesto para pecho..."
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                    <IconPlus />
                    Registrar Ejercicio
                  </button>
                </form>
              </div>

              {/* Exercise List Table */}
              <div className="card p-lg">
                <div className="section-header">
                  <h3 className="section-title">Ejercicios Registrados</h3>
                  <span className="badge-success">{ejercicios.length} total</span>
                </div>

                {ejercicios.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', opacity: 0.5 }}>
                        <path d="M14.5 6.5 18 3"/><path d="M9.5 6.5 6 3"/><path d="M14.5 17.5 18 21"/><path d="M9.5 17.5 6 21"/><rect x="7" y="6" width="10" height="12" rx="1"/>
                      </svg>
                    </div>
                    <h3>Sin ejercicios aún</h3>
                    <p className="text-secondary">Comienza creando tu primer ejercicio.</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ejercicios.map(ej => (
                        <tr key={ej.id}>
                          <td>
                            <span className="badge-accent text-xs font-bold">#{ej.id}</span>
                          </td>
                          <td>
                            <span className="font-semibold text-primary">{ej.nombre}</span>
                          </td>
                          <td>
                            <span className="text-secondary">{ej.descripcion || '—'}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn-danger btn-sm"
                              onClick={async () => {
                                if (confirm(`¿Eliminar ejercicio ${ej.nombre}?`)) {
                                  try {
                                    await deleteEjercicio(ej.id);
                                    showToast('Ejercicio eliminado');
                                    loadData();
                                  } catch (err) {
                                    const errMsg = err.response?.data?.message || err.message || '';
                                    if (errMsg.includes('Cannot delete or update a parent row') || errMsg.includes('constraint')) {
                                      showToast('No puedes eliminar este ejercicio porque está siendo usado en una o más rutinas.');
                                    } else {
                                      showToast(errMsg || 'Error al eliminar');
                                    }
                                  }
                                }
                              }}
                            >
                              <IconTrash />
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}



        </div>
      )}

      {/* ── Toast Notification ─────────────────────── */}
      {toast && (
        <div className="toast toast-success animate-fade-in-up">
          <div className="toast-success-dot" />
          <span className="font-semibold text-primary">{toast}</span>
        </div>
      )}
    </div>
  );
}
