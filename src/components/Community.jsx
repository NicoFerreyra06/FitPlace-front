import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getFriends, 
  addFriend, 
  deleteFriend, 
  getTrainer, 
  assignTrainer, 
  removeTrainer, 
  getAlumnos
} from '../services/userService';
import { Users, UserPlus, Shield, UserMinus, Flame, Copy, Check, Sparkles, HelpCircle } from 'lucide-react';

export default function Community() {
  const { user } = useAuth();
  
  // States
  const [friends, setFriends] = useState([]);
  const [friendCode, setFriendCode] = useState('');
  const [trainer, setTrainer] = useState(null);
  const [trainerIdInput, setTrainerIdInput] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [availableTrainers, setAvailableTrainers] = useState([]);
  
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(true);

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      const friendsData = await getFriends();
      setFriends(friendsData || []);
      
      try {
        const trainerData = await getTrainer();
        setTrainer(trainerData);
      } catch (e) {
        // En caso de que tire error por no tener entrenador
        setTrainer(null);
      }
      
      if (user?.rol === 'ENTRENADOR') {
        const alumnosData = await getAlumnos();
        setAlumnos(alumnosData || []);
      } else {
        // MOCK PARA LA PRESENTACIÓN: Como no podemos modificar el backend para añadir
        // un endpoint de obtener entrenadores, mockeamos la lista para que la interfaz 
        // no requiera que el usuario escriba un ID manualmente. 
        // (Asegúrate de que estos IDs existan como entrenadores en tu base de datos local)
        setAvailableTrainers([
          { id: 2, username: 'Carlos Entrenador', email: 'carlos@fitplace.com' },
          { id: 3, username: 'Maria Fitness', email: 'maria@fitplace.com' }
        ]);
      }
    } catch (err) {
      console.error("Error al cargar datos de comunidad:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCopyCode = () => {
    if (user?.codigoAmigo) {
      navigator.clipboard.writeText(user.codigoAmigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendCode.trim()) return;
    setStatus({ type: '', msg: '' });
    try {
      await addFriend(friendCode.trim());
      setStatus({ type: 'success', msg: '¡Amigo agregado con éxito!' });
      setFriendCode('');
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setStatus({ type: 'error', msg: typeof msg === 'object' ? JSON.stringify(msg) : String(msg) });
    }
  };

  const handleDeleteFriend = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar a este amigo?")) return;
    try {
      await deleteFriend(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignTrainer = async (e) => {
    e.preventDefault();
    if (!trainerIdInput.trim()) return;
    setStatus({ type: '', msg: '' });
    try {
      await assignTrainer(trainerIdInput.trim());
      setStatus({ type: 'success', msg: '¡Entrenador asignado con éxito!' });
      setTrainerIdInput('');
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setStatus({ type: 'error', msg: typeof msg === 'object' ? JSON.stringify(msg) : String(msg) });
    }
  };

  const handleRemoveTrainer = async () => {
    if (!window.confirm("¿Seguro que deseas desvincular a tu entrenador?")) return;
    try {
      await removeTrainer();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-slate-400">Cargando comunidad...</div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-neon-blue" /> Comunidad FitPlace
          </h2>
          <p className="text-slate-400">Entrena en equipo, conéctate con entrenadores y compite con amigos.</p>
        </div>

        {/* Share Code Card */}
        <div className="bg-dark-card border border-dark-border p-4 rounded-xl flex items-center gap-3 w-full md:w-auto">
          <div>
            <p className="text-xs text-slate-500 font-medium">Mi código de amigo</p>
            <p className="text-sm font-mono text-slate-300 font-bold truncate max-w-[200px] md:max-w-xs">{user?.codigoAmigo || 'Generando...'}</p>
          </div>
          <button 
            onClick={handleCopyCode} 
            className="p-2 bg-dark-bg border border-dark-border hover:border-neon-blue/50 text-slate-400 hover:text-neon-blue rounded-lg transition-all"
            title="Copiar Código"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {status.msg && (
        <div className={`p-4 rounded-xl font-medium border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Column 1: Amigos */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100">
              <UserPlus className="text-neon-blue" size={20} /> Agregar Amigo
            </h3>
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Pegar código de amigo aquí..." 
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-neon-blue outline-none"
              />
              <button 
                type="submit" 
                className="bg-neon-blue text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-neon-blue/90 transition-colors"
              >
                Agregar
              </button>
            </form>
          </div>

          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Mis Amigos ({friends.length})</h3>
            
            {friends.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                Aún no tienes amigos en tu lista. ¡Pídeles su código para agregarlos!
              </div>
            ) : (
              <div className="divide-y divide-dark-border">
                {friends.map(amigo => (
                  <div key={amigo.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue font-bold">
                        {amigo.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{amigo.username}</p>
                        <p className="text-xs text-slate-500 capitalize">{amigo.rol?.toLowerCase()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {amigo.rachaActualDias > 0 && (
                        <div className="flex items-center gap-1 text-neon-blue font-bold text-sm bg-neon-blue/10 px-2 py-0.5 rounded-full border border-neon-blue/20">
                          <Flame size={14} className="fill-current" /> {amigo.rachaActualDias}d
                        </div>
                      )}
                      <button 
                        onClick={() => handleDeleteFriend(amigo.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Eliminar amigo"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Entrenador o Alumnos */}
        <div className="space-y-6">
          {/* Trainer Card */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100">
              <Shield className="text-neon-blue" size={20} /> Mi Entrenador
            </h3>
            
            {trainer ? (
              <div className="bg-dark-bg p-4 rounded-xl border border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                    {trainer.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">{trainer.username}</p>
                    <p className="text-xs text-slate-400">{trainer.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleRemoveTrainer}
                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-semibold transition-colors"
                >
                  Desvincular
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">Actualmente no tienes un entrenador asignado en la plataforma.</p>
                <form onSubmit={handleAssignTrainer} className="flex gap-2">
                  <select 
                    value={trainerIdInput}
                    onChange={(e) => setTrainerIdInput(e.target.value)}
                    className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-neon-blue outline-none"
                    required
                  >
                    <option value="" disabled>Selecciona un Entrenador...</option>
                    {availableTrainers.map(t => (
                      <option key={t.id} value={t.id}>{t.username} ({t.email})</option>
                    ))}
                  </select>
                  <button 
                    type="submit" 
                    className="bg-neon-blue/10 text-neon-blue border border-neon-blue/30 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-neon-blue/20 transition-colors"
                  >
                    Asignar
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Alumnos Panel (Only for Trainer role) */}
          {user?.rol === 'ENTRENADOR' && (
            <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100">
                <Sparkles className="text-neon-blue" size={20} /> Mis Alumnos ({alumnos.length})
              </h3>
              
              {alumnos.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No tienes alumnos asignados todavía.</p>
              ) : (
                <div className="divide-y divide-dark-border">
                  {alumnos.map(alumno => (
                    <div key={alumno.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-slate-200">{alumno.username}</p>
                        <p className="text-xs text-slate-500">{alumno.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Peso: {alumno.peso}kg | Altura: {alumno.altura}m</p>
                        <p className="text-xs text-neon-blue font-bold">IMC: {alumno.imc?.toFixed(1)} ({alumno.categoriaImc})</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
