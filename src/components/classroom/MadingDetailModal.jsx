import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Share2, 
  Pin, 
  Trash2, 
  Calendar, 
  User, 
  CheckSquare, 
  Square, 
  Sparkles,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getCategoryBadge } from './MadingCard';

export default function MadingDetailModal({ 
  memo, 
  isOpen, 
  onClose, 
  isAdmin, 
  onTogglePin, 
  onDelete 
}) {
  const { showToast } = useToast();
  const [checkedItems, setCheckedItems] = useState([]);
  const [copiedWA, setCopiedWA] = useState(false);

  const isChecklist = memo?.type === 'checklist' && Array.isArray(memo?.checklistItems) && memo.checklistItems.length > 0;
  const checklist = isChecklist ? memo.checklistItems : [];

  // Load checked items from LocalStorage
  useEffect(() => {
    if (!memo || !isChecklist) return;
    try {
      const stored = localStorage.getItem(`classhub_checklist_${memo.id}`);
      if (stored) {
        setCheckedItems(JSON.parse(stored));
      } else {
        setCheckedItems([]);
      }
    } catch {
      setCheckedItems([]);
    }
  }, [memo, isChecklist]);

  // Persist to LocalStorage and broadcast update
  const persistChecklist = (newChecked) => {
    setCheckedItems(newChecked);
    try {
      localStorage.setItem(`classhub_checklist_${memo.id}`, JSON.stringify(newChecked));
      // Dispatch custom event to notify parent cards
      window.dispatchEvent(new CustomEvent('classhub-checklist-updated', {
        detail: { memoId: memo.id, count: newChecked.length }
      }));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  };

  const handleToggleItem = (itemText) => {
    const isChecked = checkedItems.includes(itemText);
    const updated = isChecked 
      ? checkedItems.filter(i => i !== itemText)
      : [...checkedItems, itemText];
    
    persistChecklist(updated);

    if (!isChecked && updated.length === checklist.length) {
      showToast('Luar biasa! Seluruh perlengkapan tas telah siap! 🎒🎉', 'success');
    }
  };

  const handleCheckAll = (status) => {
    const updated = status ? [...checklist] : [];
    persistChecklist(updated);
    if (status) {
      showToast('Semua perlengkapan ditandai siap! ✅', 'success');
    }
  };

  // WhatsApp formatted generator
  const handleCopyWhatsApp = () => {
    if (!memo) return;

    let text = `📌 *${memo.title.toUpperCase()}*\n`;
    if (memo.author) text += `👤 Oleh: ${memo.author}\n`;
    if (memo.expiresAt) {
      const expDate = new Date(memo.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      text += `📅 Batas Waktu: ${expDate}\n`;
    }
    text += `───────────────────────\n\n`;

    if (memo.content && memo.content.trim()) {
      text += `${memo.content.trim()}\n\n`;
    }

    if (isChecklist) {
      text += `🎒 *CHECKLIST BARANG BAWAAN:*\n`;
      checklist.forEach((item, idx) => {
        text += `  ${idx + 1}. [ ] ${item}\n`;
      });
      text += `\n`;
    }

    text += `📢 _Diumumkan via Mading Digital ClassHub_`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedWA(true);
      showToast('Format pengumuman berhasil disalin ke WhatsApp! 📋', 'success');
      setTimeout(() => setCopiedWA(false), 2500);
    }).catch(() => {
      showToast('Gagal menyalin teks ke clipboard.', 'error');
    });
  };

  if (!isOpen || !memo) return null;

  const total = checklist.length;
  const completed = checkedItems.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Header background theme
  const getHeaderTheme = () => {
    const color = memo.color || (isChecklist ? 'mint' : 'yellow');
    switch (color) {
      case 'mint': return { bg: 'rgba(16, 185, 129, 0.12)', border: '#10B981', text: '#059669', badge: '#10B981' };
      case 'blue': return { bg: 'rgba(59, 130, 246, 0.12)', border: '#3B82F6', text: '#2563EB', badge: '#3B82F6' };
      case 'pink': return { bg: 'rgba(236, 72, 153, 0.12)', border: '#EC4899', text: '#DB2777', badge: '#EC4899' };
      default: return { bg: 'rgba(245, 158, 11, 0.12)', border: '#F59E0B', text: '#D97706', badge: '#F59E0B' };
    }
  };

  const theme = getHeaderTheme();

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden'
        }}
      >
        {/* Themed Top Header */}
        <div 
          style={{
            backgroundColor: theme.bg,
            borderBottom: `2px solid ${theme.border}`,
            padding: '1.15rem 1.35rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              {(() => {
                const catBadge = getCategoryBadge(memo);
                const isUrgent = Boolean(memo.isPriority || memo.priority === 'high' || (memo.category || '').toLowerCase() === 'penting');
                return (
                  <>
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 800, 
                        backgroundColor: theme.badge, 
                        color: '#FFFFFF', 
                        padding: '0.15rem 0.55rem', 
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <span>{catBadge.icon}</span>
                      <span>{catBadge.label}</span>
                    </span>
                    {isUrgent && (
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 800, 
                          backgroundColor: '#DC2626', 
                          color: '#FFFFFF', 
                          padding: '0.15rem 0.55rem', 
                          borderRadius: 'var(--radius-full)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)'
                        }}
                      >
                        <Zap size={11} style={{ fill: '#FFFFFF' }} /> Prioritas
                      </span>
                    )}
                  </>
                );
              })()}
              {memo.isPinned && (
                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 800, 
                    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                    color: theme.text,
                    padding: '0.15rem 0.55rem', 
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Pin size={11} /> Disematkan
                </span>
              )}
            </div>

            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
              {memo.title}
            </h3>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-icon"
            style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Metadata Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {memo.author && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={13} /> {memo.author}
              </span>
            )}
            {memo.expiresAt && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 600 }}>
                <Calendar size={13} /> Batas Waktu: {new Date(memo.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Narrative Content */}
          {memo.content && (
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {memo.content}
            </div>
          )}

          {/* Focused Interactive Checklist Section */}
          {isChecklist && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Progress Bar & Summary */}
              <div 
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.82rem', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                    <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                    <span>Kesiapan Tas Anda:</span>
                  </span>
                  <span style={{ color: percent === 100 ? 'var(--success)' : 'var(--text-primary)' }}>
                    {completed} dari {total} Siap ({percent}%)
                  </span>
                </div>

                <div className="mading-progress-track" style={{ height: '8px' }}>
                  <div 
                    className="mading-progress-fill" 
                    style={{ 
                      width: `${percent}%`, 
                      backgroundColor: percent === 100 ? '#10B981' : 'var(--primary)' 
                    }} 
                  />
                </div>
              </div>

              {/* Bulk Quick Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Daftar Perlengkapan Praktik:
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCheckAll(true)}
                    className="btn btn-ghost btn-xs"
                    style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.72rem' }}
                  >
                    Tandai Semua Siap
                  </button>
                  <span style={{ color: 'var(--border)' }}>•</span>
                  <button
                    type="button"
                    onClick={() => handleCheckAll(false)}
                    className="btn btn-ghost btn-xs"
                    style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}
                  >
                    Reset Centang
                  </button>
                </div>
              </div>

              {/* Large Thumb-Friendly Checklist Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {checklist.map((item, idx) => {
                  const isChecked = checkedItems.includes(item);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleItem(item)}
                      className={`mading-modal-checkbox ${isChecked ? 'checked' : ''}`}
                    >
                      {isChecked ? (
                        <CheckSquare size={20} color="var(--success)" style={{ flexShrink: 0 }} />
                      ) : (
                        <Square size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      )}
                      <span className="mading-checkbox-label">
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                💡 Catatan: Centang ini tersimpan otomatis di perangkat HP Anda secara offline.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer: Admin Controls & Close */}
        <div 
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            backgroundColor: 'var(--bg)'
          }}
        >
          {/* Admin Exclusive: WhatsApp Export & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    gap: '0.35rem',
                    fontWeight: 700,
                    fontSize: '0.78rem'
                  }}
                  title="Salin format memo ke grup WhatsApp"
                >
                  {copiedWA ? <Check size={14} /> : <Share2 size={14} />}
                  <span>{copiedWA ? 'Tersalin ke WA!' : 'Salin Format WA'}</span>
                </button>

                {onTogglePin && (
                  <button
                    type="button"
                    onClick={() => onTogglePin(memo.id)}
                    className="btn btn-outline btn-sm"
                    title={memo.isPinned ? 'Lepas Sematan' : 'Sematkan ke Atas'}
                    style={{ fontSize: '0.78rem', gap: '0.3rem' }}
                  >
                    <Pin size={13} />
                    <span>{memo.isPinned ? 'Lepas Pin' : 'Pin'}</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Yakin ingin menghapus memo ini dari mading?')) {
                        onDelete(memo.id);
                        onClose();
                      }
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)', fontSize: '0.78rem', gap: '0.3rem' }}
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 700 }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
