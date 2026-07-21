import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserProfile from '../components/UserProfile';
import TodayRoutine from '../components/TodayRoutine';
import AdminPanel from '../components/AdminPanel';
import AdminGimnasioPanel from '../components/AdminGimnasioPanel';
import TrainerDashboard from '../components/TrainerDashboard';
import TrainerCatalog from '../components/TrainerCatalog';

// Hubs
import CommunityHub from '../components/CommunityHub';
import ProgressHub from '../components/ProgressHub';
import RoutinesHub from '../components/RoutinesHub';

// Sidebar icons as inline SVGs for zero dependencies
const icons = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  dumbbell: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="12" x2="17" y2="12" />
      <path d="M7 6v12M17 6v12M4 8v8M20 8v8" />
    </svg>
  ),
  user: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  calendar: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  history: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  globe: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  building: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6"/><line x1="12" y1="6" x2="12" y2="6"/><line x1="16" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/>
    </svg>
  ),
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  logout: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  award: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  )
};

function getTabsForRole(rol) {
  const base = [
    { id: 'perfil', label: 'Mi Perfil', icon: icons.user },
    { id: 'rutina', label: 'Hoy', icon: icons.dumbbell },
    { id: 'rutinasHub', label: 'Rutinas', icon: icons.calendar },
    { id: 'progresoHub', label: 'Progreso', icon: icons.history },
    { id: 'comunidadHub', label: 'Comunidad', icon: icons.globe },
    { id: 'entrenadores', label: 'Entrenadores', icon: icons.award },
  ];

  if (rol === 'ENTRENADOR') {
    return [
      ...base,
      { id: 'trainer', label: 'Mis Alumnos', icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 8 19 10 23 6"/></svg>
      )}
    ];
  }

  if (rol === 'ADMIN') {
    return [
      ...base,
      { id: 'admin', label: 'Admin', icon: icons.shield },
      { id: 'adminGimnasio', label: 'Mi Gym', icon: icons.building },
    ];
  }

  if (rol === 'ADMIN_GIMNASIO') {
    return [
      ...base,
      { id: 'adminGimnasio', label: 'Mi Gym', icon: icons.shield },
    ];
  }

  return base;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');

  if (!user) return null;

  const tabs = getTabsForRole(user.rol);

  const renderContent = () => {
    switch (activeTab) {
      case 'rutina':
        return <TodayRoutine onNavigate={setActiveTab} />;
      case 'perfil':
        return <UserProfile />;
      case 'rutinasHub':
        return <RoutinesHub onNavigate={setActiveTab} />;
      case 'progresoHub':
        return <ProgressHub />;
      case 'comunidadHub':
        return <CommunityHub onNavigate={setActiveTab} />;
      case 'entrenadores':
        return <TrainerCatalog onNavigate={setActiveTab} />;
      case 'admin':
        return <AdminPanel />;
      case 'adminGimnasio':
        return <AdminGimnasioPanel />;
      case 'trainer':
        return <TrainerDashboard />;
      // Fallbacks para navegación legacy desde otros componentes
      case 'crearRutina':
      case 'misRutinas':
        setActiveTab('rutinasHub');
        return null;
      case 'descubrir':
      case 'rankings':
      case 'amigos':
      case 'gimnasio':
        setActiveTab('comunidadHub');
        return null;
      case 'entrenamiento':
      case 'progreso':
        setActiveTab('progresoHub');
        return null;
      default:
        return <TodayRoutine onNavigate={setActiveTab} />;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 20) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const getMotivationalQuote = () => {
    if (user.rol === 'ADMIN' || user.rol === 'ENTRENADOR') return '';
    const quotes = [
      "El único mal entrenamiento es el que no se hace. 💪",
      "La disciplina es el puente entre tus metas y tus logros. 🔥",
      "Hoy es un gran día para romper tus propios récords. 🚀",
      "Tu cuerpo puede soportar casi cualquier cosa. Es tu mente a la que tienes que convencer. 🧠",
      "No cuentes los días, haz que los días cuenten. ⏳"
    ];
    // Use the current day of the year to pick a stable random quote for the day
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    return quotes[dayOfYear % quotes.length];
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          {/* Logo */}
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
            <img src="/logo.png" alt="FitPlace Logo" style={{ maxWidth: '100%', maxHeight: '40px', objectFit: 'contain' }} />
          </div>

          {/* Nav items */}
          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <span className="sidebar-icon">{tab.icon}</span>
                <span className="sidebar-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button className="sidebar-item" onClick={logout} title="Cerrar sesión">
            <span className="sidebar-icon">{icons.logout}</span>
            <span className="sidebar-label">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="main-header" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="header-greeting animate-fade-in-up" style={{ zIndex: 1, position: 'relative' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {activeTab === 'rutina' && 'Rutina de Hoy'}
              {activeTab === 'perfil' && 'Mi Perfil'}
              {activeTab === 'misRutinas' && 'Mis Rutinas'}
              {activeTab === 'crearRutina' && 'Diseñar Rutina'}
              {activeTab === 'descubrir' && 'Descubrir Rutinas'}
              {activeTab === 'entrenamiento' && 'Registrar Entrenamiento'}
              {activeTab === 'progreso' && 'Progreso y Estadísticas'}
              {activeTab === 'comunidadHub' && 'Comunidad'}
              {activeTab === 'amigos' && 'Comunidad'}
              {activeTab === 'gimnasio' && 'Gimnasios'}
              {activeTab === 'entrenadores' && 'Catálogo de Entrenadores'}
              {activeTab === 'admin' && 'Panel de Administración'}
              {activeTab === 'adminGimnasio' && 'Mi Gimnasio'}
              {activeTab === 'trainer' && 'Mis Alumnos'}
            </h1>
            <div className="header-sub" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                  {getGreeting()},{' '}
                  <strong style={{ 
                    textTransform: 'capitalize', 
                    color: 'var(--text-primary)',
                    fontWeight: '800'
                  }}>
                    {(user.nombre || user.username.split('@')[0]).trim()}
                  </strong>!
                </span>
                <span className="role-badge" style={{ 
                  boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.3)',
                  border: '1px solid rgba(var(--primary-rgb), 0.5)'
                }}>{user.rol}</span>
              </div>
              {user.rol === 'ALUMNO' && (
                <span style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-tertiary)', 
                  fontStyle: 'italic',
                  opacity: 0.8 
                }}>
                  {getMotivationalQuote()}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="main-body" key={activeTab}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
