import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, LogIn } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/usuarios/login', { email, password });
      const token = res.data?.token || res.data; 
      login(token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas o error en el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-dark-bg">
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-neon-blue/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-neon-orange/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-dark-card/80 backdrop-blur-xl border border-dark-border p-8 rounded-3xl shadow-2xl z-10">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="FitPlace Logo" className="h-24 w-auto object-contain mb-4 drop-shadow-[0_0_20px_rgba(29,78,216,0.4)]" />
          <h1 className="text-3xl font-bold text-slate-100">Bienvenido de nuevo</h1>
          <p className="text-slate-400 mt-2 text-center">Accede a FitPlace y continúa tu progreso</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-dark-bg border border-dark-border focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 transition-all outline-none"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-dark-bg border border-dark-border focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-blue text-black font-semibold py-3 rounded-xl hover:bg-neon-blue/90 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]"
          >
            {loading ? (
              <span className="animate-pulse font-medium">Iniciando sesión...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Entrar al sistema
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="text-neon-green hover:text-neon-green/80 hover:underline font-medium transition-colors">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
