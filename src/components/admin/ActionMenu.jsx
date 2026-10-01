import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

/**
 * Reusable Action Menu (Three-dot dropdown)
 * @param {Object} props
 * @param {Array<{label: string, icon?: React.ReactNode, onClick: Function, variant?: 'default' | 'danger', disabled?: boolean}>} props.items
 * @param {string} [props.ariaLabel]
 * @param {'left' | 'right'} [props.align]
 */
export const ActionMenu = ({
  items = [],
  ariaLabel = 'Menu opsi tindakan',
  align = 'right',
  className = '',
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={`admin-action-menu-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style
      }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="action-menu-trigger"
        style={{
          width: '30px',
          height: '30px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid transparent',
          backgroundColor: isOpen ? 'var(--bg-hover)' : 'transparent',
          color: 'var(--text-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <MoreVertical size={15} strokeWidth={2} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="action-menu-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [align === 'right' ? 'right' : 'left']: 0,
            zIndex: 100,
            minWidth: '165px',
            padding: '0.3rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem'
          }}
        >
          {items.map((item, idx) => {
            const isDanger = item.variant === 'danger';
            return (
              <button
                key={idx}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: isDanger ? 'var(--danger)' : 'var(--text-primary)',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  opacity: item.disabled ? 0.5 : 1,
                  transition: 'background-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.backgroundColor = isDanger
                      ? 'rgba(196, 85, 77, 0.08)'
                      : 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: isDanger ? 'var(--danger)' : 'var(--text-muted)'
                  }}>
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
