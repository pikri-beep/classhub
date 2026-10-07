import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, Filter, Pin, AlertCircle, ChevronDown, Check, X } from 'lucide-react';
import MadingCard from './MadingCard';
import MadingDetailModal from './MadingDetailModal';

export default function MadingBoard({ 
  announcements = [], 
  isAdmin = false, 
  onTogglePin, 
  onDelete,
  onOpenCreateModal 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Esc key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCategoryDropdownOpen(false);
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCategoryDropdownOpen]);

  // Compute category item counts dynamically
  const categoryCounts = useMemo(() => {
    const counts = {
      all: announcements.length,
      umum: 0,
      praktik: 0,
      akademik: 0,
      keuangan: 0,
      kegiatan: 0,
      pinned: 0
    };
    announcements.forEach(item => {
      if (item.type === 'checklist' || (item.category || '').toLowerCase() === 'praktik') counts.praktik++;
      if (item.isPinned) counts.pinned++;
      const cat = (item.category || '').toLowerCase();
      if (cat === 'umum' || cat === 'penting') counts.umum++;
      else if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  }, [announcements]);

  const categories = [
    { id: 'all', label: 'Semua Memo', icon: '📋', count: categoryCounts.all },
    { id: 'umum', label: 'Pengumuman Umum', icon: '📢', count: categoryCounts.umum },
    { id: 'praktik', label: 'Praktik', icon: '🎒', count: categoryCounts.praktik },
    { id: 'akademik', label: 'Akademik', icon: '📚', count: categoryCounts.akademik },
    { id: 'keuangan', label: 'Keuangan', icon: '💰', count: categoryCounts.keuangan },
    { id: 'kegiatan', label: 'Kegiatan', icon: '📝', count: categoryCounts.kegiatan },
    { id: 'pinned', label: 'Disematkan', icon: '📌', count: categoryCounts.pinned }
  ];

  const currentCategory = categories.find(c => c.id === activeCategory) || categories[0];

  // Filter & Sort logic
  const filteredMemos = useMemo(() => {
    let list = (announcements || []).filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (item.title || '').toLowerCase().includes(q) ||
        (item.content || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (Array.isArray(item.checklistItems) && item.checklistItems.some(i => i.toLowerCase().includes(q)));

      if (!matchesSearch) return false;

      if (activeCategory === 'all') return true;
      if (activeCategory === 'pinned') return item.isPinned;
      if (activeCategory === 'praktik') return item.type === 'checklist' || (item.category || '').toLowerCase() === 'praktik';
      if (activeCategory === 'umum') return ['umum', 'penting'].includes((item.category || '').toLowerCase());
      return (item.category || '').toLowerCase() === activeCategory.toLowerCase();
    });

    // Sort: pinned first, then newest
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [announcements, searchQuery, activeCategory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1rem' }}>
      {/* Top Filter & Search Controls */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '0.25rem'
        }}
      >
        {/* 1. DESKTOP CHIPS: Direct quick filters on wide screen (>=820px) */}
        <div className="mading-filter-chips-desktop clean-filter-chips">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`clean-filter-chip ${isSelected ? 'active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem'
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span style={{
                  fontSize: '0.68rem',
                  opacity: 0.85,
                  fontWeight: isSelected ? 800 : 600
                }}>
                  ({cat.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. MOBILE DROPDOWN: Compact single button for phones & small tablets (<820px) */}
        <div className="mading-filter-dropdown-mobile" style={{ alignItems: 'center', gap: '0.5rem', position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(prev => !prev)}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: activeCategory !== 'all' ? 'var(--primary-soft)' : 'var(--bg-surface)',
              borderColor: activeCategory !== 'all' ? 'var(--primary)' : 'var(--border)',
              color: activeCategory !== 'all' ? 'var(--primary)' : 'var(--text-primary)',
              transition: 'all 0.15s ease'
            }}
          >
            <Filter size={13} style={{ opacity: 0.8 }} />
            <span>Kategori: <strong>{currentCategory.icon} {currentCategory.label}</strong></span>
            <span style={{
              fontSize: '0.7rem',
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeCategory !== 'all' ? 'var(--primary)' : 'var(--bg-subtle)',
              color: activeCategory !== 'all' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 700
            }}>
              {currentCategory.count}
            </span>
            <ChevronDown
              size={14}
              style={{
                transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
                opacity: 0.7
              }}
            />
          </button>

          {activeCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="btn btn-ghost btn-xs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.25rem 0.45rem',
                fontSize: '0.72rem',
                color: 'var(--text-muted)'
              }}
              title="Reset ke Semua Memo"
            >
              <X size={12} />
              <span>Reset</span>
            </button>
          )}

          {/* Floating Category Dropdown Menu */}
          {isCategoryDropdownOpen && (
            <div
              className="mading-category-dropdown"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                zIndex: 60,
                minWidth: '230px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25), 0 4px 10px rgba(0, 0, 0, 0.15)',
                padding: '0.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div style={{
                padding: '0.35rem 0.6rem 0.25rem 0.6rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)'
              }}>
                Filter Kategori Memo
              </div>

              {categories.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsCategoryDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--primary-soft)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      textAlign: 'left',
                      transition: 'background-color 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem' }}>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-subtle)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                        fontWeight: 600
                      }}>
                        {cat.count}
                      </span>
                      {isSelected && <Check size={14} style={{ color: 'var(--primary)' }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Search Bar */}
        <div style={{ position: 'relative', minWidth: '180px', maxWidth: '280px', width: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Cari memo mading..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.1rem', fontSize: '0.82rem', paddingRight: '0.75rem' }}
          />
        </div>
      </div>

      {/* Acoustic Dark Felt Dot-Grid Board */}
      <div className="mading-board-felt">
        {filteredMemos.length === 0 ? (
          <div 
            style={{
              padding: '4rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8'
            }}
          >
            <AlertCircle size={36} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
            <h4 style={{ margin: '0 0 0.35rem 0', color: '#F8FAFC', fontSize: '1.05rem', fontWeight: 700 }}>
              Tidak Ada Memo yang Sesuai
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', maxWidth: '300px', lineHeight: 1.5 }}>
              {searchQuery || activeCategory !== 'all' 
                ? 'Coba ganti filter kategori atau kata kunci pencarian Anda.' 
                : 'Belum ada catatan yang tertempel di mading digital kelas.'}
            </p>
            {isAdmin && onOpenCreateModal && (
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '1.25rem', gap: '0.4rem', fontWeight: 700 }}
              >
                <Plus size={15} />
                <span>+ Buat Memo Mading Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="mading-grid">
            {filteredMemos.map(memo => (
              <MadingCard
                key={memo.id}
                memo={memo}
                isAdmin={isAdmin}
                onOpenDetail={setSelectedMemo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Focused Interactive Detail Modal */}
      {selectedMemo && (
        <MadingDetailModal
          memo={selectedMemo}
          isOpen={Boolean(selectedMemo)}
          onClose={() => setSelectedMemo(null)}
          isAdmin={isAdmin}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
