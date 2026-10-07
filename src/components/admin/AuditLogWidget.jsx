import React, { useState, useMemo } from 'react';
import {
  History,
  BookOpen,
  Wallet,
  GraduationCap,
  CalendarDays,
  Megaphone,
  Settings,
  Search,
  Trash2,
  Clock,
  Lock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { formatRelativeTime, formatFullTimeIndo } from '../../lib/dateUtils';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';

const CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'tasks', label: 'Tugas' },
  { id: 'cash', label: 'Kas' },
  { id: 'exams', label: 'Ujian' },
  { id: 'schedules', label: 'Jadwal' },
  { id: 'announcements', label: 'Pengumuman' },
  { id: 'settings', label: 'Pengaturan' }
];

export default function AuditLogWidget({ onLockSecurity }) {
  const { data, clearAuditLogs } = useStore();
  const { showToast } = useToast();

  const auditLogs = useMemo(() => {
    return Array.isArray(data?.auditLogs) ? data.auditLogs : [];
  }, [data?.auditLogs]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(8);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Filter logs based on category and search query
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (log.category !== selectedCategory) return false;
      }
      // Search query filter (title and details)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (log.title || '').toLowerCase().includes(q);
        const matchesDetails = (log.details || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDetails) return false;
      }
      return true;
    });
  }, [auditLogs, selectedCategory, searchQuery]);

  const visibleLogs = useMemo(() => {
    return filteredLogs.slice(0, visibleLimit);
  }, [filteredLogs, visibleLimit]);

  // Get icon and colors for category
  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'tasks':
        return {
          icon: BookOpen,
          color: '#3B82F6',
          bg: 'rgba(59, 130, 246, 0.1)',
          label: 'Tugas'
        };
      case 'cash':
        return {
          icon: Wallet,
          color: '#16A34A',
          bg: 'rgba(22, 163, 74, 0.1)',
          label: 'Kas'
        };
      case 'exams':
        return {
          icon: GraduationCap,
          color: '#D97706',
          bg: 'rgba(217, 119, 6, 0.1)',
          label: 'Ujian'
        };
      case 'schedules':
        return {
          icon: CalendarDays,
          color: '#8B5CF6',
          bg: 'rgba(139, 92, 246, 0.1)',
          label: 'Jadwal'
        };
      case 'announcements':
        return {
          icon: Megaphone,
          color: '#06B6D4',
          bg: 'rgba(6, 182, 212, 0.1)',
          label: 'Pengumuman'
        };
      case 'settings':
      default:
        return {
          icon: Settings,
          color: '#64748B',
          bg: 'rgba(100, 116, 139, 0.1)',
          label: 'Pengaturan'
        };
    }
  };

  const handleExecuteClear = () => {
    clearAuditLogs();
    setIsClearConfirmOpen(false);
    showToast('Seluruh riwayat log aktivitas telah dibersihkan.', 'info');
  };

  return (
    <div
      className="card"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.4rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      {/* 1. Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-soft, rgba(217, 119, 6, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}
          >
            <History size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--text-primary)'
                }}
              >
                Riwayat Aktivitas Sistem
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {auditLogs.length}
              </span>
            </div>
            <p
              style={{
                margin: '0.15rem 0 0 0',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}
            >
              Catatan riwayat perubahan data dan aktivitas operasional secara berurutan
            </p>
          </div>
        </div>

        {/* Right Actions: Lock Button & Clear Log */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onLockSecurity && (
            <button
              type="button"
              onClick={onLockSecurity}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border-subtle)'
              }}
              title="Kunci kembali akses log"
            >
              <Lock size={13} color="var(--primary)" />
              <span>Kunci Kembali</span>
            </button>
          )}

          {auditLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearConfirmOpen(true)}
              className="btn btn-ghost btn-xs"
              style={{
                color: 'var(--text-muted)',
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Bersihkan riwayat aktivitas"
              aria-label="Bersihkan log"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Controls: Category Filter Tabs & Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem'
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.15rem' }}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = cat.id === 'all'
              ? auditLogs.length
              : auditLogs.filter(l => l.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`clean-filter-chip ${isActive ? 'active' : ''}`}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.28rem 0.7rem',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      opacity: isActive ? 1 : 0.7,
                      padding: '0 0.25rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-hover)'
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Compact Search Bar */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            minWidth: '180px',
            maxWidth: '260px',
            flex: '1 1 auto'
          }}
        >
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: '0.65rem',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aktivitas..."
            style={{
              paddingLeft: '1.9rem',
              paddingTop: '0.3rem',
              paddingBottom: '0.3rem',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-full)'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.55rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '0.2rem'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Feed List */}
      {visibleLogs.length === 0 ? (
        <EmptyState
          icon={History}
          title="Belum ada riwayat aktivitas"
          description={
            searchQuery || selectedCategory !== 'all'
              ? 'Tidak ada log aktivitas yang cocok dengan kriteria filter.'
              : 'Aktivitas perubahan data seperti tugas, kas, atau jadwal akan otomatis tercatat di sini.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {visibleLogs.map((log) => {
            const meta = getCategoryMeta(log.category);
            const IconComponent = meta.icon;

            return (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem 0.85rem',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'background-color var(--transition-fast)'
                }}
              >
                {/* Category Icon Badge */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: meta.bg,
                    color: meta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                  title={`Kategori: ${meta.label}`}
                >
                  <IconComponent size={16} />
                </div>

                {/* Main Log Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      marginBottom: '0.2rem'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)'
                      }}
                    >
                      {log.title}
                    </span>

                    {/* Timestamp */}
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        flexShrink: 0
                      }}
                      title={formatFullTimeIndo(log.timestamp)}
                    >
                      <Clock size={11} />
                      <span>{formatRelativeTime(log.timestamp)}</span>
                    </span>
                  </div>

                  {/* Log Details / Subtitle */}
                  {log.details && (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                        wordBreak: 'break-word'
                      }}
                    >
                      {log.details}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Footer Pagination / Show More */}
      {filteredLogs.length > visibleLimit && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={() => setVisibleLimit(prev => prev + 8)}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.35rem 1rem',
              borderRadius: 'var(--radius-full)'
            }}
          >
            Tampilkan Lebih Banyak ({filteredLogs.length - visibleLimit} tersisa)
          </button>
        </div>
      )}

      {visibleLimit > 8 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setVisibleLimit(8)}
            className="btn btn-ghost btn-xs"
            style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}
          >
            Sembunyikan Sebagian
          </button>
        </div>
      )}

      {/* Confirm Dialog for Clearing Logs */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleExecuteClear}
        title="Bersihkan Riwayat Aktivitas"
        message="Apakah Anda yakin ingin menghapus seluruh rekaman riwayat aktivitas ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Bersihkan Log"
        variant="danger"
      />
    </div>
  );
}
