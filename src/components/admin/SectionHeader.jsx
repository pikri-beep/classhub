import React from 'react';

/**
 * Reusable Section Header for Admin Tabs
 */
export const SectionHeader = ({
  title,
  description,
  icon: IconComponent,
  children,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`admin-section-header ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        ...style
      }}
    >
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {IconComponent && (
            <div style={{
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center'
            }}>
              {React.isValidElement(IconComponent) ? (
                IconComponent
              ) : (
                <IconComponent size={20} strokeWidth={2} />
              )}
            </div>
          )}
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            {title}
          </h3>
        </div>
        {description && (
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginTop: '0.25rem',
            marginBottom: 0,
            lineHeight: 1.45
          }}>
            {description}
          </p>
        )}
      </div>

      {children && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
