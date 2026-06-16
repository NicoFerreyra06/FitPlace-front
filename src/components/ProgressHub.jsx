import { useState } from 'react';
import TrainingLog from './TrainingLog';
import MiProgreso from './MiProgreso';

export default function ProgressHub() {
  const [activeSubTab, setActiveSubTab] = useState('miprogreso');

  const tabs = [
    { id: 'miprogreso', label: 'Evolución y Estadísticas' },
    { id: 'registro', label: 'Cargar Entrenamiento de Hoy' }
  ];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'miprogreso': return <MiProgreso />;
      case 'registro': return <TrainingLog />;
      default: return <MiProgreso />;
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
            onClick={() => setActiveSubTab(tab.id)}
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
