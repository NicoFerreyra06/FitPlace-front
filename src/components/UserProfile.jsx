import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { editarPerfil } from '../services/socialService';
import { getMiSuscripcion, cancelarSuscripcion } from '../services/gimnasioService';

export default function UserProfile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ peso: '', altura: '' });
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [currentSub, setCurrentSub] = useState(null);

  const loadSubscription = async () => {
    try {
      const sub = await getMiSuscripcion();
      setCurrentSub(sub);
    } catch {
      setCurrentSub(null);
    }
  };

  useEffect(() => {
    if (user) {
      setForm({ peso: user.peso || '', altura: user.altura || '' });
      loadSubscription();
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await editarPerfil({
        username: user.username,
        email: user.email,
        peso: parseFloat(form.peso),
        altura: parseFloat(form.altura),
      });
      await refreshUser();
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user.codigoAmigo);
    setMsg({ type: 'info', text: 'Código copiado al portapapeles' });
  };

  if (!user) return null;

  const initials = user.username ? user.username.substring(0, 2).toUpperCase() : 'US';

  return (
    <div className="animate-fade-in flex-col gap-md">
      <div className="section-header">
        <h2 className="section-title">Resumen Personal</h2>
      </div>

      {msg.text && msg.type !== 'success' && (
        <div className={`alert alert-${msg.type}`}>
          {msg.text}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="card p-lg flex flex-col md:flex-row gap-lg items-center mb-md" style={{
        border: '3px solid #cbd5e1',
        boxShadow: '0 4px 15px rgba(203, 213, 225, 0.1), inset 0 0 5px rgba(255,255,255,0.05)',
        background: 'linear-gradient(145deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle metallic glare effect */}
        <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', transform: 'skewX(-20deg)', pointerEvents: 'none' }}></div>
        
        <div className="friend-avatar animate-float" style={{ 
          width: 100, height: 100, fontSize: '3rem',
          background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #475569 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 10px rgba(255,255,255,0.2), inset 0 2px 5px rgba(255,255,255,0.5)',
          border: '4px solid #f8fafc',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {initials}
        </div>
        <div className="flex-col gap-xs flex-1 text-center md:text-left">
          <h3 className="text-3xl font-bold" style={{textTransform: 'capitalize', letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>{user.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : user.username.split('@')[0]}</h3>
          <p className="text-secondary">{user.username}</p>
          <div className="mt-sm">
            <span className="role-badge">{user.rol}</span>
          </div>
        </div>
        
        <div className="flex-col gap-sm p-md rounded-md" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', minWidth: '220px' }}>
          {user.rol === 'ENTRENADOR' && (
            <div className="mb-sm">
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-xs">Tu ID de Entrenador</p>
              <div className="copy-field">
                <code className="text-primary font-bold">#{user.id}</code>
                <button onClick={() => { navigator.clipboard.writeText(user.id); setMsg({ type: 'info', text: 'ID copiado al portapapeles' }); }}>Copiar</button>
              </div>
            </div>
          )}
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-xs">Tu Código de Amigo</p>
          <div className="copy-field">
            <code className="text-accent font-bold">{user.codigoAmigo}</code>
            <button onClick={copyCode}>Copiar</button>
          </div>
        </div>
      </div>

      {/* Stats Grid (Full Width) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div className="stat-card animate-scale-in delay-100" style={{opacity: 0, padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <p className="stat-label">IMC Actual</p>
          <p className="stat-value text-accent" style={{ fontSize: '2.5rem', margin: '4px 0' }}>{user.imc ? user.imc.toFixed(1) : '-'}</p>
          <p className="stat-sub">{user.categoriaImc || 'Sin datos'}</p>
        </div>
        
        <div className="stat-card animate-scale-in delay-200" style={{opacity: 0, padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <p className="stat-label">Tu Peso</p>
          <p className="stat-value" style={{ fontSize: '2.5rem', margin: '4px 0' }}>{user.peso || '-'} <span className="text-sm font-medium text-muted">kg</span></p>
          <p className="stat-sub">Altura: {user.altura || '-'} m</p>
        </div>

        <div className="stat-card animate-scale-in delay-300" style={{opacity: 0, padding: '20px', background: 'linear-gradient(135deg, rgba(210, 153, 34, 0.1) 0%, rgba(210, 153, 34, 0.02) 100%)', border: '1px solid rgba(210, 153, 34, 0.2)', borderRadius: 'var(--radius-lg)'}}>
          <div className="flex items-center justify-between h-full">
            <div className="flex-col justify-center h-full">
              <p className="stat-label" style={{ color: 'var(--warning)' }}>Racha de Entrenamiento</p>
              <p className="stat-value text-warning" style={{ fontSize: '2.5rem', margin: '4px 0' }}>{user.rachaActualDias || 0} <span className="text-lg">días</span></p>
              <p className="stat-sub" style={{ opacity: 0.8 }}>Racha máxima: {user.rachaMaximaDias || 0} días</p>
            </div>
            <div style={{ opacity: 0.5 }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Gimnasio & Medidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        
        {/* Mi Suscripción Card */}
        {currentSub && (currentSub.estadoSuscripcion === 'ACTIVA' || currentSub.estadoSuscripcion === 'PENDIENTE') && (
          <div className="card p-lg" style={{ borderLeft: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 className="text-lg font-bold mb-xs">Mi Gimnasio Actual</h3>
            <p className="text-sm text-secondary mb-md">
              Miembro de <strong className="text-primary">{currentSub.gimnasio?.nombre || 'Gimnasio'}</strong>
            </p>
            <div className="mb-lg">
              {currentSub.estadoSuscripcion === 'PENDIENTE' && (
                <span className="badge badge-warning">Aprobación Pendiente</span>
              )}
              {currentSub.estadoSuscripcion === 'ACTIVA' && (
                <span className="badge badge-success">Membresía Activa</span>
              )}
            </div>
            
            <div className="mt-auto flex justify-end">
              <button
                className="btn btn-danger"
                onClick={() => {
                    cancelarSuscripcion(currentSub.id)
                      .then(() => {
                        setMsg({ type: 'success', text: 'Te desvinculaste correctamente del gimnasio.' });
                        setShowSuccessModal(true);
                        setTimeout(() => setShowSuccessModal(false), 3000);
                        loadSubscription();
                        refreshUser();
                      })
                      .catch((err) => {
                        const data = err.response?.data;
                        const errorMsg = data?.message || (typeof data === 'string' ? data : null) || 'Error al desvincular la suscripción.';
                        setMsg({ type: 'error', text: errorMsg });
                      });
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Desvincularme
              </button>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="card p-lg" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 className="text-lg font-bold mb-md">Actualizar Medidas</h3>
          <form onSubmit={handleSave} className="flex-col gap-md" style={{ flex: 1, display: 'flex' }}>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group mb-0">
                <label className="text-sm mb-xs block">Peso <span className="text-muted">(kg)</span></label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
                  value={form.peso}
                  onChange={(e) => setForm({ ...form, peso: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="form-group mb-0">
                <label className="text-sm mb-xs block">Altura <span className="text-muted">(m)</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="3.0"
                  value={form.altura}
                  onChange={(e) => setForm({ ...form, altura: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <div className="mt-auto flex justify-end" style={{ paddingTop: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <div className="toast toast-success animate-scale-in">
          <div className="toast-success-dot"></div>
          <span className="font-bold text-primary text-sm">Cambios guardados correctamente</span>
        </div>
      )}
    </div>
  );
}
