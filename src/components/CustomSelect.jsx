import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function CustomSelect({ options, value, onChange, placeholder = "Seleccionar...", disabled = false, hideSearch = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(o => o.value?.toString() === value?.toString());
  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    // Listen to scroll events on document/window with capture phase
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const portalContent = isOpen ? createPortal(
    <div 
      ref={dropdownRef}
      className="animate-fade-in-up" 
      style={{ 
        position: 'absolute',
        top: dropdownCoords.top + 8,
        left: dropdownCoords.left,
        width: dropdownCoords.width,
        background: '#16161e', 
        border: '1px solid rgba(86, 113, 254, 0.4)', 
        borderRadius: 'var(--radius-md)', 
        zIndex: 99999, 
        boxShadow: '0 24px 60px rgba(0,0,0,0.9), 0 0 20px rgba(55, 71, 244, 0.1)',
        overflow: 'hidden'
      }}
    >
      {!hideSearch && (
        <div className="p-sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full"
            style={{ padding: '10px 14px', fontSize: '0.875rem', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            autoFocus
          />
        </div>
      )}
      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {filteredOptions.length > 0 ? filteredOptions.map(o => (
          <div 
            key={o.value} 
            className="cursor-pointer transition-colors flex-col gap-xs"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '8px 14px' }}
            onClick={(e) => {
              e.stopPropagation();
              onChange(o.value);
              setIsOpen(false);
              setSearch('');
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(55, 71, 244, 0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontWeight: '500', fontSize: '0.875rem', color: '#fff' }}>{o.label}</div>
            {o.sublabel && (
                <div style={{ fontSize: '11px', color: 'var(--accent-secondary)', fontWeight: '600', marginTop: '2px' }}>{o.sublabel}</div>
            )}
          </div>
        )) : (
          <div className="p-md text-sm text-muted text-center">No se encontraron resultados</div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div 
      className="relative w-full" 
      ref={containerRef}
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
    >
      <div 
        className="form-group cursor-pointer m-0 p-0"
        onClick={toggleOpen}
      >
        <div className="input flex-between items-center" style={{ minHeight: '46px', background: 'var(--bg-tertiary)', border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
          <span className={selectedOption ? 'text-primary' : 'text-muted'} style={{ opacity: selectedOption ? 1 : 0.6, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      {portalContent}
    </div>
  );
}
