import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable Search Input with clear button and accessible markup
 */
export const SearchInput = ({
  value = '',
  onChange,
  placeholder = 'Cari data...',
  ariaLabel = 'Cari data',
  onClear,
  className = '',
  style = {}
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div
      className={`admin-search-input-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '340px',
        ...style
      }}
    >
      <Search
        size={16}
        strokeWidth={2}
        style={{
          position: 'absolute',
          left: '0.85rem',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
          zIndex: 1
        }}
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        style={{
          width: '100%',
          height: '38px',
          padding: '0 2.2rem 0 2.35rem',
          fontSize: '0.84rem',
          color: 'var(--text-primary)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Hapus pencarian"
          style={{
            position: 'absolute',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            padding: '0.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-xs)'
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
