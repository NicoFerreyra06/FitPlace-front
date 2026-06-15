import { useState, useEffect } from 'react';
import { 
  getAllGimnasios, 
  getMiSuscripcion, 
  createSuscripcion, 
  cancelarSuscripcion, 
  generatePagoLink 
} from '../services/gimnasioService';
import { activarSuscripcion } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

const DAY_TRANSLATION = {
  MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mié', THURSDAY: 'Jue',
  FRIDAY: 'Vie', SATURDAY: 'Sáb', SUNDAY: 'Dom',
};

export default function GymFinder() {
  const { user } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setSubLoading(true);
    
    try {
      const gymData = await getAllGimnasios(0, 50);
      setGyms(gymData.content || gymData || []);
    } catch (err) {
      console.error('Error loading gyms', err);
    } finally {
      setLoading(false);
    }

    try {
      const subData = await getMiSuscripcion();
      setCurrentSub(subData);
    } catch (err) {
      setCurrentSub(null);
    } finally {
      setSubLoading(false);
    }
  };

  const handleSubscribe = async (gymId) => {
    if (currentSub && currentSub.estadoSuscripcion === 'PENDIENTE') {
      showToast('Ya tienes una suscripción pendiente.');
      return;
    }
    if (currentSub && currentSub.estadoSuscripcion === 'ACTIVA') {
      showToast('Ya tienes una suscripción activa.');
      return;
    }

    try {
      const newSub = await createSuscripcion(gymId);
      handlePay(newSub.id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al procesar la suscripción.');
    }
  };

  const handlePay = async (subId) => {
    try {
      const url = await generatePagoLink(subId);
      if (url) window.location.href = url;
    } catch (err) {
      showToast('Error al conectar con MercadoPago.');
    }
  };

  const handleCancel = async (subId) => {
    if (!confirm('¿Seguro que quieres cancelar esta suscripción pendiente?')) return;
    try {
      await cancelarSuscripcion(subId);
      showToast('Suscripción cancelada correctamente.');
      loadData();
    } catch (err) {
      showToast('Error al cancelar la suscripción.');
    }
  };

  const handleAdminApprove = async (subId) => {
    try {
      await activarSuscripcion(subId);
      showToast('Suscripción activada manualmente.');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al activar la suscripción.');
    }
  };

  return (
    <div className="animate-fade-in flex-col gap-lg">
      <div className="section-header">
        <h2 className="section-title">Encuentra tu Gimnasio</h2>
      </div>

      {/* Suscripción Pendiente */}
      {!subLoading && currentSub && currentSub.estadoSuscripcion === 'PENDIENTE' && (
        <div className="card-glow p-lg animate-fade-in-up">
          <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div className="flex items-center gap-sm mb-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <h3 className="font-bold text-warning">Suscripción en Trámite</h3>
              </div>
              <p className="text-sm text-secondary">
                Tu solicitud para <strong className="text-primary">{currentSub.gimnasio?.nombre}</strong> está en proceso.
              </p>
            </div>

            <div className="card p-md" style={{ textAlign: 'center', minWidth: '160px' }}>
              <p className="text-xs text-muted mb-xs">Código para el recepcionista</p>
              <div className="text-2xl font-bold text-accent" style={{ fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                #{String(currentSub.id).padStart(4, '0')}
              </div>
            </div>

            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-ghost text-danger" onClick={() => handleCancel(currentSub.id)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={() => handlePay(currentSub.id)}>
                Pagar Online
              </button>
              {(user?.rol === 'ADMIN' || user?.rol === 'ADMIN_GIMNASIO') && (
                <button className="btn btn-secondary" onClick={() => handleAdminApprove(currentSub.id)} title="Aprobar manualmente">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Aprobar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suscripción Activa */}
      {!subLoading && currentSub && currentSub.estadoSuscripcion === 'ACTIVA' && (
        <div className="alert alert-success animate-fade-in-up">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <h4 className="font-bold">Suscripción Activa</h4>
            <p className="text-sm">Actualmente eres miembro de <strong>{currentSub.gimnasio?.nombre || 'tu gimnasio'}</strong>.</p>
          </div>
        </div>
      )}

      {/* Gym Grid */}
      {loading ? (
        <div className="gym-grid">
          {[1,2,3].map(i => (
            <div key={i} className="card p-lg animate-pulse" style={{ height: '220px' }}></div>
          ))}
        </div>
      ) : gyms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6"/><line x1="12" y1="6" x2="12" y2="6"/><line x1="16" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/></svg>
          </div>
          <h3>No hay gimnasios disponibles</h3>
          <p>No se encontraron gimnasios registrados en el sistema actualmente.</p>
        </div>
      ) : (
        <div className="gym-grid">
          {gyms.map((gym, index) => (
            <div key={gym.id} className="gym-card animate-scale-in" style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}>
              <div className="flex-between items-center mb-sm">
                <h3 className="gym-card-title" style={{ marginBottom: 0 }}>{gym.nombre}</h3>
                {gym.nombreAdmin && (
                  <span className="badge badge-accent">{gym.nombreAdmin}</span>
                )}
              </div>

              <div className="flex items-center gap-xs text-sm text-secondary mb-md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {gym.direccion}
              </div>
              
              <div className="gym-card-price">
                ${gym.precioCuota?.toFixed(2)} <span>/ mes</span>
              </div>

              <hr className="divider" />

              <div className="flex-col gap-xs mt-sm" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-xs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {gym.horarioApertura?.slice(0,5)} - {gym.horarioCierre?.slice(0,5)}
                </div>
                <div className="flex items-center gap-xs flex-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {gym.diasDeApertura?.map(d => DAY_TRANSLATION[d] || d).join(', ')}
                </div>
              </div>

              <button 
                className="btn btn-primary w-full mt-md"
                onClick={() => handleSubscribe(gym.id)}
                disabled={currentSub && (currentSub.estadoSuscripcion === 'ACTIVA' || currentSub.estadoSuscripcion === 'PENDIENTE')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Suscribirse
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast toast-success animate-fade-in-up">
          <div className="toast-success-dot"></div>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
