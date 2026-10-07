import React, { useState, useEffect } from 'react';
import { Pin, Calendar, CheckSquare, ChevronRight, AlertCircle, Zap } from 'lucide-react';

export const getCategoryBadge = (memo) => {
  if (memo.type === 'checklist' || (memo.category || '').toLowerCase() === 'praktik') {
    return { label: 'Praktik', icon: '🎒' };
  }
  const cat = (memo.category || '').toLowerCase();
  switch (cat) {
    case 'akademik':
      return { label: 'Akademik', icon: '📚' };
    case 'keuangan':
      return { label: 'Keuangan', icon: '💰' };
    case 'kegiatan':
      return { label: 'Kegiatan', icon: '📝' };
    case 'umum':
    case 'penting':
    default:
      return { label: 'Umum', icon: '📢' };
  }
};

export default function MadingCard({ memo, isAdmin, onOpenDetail }) {
  // LocalStorage-backed checklist progress
  const [completedCount, setCompletedCount] = useState(0);

  const isChecklist = memo.type === 'checklist' && Array.isArray(memo.checklistItems) && memo.checklistItems.length > 0;
  const totalItems = isChecklist ? memo.checklistItems.length : 0;
  const isUrgent = Boolean(memo.isPriority || memo.priority === 'high' || (memo.category || '').toLowerCase() === 'penting');
  const catBadge = getCategoryBadge(memo);

  // Sync completion count from LocalStorage
  const syncProgress = () => {
    if (!isChecklist) return;
    try {
      const stored = localStorage.getItem(`classhub_checklist_${memo.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCompletedCount(Array.isArray(parsed) ? parsed.length : 0);
      } else {
        setCompletedCount(0);
      }
    } catch {
      setCompletedCount(0);
    }
  };

  useEffect(() => {
    syncProgress();
    // Listen for custom storage event from modal
    const handleStorageChange = (e) => {
      if (e.detail?.memoId === memo.id) {
        setCompletedCount(e.detail.count);
      }
    };
    window.addEventListener('classhub-checklist-updated', handleStorageChange);
    return () => window.removeEventListener('classhub-checklist-updated', handleStorageChange);
  }, [memo.id, isChecklist]);

  // Determine sticky color class
  const getColorClass = () => {
    if (memo.color === 'mint') return 'mading-card-mint';
    if (memo.color === 'yellow') return 'mading-card-yellow';
    if (memo.color === 'blue') return 'mading-card-blue';
    if (memo.color === 'pink') return 'mading-card-pink';

    // Fallback by category
    const cat = (memo.category || '').toLowerCase();
    if (cat === 'penting' || cat === 'keuangan') return 'mading-card-pink';
    if (cat === 'akademik') return 'mading-card-blue';
    if (cat === 'praktik' || isChecklist) return 'mading-card-mint';
    return 'mading-card-yellow';
  };

  // Date formatting
  const dateObj = new Date(memo.createdAt);
  const dateStr = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : '';

  // Expiration check
  const isExpired = memo.expiresAt && new Date(memo.expiresAt) < new Date();
  const expiresStr = memo.expiresAt
    ? new Date(memo.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : null;

  const progressPercent = totalItems > 0 ? Math.min(100, Math.round((completedCount / totalItems) * 100)) : 0;

  return (
    <div 
      className={`mading-card ${getColorClass()}`}
      onClick={() => onOpenDetail(memo)}
      title="Klik untuk membuka rincian memo"
    >
      {/* Push-Pin Realistic Accent */}
      <div className="mading-pin" />

      {/* Top Meta Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.45rem', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {memo.isPinned && (
              <span 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.2rem', 
                  fontSize: '0.66rem', 
                  fontWeight: 800, 
                  backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                  padding: '0.1rem 0.45rem', 
                  borderRadius: 'var(--radius-full)' 
                }}
              >
                <Pin size={10} /> Disematkan
              </span>
            )}
            {isUrgent && (
              <span 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.2rem', 
                  fontSize: '0.66rem', 
                  fontWeight: 800, 
                  backgroundColor: '#DC2626', 
                  color: '#FFFFFF',
                  padding: '0.1rem 0.45rem', 
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 2px 5px rgba(220, 38, 38, 0.35)'
                }}
                title="Memo Prioritas Mendesak"
              >
                <Zap size={10} style={{ fill: '#FFFFFF' }} /> Prioritas
              </span>
            )}
            <span 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.68rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.04em',
                opacity: 0.95
              }}
            >
              <span>{catBadge.icon}</span>
              <span>{catBadge.label}</span>
            </span>
          </div>

          {/* Expiry Badge */}
          {expiresStr && (
            <span 
              style={{ 
                fontSize: '0.66rem', 
                fontWeight: 700, 
                padding: '0.1rem 0.45rem', 
                borderRadius: 'var(--radius-full)', 
                backgroundColor: isExpired ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.08)',
                color: isExpired ? 'var(--danger)' : 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {isExpired ? <AlertCircle size={10} /> : <Calendar size={10} />}
              <span>{isExpired ? 'Kedaluwarsa' : `Tempo: ${expiresStr}`}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="mading-card-title">
          {memo.title}
        </h4>

        {/* Excerpt */}
        <p className="mading-card-excerpt">
          {memo.content || (isChecklist ? `Terdapat ${totalItems} perlengkapan yang perlu disiapkan.` : '')}
        </p>
      </div>

      {/* Bottom Section: Progress Bar (if checklist) & Click Hint */}
      <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(0, 0, 0, 0.12)' }}>
        {isChecklist ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckSquare size={12} />
                <span>Kesiapan Tas:</span>
              </span>
              <span>{completedCount}/{totalItems} ({progressPercent}%)</span>
            </div>
            <div className="mading-progress-track">
              <div 
                className="mading-progress-fill" 
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: progressPercent === 100 ? '#10B981' : 'currentColor'
                }} 
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', opacity: 0.85 }}>
            <span>{dateStr}</span>
            <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              Baca Detail <ChevronRight size={13} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
