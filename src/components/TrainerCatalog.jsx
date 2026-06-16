import { useState, useEffect } from 'react';
import { assignTrainer, getTrainer, getEntrenadores } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Star, Award, ChevronRight } from 'lucide-react';

export default function TrainerCatalog({ onNavigate }) {
  const [trainers, setTrainers] = useState([]);
  const [currentTrainerId, setCurrentTrainerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [trainerList, currentTrainer] = await Promise.all([
        getEntrenadores(),
        getTrainer().catch(() => null) // Ignore error if no trainer
      ]);
      
      if (currentTrainer && currentTrainer.id) {
        setCurrentTrainerId(currentTrainer.id);
      }
      
      setTrainers(trainerList || []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el catálogo de entrenadores.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleAssignTrainer = async (trainerId, trainerName) => {
    try {
      await assignTrainer(trainerId);
      setCurrentTrainerId(trainerId);
      showToast(`¡Has seleccionado a ${trainerName} como tu entrenador!`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error al asignar el entrenador.';
      showToast(msg);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex-col gap-lg">
        <div className="section-header">
          <h2 className="section-title">Catálogo de Entrenadores</h2>
        </div>
        <div className="grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card p-lg animate-pulse" style={{ height: '200px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex-col gap-lg relative">
      {toast && (
        <div className="toast animate-fade-in-up" style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
          background: 'var(--bg-secondary)', border: '1px solid var(--success)',
          padding: '16px 24px', borderRadius: '12px', color: 'var(--success)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}>
          {toast}
        </div>
      )}

      <div className="section-header">
        <div>
          <h2 className="section-title">Catálogo de Entrenadores</h2>
          <p className="text-secondary mt-xs">Encuentra al profesional ideal para alcanzar tus metas.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-md">
          {error}
        </div>
      )}

      {trainers.length === 0 && !error ? (
        <div className="empty-state card-glow">
          <div className="empty-state-icon" style={{ opacity: 0.7 }}>
            <Award size={48} />
          </div>
          <h3>No hay entrenadores disponibles</h3>
          <p>En este momento no encontramos entrenadores registrados en la plataforma.</p>
        </div>
      ) : (
        <div className="grid">
          {trainers.map((trainer) => {
            const isCurrentTrainer = currentTrainerId === trainer.id;
            
            return (
              <div key={trainer.id} className={`card ${isCurrentTrainer ? 'card-glow' : ''} p-lg flex-col gap-md`} style={{ position: 'relative', overflow: 'hidden' }}>
                {isCurrentTrainer && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent)', color: 'white', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 'bold', borderBottomLeftRadius: '12px' }}>
                    TU ENTRENADOR
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--bg-tertiary), rgba(55, 71, 244, 0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <UserPlus size={32} color="var(--accent)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', textTransform: 'capitalize' }}>
                      {trainer.nombre ? trainer.nombre : (trainer.username?.split('@')[0] || 'Entrenador')}
                    </h3>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>{trainer.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <span className="role-badge" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                    <Star size={10} style={{ marginRight: '4px' }} /> Profesional
                  </span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  <button 
                    className={`btn ${isCurrentTrainer ? 'btn-secondary' : 'btn-primary'} w-full`}
                    style={{ justifyContent: 'center' }}
                    onClick={() => handleAssignTrainer(trainer.id, trainer.nombre || trainer.username?.split('@')[0] || 'Entrenador')}
                    disabled={isCurrentTrainer}
                  >
                    {isCurrentTrainer ? 'Seleccionado' : 'Asignarme este entrenador'}
                    {!isCurrentTrainer && <ChevronRight size={18} style={{ marginLeft: '4px' }} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
