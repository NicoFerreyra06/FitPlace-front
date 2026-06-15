import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Decode JWT payload
  const decodeToken = (jwt) => {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };

  // Fetch user profile from /usuarios/me
  const fetchUser = async () => {
    try {
      const res = await api.get('/usuarios/me');
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/usuarios/login', { email, password });
    const jwt = res.data.token;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    // fetchUser will be called by the useEffect
  };

  const register = async (data) => {
    await api.post('/usuarios/registro', data);
    // After registration, auto-login
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
