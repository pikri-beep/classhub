import React from 'react';

/**
 * Reusable Horizontal Scrollable Filter Pills
 * @param {Object} props
 * @param {Array<{label: string, value: any, count?: number}|string>} props.options
 * @param {any} props.activeValue
 * @param {Function} props.onChange
 */
export const FilterPills = ({
  options = [],
  activeValue,
  onChange,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`admin-filter-pills ${className}`}
      role="radiogroup"
      aria-label="Filter kategori"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '2px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        ...style
      }}
    >
      {options.map((option) => {
        const isObject = typeof option === 'object' && option !== null;
        const optValue = isObject ? option.value : option;
        const optLabel = isObject ? option.label : option;
        const optCount = isObject && typeof option.count === 'number' ? option.count : null;
        const isActive = activeValue === optValue;

        return (
          <button
            key={String(optValue)}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(optValue)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-soft)' : 'var(--bg-surface)',
              border: `1px solid ${isActive ? 'var(--primary-border)' : 'var(--border)'}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            <span>{optLabel}</span>
            {optCount !== null && (
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.05rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-hover)',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                {optCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterPills;
