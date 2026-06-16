import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Scale, Ruler } from 'lucide-react';
import api from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    peso: '',
    altura: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        peso: parseFloat(formData.peso),
        altura: parseFloat(formData.altura)
      };
      
      await api.post('/usuarios/registro', payload);
      navigate('/login');
    } catch (err) {
      console.error("Error completo:", err);
      if (err.message === 'Network Error') {
        setError('Error de conexión: ¿Está el backend encendido en el puerto 8080 y con CORS configurado?');
      } else {
        const backendMsg = err.response?.data ? (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) : err.message;
        setError(`Fallo el registro: ${backendMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-dark-bg">
      <div className="w-full max-w-lg bg-dark-card border border-dark-border p-8 rounded-3xl shadow-2xl z-10 my-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="FitPlace Logo" className="h-20 w-auto object-contain mb-4 drop-shadow-[0_0_20px_rgba(29,78,216,0.4)]" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Crea tu Cuenta</h1>
          <p className="text-slate-400 mt-2 text-center">Únete a FitPlace y comienza tu viaje fitness</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={1}
                  className="w-full bg-dark-bg border border-dark-border focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 transition-all outline-none"
                  placeholder="Ej. fitlover99"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-bg border border-dark-border focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 transition-all outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={30}
                className="w-full bg-dark-bg border border-dark-border focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Peso (kg)</label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="number"
                  step="0.1"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  required
                  min={20}
                  max={500}
                  className="w-full bg-dark-bg border border-dark-border focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 transition-all outline-none"
                  placeholder="Ej. 70.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Altura (m)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="number"
                  step="0.01"
                  name="altura"
                  value={formData.altura}
                  onChange={handleChange}
                  required
                  min={0.5}
                  max={3}
                  className="w-full bg-dark-bg border border-dark-border focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 transition-all outline-none"
                  placeholder="Ej. 1.75"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-blue text-black font-semibold py-3 rounded-xl hover:bg-neon-blue/90 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]"
          >
            {loading ? (
              <span className="animate-pulse font-medium">Registrando...</span>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> Completar Registro
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-neon-green hover:text-neon-green/80 hover:underline font-medium transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
