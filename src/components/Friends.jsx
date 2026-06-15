import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getAmigos, 
  agregarAmigo, 
  eliminarAmigo, 
  getMiEntrenador, 
  asignarEntrenador, 
  eliminarEntrenador,
  getPerfilAmigo
} from '../services/socialService';

const FlameIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning inline-block" style={{ marginTop: '-2px' }}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const ZapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent inline-block" style={{ marginTop: '-2px' }}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function Friends() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('amigos');
  
  // Amigos state
  const [amigos, setAmigos] = useState([]);
  const [codigoAmigoInput, setCodigoAmigoInput] = useState('');
  const [loadingAmigos, setLoadingAmigos] = useState(true);
  const [selectedAmigo, setSelectedAmigo] = useState(null);
  const [selectedAmigoProfile, setSelectedAmigoProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Entrenador state
  const [entrenador, setEntrenador] = useState(null);
  const [entrenadorIdInput, setEntrenadorIdInput] = useState('');
  const [loadingEntrenador, setLoadingEntrenador] = useState(true);

  useEffect(() => {
    if (activeTab === 'amigos') loadAmigos();
    if (activeTab === 'entrenador') loadEntrenador();
  }, [activeTab]);

  const loadAmigos = async () => {
    try {
      setLoadingAmigos(true);
      const data = await getAmigos();
      setAmigos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAmigos(false);
    }
  };

  const loadEntrenador = async () => {
    try {
      setLoadingEntrenador(true);
      const data = await getMiEntrenador();
      setEntrenador(data);
    } catch (err) {
      setEntrenador(null);
    } finally {
      setLoadingEntrenador(false);
    }
  };

  const handleAddAmigo = async (e) => {
    e.preventDefault();
    if (!codigoAmigoInput.trim()) return;
    try {
      await agregarAmigo(codigoAmigoInput.trim());
      setCodigoAmigoInput('');
      loadAmigos();
      alert('Amigo agregado con éxito');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar amigo');
    }
  };

  const handleRemoveAmigo = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar a este amigo?')) return;
    try {
      await eliminarAmigo(id);
      setAmigos(amigos.filter(a => a.id !== id));
    } catch (err) {
      alert('Error al eliminar amigo');
    }
  };

  const handleViewProfile = async (amigo) => {
    setSelectedAmigo(amigo);
    try {
      setLoadingProfile(true);
      const profile = await getPerfilAmigo(amigo.id);
      setSelectedAmigoProfile(profile);
    } catch (err) {
      setSelectedAmigoProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAssignTrainer = async (e) => {
    e.preventDefault();
    if (!entrenadorIdInput.trim()) return;
    try {
      await asignarEntrenador(entrenadorIdInput.trim());
      setEntrenadorIdInput('');
      loadEntrenador();
      alert('Entrenador asignado con éxito');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al asignar entrenador');
    }
  };

  const handleRemoveTrainer = async () => {
    if (!confirm('¿Seguro que quieres desvincularte de tu entrenador?')) return;
    try {
      await eliminarEntrenador();
      setEntrenador(null);
    } catch (err) {
      alert('Error al desvincular entrenador');
    }
  };

  return (
    <div className="animate-fade-in flex-col gap-lg max-w-4xl mx-auto">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'amigos' ? 'active' : ''}`}
          onClick={() => setActiveTab('amigos')}
        >
          Mis Amigos
        </button>
        <button 
          className={`tab ${activeTab === 'entrenador' ? 'active' : ''}`}
          onClick={() => setActiveTab('entrenador')}
        >
          Mi Entrenador
        </button>
      </div>

      {activeTab === 'amigos' && (
        <div className="flex-col gap-lg animate-fade-in-up">
          <div className="card p-lg flex-col md:flex-row gap-lg justify-between items-center bg-tertiary border-accent">
            <div>
              <h3 className="text-lg font-bold">Agrega a un amigo</h3>
              <p className="text-sm text-secondary">Pídele su código personal para conectarse</p>
            </div>
            <form onSubmit={handleAddAmigo} className="flex gap-sm w-full md:w-auto">
              <input 
                type="text" 
                className="input" 
                placeholder="Código del amigo..."
                value={codigoAmigoInput}
                onChange={e => setCodigoAmigoInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Agregar</button>
            </form>
          </div>

          <div className="flex-col gap-md">
            <h3 className="font-bold text-lg">Lista de Amigos ({amigos.length})</h3>
            
            {loadingAmigos ? (
              <div className="animate-pulse h-20 bg-secondary rounded-md"></div>
            ) : amigos.length === 0 ? (
              <div className="text-center p-xl text-muted">Aún no has agregado amigos.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {amigos.map(amigo => (
                  <div 
                    key={amigo.id} 
                    className="friend-card pointer relative" 
                    onClick={() => handleViewProfile(amigo)}
                  >
                    <div className="friend-info">
                      <div className="friend-avatar">
                        {amigo.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold">{amigo.username}</h4>
                        <p className="text-xs text-secondary mt-xs flex items-center gap-xs">Racha: {amigo.rachaActualDias || 0} días <FlameIcon /></p>
                      </div>
                    </div>
                    <button 
                      className="btn btn-ghost text-danger btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleRemoveAmigo(amigo.id); }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Modal de Perfil de Amigo ── */}
          {selectedAmigo && (
            <div className="modal-overlay" onClick={() => { setSelectedAmigo(null); setSelectedAmigoProfile(null); }}>
              <div className="modal-content p-lg" onClick={e => e.stopPropagation()}>
                <button 
                  className="modal-close" 
                  onClick={() => { setSelectedAmigo(null); setSelectedAmigoProfile(null); }}
                  aria-label="Cerrar perfil"
                >
                  ✕
                </button>
                
                <div className="flex flex-col md:flex-row gap-md items-center text-center md:text-left">
                  <div className="friend-avatar animate-float" style={{ width: 64, height: 64, fontSize: '1.5rem', boxShadow: '0 0 15px var(--accent-glow)' }}>
                    {selectedAmigo.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-xs">{selectedAmigo.username}</h3>
                    {selectedAmigoProfile && selectedAmigoProfile.email && (
                      <p className="text-secondary text-sm mb-xs">{selectedAmigoProfile.email}</p>
                    )}
                    {selectedAmigo.rol && <span className="badge badge-accent">{selectedAmigo.rol}</span>}
                  </div>
                </div>

                <div className="divider mt-md mb-md"></div>

                <div className="grid grid-cols-2 gap-sm">
                  {selectedAmigoProfile && (
                    <>
                      <div className="stat-card text-center bg-tertiary p-sm rounded-md border border-border animate-scale-in delay-100" style={{opacity: 0}}>
                        <div className="text-lg font-bold text-accent mb-xs">{selectedAmigoProfile.peso ? `${selectedAmigoProfile.peso} kg` : '-'}</div>
                        <div className="text-xs text-secondary uppercase tracking-wider">Peso</div>
                      </div>
                      <div className="stat-card text-center bg-tertiary p-sm rounded-md border border-border animate-scale-in delay-200" style={{opacity: 0}}>
                        <div className="text-lg font-bold text-accent mb-xs">{selectedAmigoProfile.altura ? `${selectedAmigoProfile.altura} cm` : '-'}</div>
                        <div className="text-xs text-secondary uppercase tracking-wider">Altura</div>
                      </div>
                    </>
                  )}
                  
                  <div className="stat-card text-center bg-tertiary p-sm rounded-md border border-border animate-scale-in delay-300" style={{opacity: 0}}>
                    <div className="text-lg font-bold text-primary mb-xs flex-center gap-xs">
                      {selectedAmigoProfile?.rachaActualDias ?? selectedAmigo.rachaActualDias ?? 0} <FlameIcon />
                    </div>
                    <div className="text-xs text-secondary uppercase tracking-wider">Racha Actual</div>
                  </div>
                  
                  {selectedAmigoProfile && selectedAmigoProfile.rachaMaximaDias !== undefined && (
                    <div className="stat-card text-center bg-tertiary p-sm rounded-md border border-border animate-scale-in delay-400" style={{opacity: 0}}>
                      <div className="text-lg font-bold text-primary mb-xs flex-center gap-xs">
                        {selectedAmigoProfile.rachaMaximaDias} <ZapIcon />
                      </div>
                      <div className="text-xs text-secondary uppercase tracking-wider">Racha Máxima</div>
                    </div>
                  )}
                </div>


              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'entrenador' && (
        <div className="flex-col gap-lg animate-fade-in-up">
          {loadingEntrenador ? (
            <div className="animate-pulse h-32 bg-secondary rounded-lg"></div>
          ) : entrenador ? (
            <div className="card p-lg flex-col md:flex-row justify-between items-center border-accent card-glow">
              <div className="flex items-center gap-md mb-md md:mb-0">
                <div className="friend-avatar" style={{ width: 60, height: 60, fontSize: '1.5rem' }}>
                  {entrenador.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-xl">{entrenador.username}</h3>
                  <p className="text-secondary">{entrenador.email}</p>
                  <span className="badge badge-accent mt-sm">ENTRENADOR PERSONAL</span>
                </div>
              </div>
              <button className="btn btn-danger" onClick={handleRemoveTrainer}>
                Desvincular
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ opacity: 0.7 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
              </div>
              <h3>No tienes entrenador asignado</h3>
              <p>Si tienes un entrenador personal en la app, ingresa su ID para vincularlo a tu cuenta y que pueda gestionar tus rutinas.</p>
              
              <form onSubmit={handleAssignTrainer} className="flex gap-sm justify-center mt-md max-w-sm mx-auto">
                <input 
                  type="number" 
                  className="input text-center" 
                  placeholder="ID del Entrenador"
                  value={entrenadorIdInput}
                  onChange={e => setEntrenadorIdInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Vincular</button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
