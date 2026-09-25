import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { formatMonthLabel } from '../lib/duesUtils';

export default function MonthNavigator({ availableMonths = [], selectedMonth, onMonthChange, style = {} }) {
  const currentIndex = availableMonths.indexOf(selectedMonth);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < availableMonths.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      onMonthChange(availableMonths[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onMonthChange(availableMonths[currentIndex + 1]);
    }
  };

  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--bg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.04))',
        ...style
      }}
    >
      {/* Tombol Mundur (Bulan Sebelumnya) */}
      <button
        type="button"
        disabled={!canGoPrev}
        onClick={handlePrev}
        style={{
          padding: '0.35rem 0.5rem',
          background: 'transparent',
          border: 'none',
          borderRight: '1px solid var(--border)',
          cursor: canGoPrev ? 'pointer' : 'not-allowed',
          color: canGoPrev ? 'var(--text-primary)' : 'var(--text-muted)',
          opacity: canGoPrev ? 1 : 0.35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.15s ease'
        }}
        title="Bulan sebelumnya"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Dropdown Pilihan Bulan */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            padding: '0.35rem 1.9rem 0.35rem 0.75rem',
            background: 'transparent',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {availableMonths.map(m => (
            <option 
              key={m} 
              value={m} 
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            >
              {formatMonthLabel(m)}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={14} 
          style={{ 
            position: 'absolute', 
            right: '0.55rem', 
            pointerEvents: 'none', 
            color: 'var(--text-muted)' 
          }} 
        />
      </div>

      {/* Tombol Maju (Bulan Berikutnya) */}
      <button
        type="button"
        disabled={!canGoNext}
        onClick={handleNext}
        style={{
          padding: '0.35rem 0.5rem',
          background: 'transparent',
          border: 'none',
          borderLeft: '1px solid var(--border)',
          cursor: canGoNext ? 'pointer' : 'not-allowed',
          color: canGoNext ? 'var(--text-primary)' : 'var(--text-muted)',
          opacity: canGoNext ? 1 : 0.35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.15s ease'
        }}
        title="Bulan berikutnya"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
