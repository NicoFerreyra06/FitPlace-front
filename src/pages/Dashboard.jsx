import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserProfile from '../components/UserProfile';
import TodayRoutine from '../components/TodayRoutine';
import MyRoutines from '../components/MyRoutines';
import CreateRoutine from '../components/CreateRoutine';
import TrainingLog from '../components/TrainingLog';
import Friends from '../components/Friends';
import GymFinder from '../components/GymFinder';
import AdminPanel from '../components/AdminPanel';
import AdminGimnasioPanel from '../components/AdminGimnasioPanel';
import TrainerDashboard from '../components/TrainerDashboard';
import MiProgreso from '../components/MiProgreso';
import DiscoverRoutines from '../components/DiscoverRoutines';

// Sidebar icons as inline SVGs for zero dependencies
const icons = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  user: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  dumbbell: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M3 10V7a1 1 0 011-1h1a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1v-3M21 10V7a1 1 0 00-1-1h-1a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1v-3M9 6v12M15 6v12"/>
    </svg>
  ),
  calendar: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  activity: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
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
  plus: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  history: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  search: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
};

function getTabsForRole(rol) {
  const base = [
    { id: 'rutina', label: 'Hoy', icon: icons.home },
    { id: 'perfil', label: 'Perfil', icon: icons.user },
    { id: 'misRutinas', label: 'Rutinas', icon: icons.calendar },
    { id: 'crearRutina', label: 'Crear', icon: icons.plus },
    { id: 'descubrir', label: 'Descubrir', icon: icons.search },
    { id: 'entrenamiento', label: 'Registro', icon: icons.activity },
    { id: 'progreso', label: 'Mi Progreso', icon: icons.history },
    { id: 'amigos', label: 'Social', icon: icons.users },
    { id: 'gimnasio', label: 'Gimnasio', icon: icons.building },
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
  const [activeTab, setActiveTab] = useState('rutina');
  const [editingRoutine, setEditingRoutine] = useState(null);

  if (!user) return null;

  const tabs = getTabsForRole(user.rol);

  const renderContent = () => {
    switch (activeTab) {
      case 'rutina':
        return <TodayRoutine onNavigate={setActiveTab} />;
      case 'perfil':
        return <UserProfile />;
      case 'misRutinas':
        return <MyRoutines onNavigate={setActiveTab} onEdit={(r) => { setEditingRoutine(r); setActiveTab('crearRutina'); }} />;
      case 'crearRutina':
        return <CreateRoutine onNavigate={setActiveTab} editingRoutine={editingRoutine} setEditingRoutine={setEditingRoutine} />;
      case 'entrenamiento':
        return <TrainingLog />;
      case 'descubrir':
        return <DiscoverRoutines onNavigate={setActiveTab} />;
      case 'progreso':
        return <MiProgreso />;
      case 'amigos':
        return <Friends />;
      case 'gimnasio':
        return <GymFinder />;
      case 'admin':
        return <AdminPanel />;
      case 'adminGimnasio':
        return <AdminGimnasioPanel />;
      case 'trainer':
        return <TrainerDashboard />;
      default:
        return <TodayRoutine onNavigate={setActiveTab} />;
    }
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
        <header className="main-header">
          <div className="header-greeting">
            <h1>
              {activeTab === 'rutina' && 'Rutina de Hoy'}
              {activeTab === 'perfil' && 'Mi Perfil'}
              {activeTab === 'misRutinas' && 'Mis Rutinas'}
              {activeTab === 'crearRutina' && 'Diseñar Rutina'}
              {activeTab === 'descubrir' && 'Descubrir Rutinas'}
              {activeTab === 'entrenamiento' && 'Registrar Entrenamiento'}
              {activeTab === 'progreso' && 'Progreso y Estadísticas'}
              {activeTab === 'amigos' && 'Comunidad'}
              {activeTab === 'gimnasio' && 'Gimnasios'}
              {activeTab === 'admin' && 'Panel de Administración'}
              {activeTab === 'adminGimnasio' && 'Mi Gimnasio'}
              {activeTab === 'trainer' && 'Mis Alumnos'}
            </h1>
            <p className="header-sub" style={{textDecoration: 'none'}}>
              Bienvenido, <strong style={{textTransform: 'capitalize', textDecoration: 'none'}}>{user.nombre ? user.nombre : user.username.split('@')[0]}</strong>
              <span className="role-badge">{user.rol}</span>
            </p>
          </div>
        </header>

        <div className="main-body" key={activeTab}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
