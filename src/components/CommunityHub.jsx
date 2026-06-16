import { useState } from 'react';
import DiscoverRoutines from './DiscoverRoutines';
import Friends from './Friends';
import Rankings from './Rankings';
import GymFinder from './GymFinder';

export default function CommunityHub({ onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('rankings');

  const tabs = [
    { id: 'rankings', label: 'Rankings' },
    { id: 'social', label: 'Social' },
    { id: 'descubrir', label: 'Explorar Rutinas' },
    { id: 'gimnasios', label: 'Gimnasios' }
  ];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'rankings': return <Rankings />;
      case 'social': return <Friends />;
      case 'descubrir': return <DiscoverRoutines onNavigate={onNavigate} />;
      case 'gimnasios': return <GymFinder />;
      default: return <Rankings />;
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
