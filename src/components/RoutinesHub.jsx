import { useState } from 'react';
import MyRoutines from './MyRoutines';
import CreateRoutine from './CreateRoutine';

export default function RoutinesHub({ onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('misRutinas');
  const [editingRoutine, setEditingRoutine] = useState(null);

  const tabs = [
    { id: 'misRutinas', label: 'Mis Rutinas' },
    { id: 'crearRutina', label: editingRoutine ? 'Editando Rutina' : 'Nueva Rutina' }
  ];

  const handleEdit = (routine) => {
    setEditingRoutine(routine);
    setActiveSubTab('crearRutina');
  };

  const handleNavigateInsideHub = (tabId) => {
    // Si desde CreateRoutine o MyRoutines quieren ir a otra sección
    // Si la tabId existe en el Hub, la usamos. Si no, navegamos en el Dashboard global.
    if (tabs.find(t => t.id === tabId)) {
      setActiveSubTab(tabId);
    } else {
      if (onNavigate) onNavigate(tabId);
    }
  };

  const renderContent = () => {
    switch (activeSubTab) {
      case 'misRutinas': 
        return <MyRoutines onNavigate={handleNavigateInsideHub} onEdit={handleEdit} />;
      case 'crearRutina': 
        return <CreateRoutine onNavigate={handleNavigateInsideHub} editingRoutine={editingRoutine} setEditingRoutine={setEditingRoutine} />;
      default: 
        return <MyRoutines onNavigate={handleNavigateInsideHub} onEdit={handleEdit} />;
    }
  };

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation Pills */}
      <div className="tabs" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '8px', paddingBottom: '4px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              if (tab.id === 'crearRutina' && activeSubTab !== 'crearRutina') {
                // If they click 'Crear' directly, clear editing state
                setEditingRoutine(null);
              }
              setActiveSubTab(tab.id);
            }}
            style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {renderContent()}
      </div>

    </div>
  );
}
