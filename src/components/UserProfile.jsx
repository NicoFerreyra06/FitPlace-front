import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { editarPerfil } from '../services/socialService';

export default function UserProfile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ peso: '', altura: '' });
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setForm({ peso: user.peso || '', altura: user.altura || '' });
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
    <div className="animate-fade-in flex-col gap-lg">
      <div className="section-header">
        <h2 className="section-title">Resumen Personal</h2>
      </div>

      {msg.text && msg.type !== 'success' && (
        <div className={`alert alert-${msg.type}`}>
          {msg.text}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="card p-lg flex flex-col md:flex-row gap-lg items-center mb-lg">
        <div className="friend-avatar animate-float" style={{ width: 80, height: 80, fontSize: '2rem' }}>
          {initials}
        </div>
        <div className="flex-col gap-xs flex-1">
          <h3 className="text-2xl font-bold">{user.username}</h3>
          <p className="text-secondary">{user.email}</p>
          <div className="mt-sm">
            <span className="role-badge">{user.rol}</span>
          </div>
        </div>
        
        <div className="flex-col gap-sm p-md bg-tertiary rounded-md">
          {user.rol === 'ENTRENADOR' && (
            <div className="mb-sm">
              <p className="text-sm font-medium text-muted">Tu ID de Entrenador</p>
              <div className="copy-field">
                <code>#{user.id}</code>
                <button onClick={() => { navigator.clipboard.writeText(user.id); setMsg({ type: 'info', text: 'ID copiado al portapapeles' }); }}>Copiar</button>
              </div>
            </div>
          )}
          <p className="text-sm font-medium text-muted">Tu Código de Amigo</p>
          <div className="copy-field">
            <code>{user.codigoAmigo}</code>
            <button onClick={copyCode}>Copiar</button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid mb-lg">
        <div className="stat-card animate-scale-in delay-100" style={{opacity: 0}}>
          <p className="stat-label">IMC Actual</p>
          <p className="stat-value text-accent">{user.imc ? user.imc.toFixed(1) : '-'}</p>
          <p className="stat-sub">{user.categoriaImc || 'Sin datos'}</p>
        </div>
        
        <div className="stat-card animate-scale-in delay-200" style={{opacity: 0}}>
          <p className="stat-label">Racha de Entrenamiento</p>
          <p className="stat-value text-success">{user.rachaActualDias || 0} días</p>
          <p className="stat-sub">Racha máxima: {user.rachaMaximaDias || 0} días</p>
        </div>

        <div className="stat-card animate-scale-in delay-300" style={{opacity: 0}}>
          <p className="stat-label">Tu Peso</p>
          <p className="stat-value">{user.peso || '-'} <span className="text-sm font-medium text-muted">kg</span></p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card p-lg">
        <h3 className="text-xl font-bold mb-md">Actualizar Medidas</h3>
        <form onSubmit={handleSave} className="flex-col gap-md">
          <div className="form-row">
            <div className="form-group">
              <label>Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="500"
                value={form.peso}
                onChange={(e) => setForm({ ...form, peso: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Altura (m)</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="3.0"
                value={form.altura}
                onChange={(e) => setForm({ ...form, altura: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-sm">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
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
