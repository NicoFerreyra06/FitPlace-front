import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    peso: '',
    altura: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    const peso = parseFloat(form.peso);
    const altura = parseFloat(form.altura);
    if (isNaN(peso) || peso < 20 || peso > 500) {
      setError('El peso debe ser entre 20 y 500 kg');
      return;
    }
    if (isNaN(altura) || altura < 0.5 || altura > 3.0) {
      setError('La altura debe ser entre 0.5 y 3.0 metros');
      return;
    }
    if (form.password.length < 3) {
      setError('La contraseña debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        peso,
        altura
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Register error:', err);
      if (!err.response) {
        // Network error / CORS / backend down
        setError('No se pudo conectar con el servidor. Verificá tu conexión o intentá de nuevo en unos segundos.');
      } else {
        const data = err.response.data;
        const msg = typeof data === 'string' ? data
          : data?.message || data?.error || JSON.stringify(data);
        setError(msg || 'Error en el registro');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-ambient-glow" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" style={{ background: 'transparent' }}>
            <img src="/logo.png" alt="FitPlace Logo" style={{ width: '80px', height: 'auto', objectFit: 'contain' }} />
          </div>
          <h1>Crear Cuenta</h1>
          <p>Unite a FitPlace y empezá a entrenar</p>
        </div>

        {error && (
          <div className="auth-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="juanfit"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Mínimo 3 caracteres"
              required
              minLength={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="peso">Peso (kg)</label>
              <input
                id="peso"
                type="number"
                step="0.1"
                min="20"
                max="500"
                value={form.peso}
                onChange={(e) => handleChange('peso', e.target.value)}
                placeholder="75.0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="altura">Altura (m)</label>
              <input
                id="altura"
                type="number"
                step="0.01"
                min="0.5"
                max="3.0"
                value={form.altura}
                onChange={(e) => handleChange('altura', e.target.value)}
                placeholder="1.75"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Creando cuenta...
              </span>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>¿Ya tenés cuenta?</span>
          <Link to="/login">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
