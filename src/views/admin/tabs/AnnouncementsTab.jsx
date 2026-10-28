import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Pin,
  PinOff,
  Edit3
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';
import {
  SearchInput,
  FilterPills,
  EmptyState,
  ActionMenu,
  ConfirmDialog
} from '../../../components/admin';
import { formatCompactDateTime } from '../../../lib/dateUtils';

export default function AnnouncementsTab() {
  const {
    data,
    addAnnouncement,
    updateAnnouncement,
    togglePinAnnouncement,
    deleteAnnouncement
  } = useStore();
  const { showToast } = useToast();

  const announcements = data.announcements || [];

  // Search & Filter state
  const [annSearchQuery, setAnnSearchQuery] = useState('');
  const [annFilterCat, setAnnFilterCat] = useState('all');

  // Modals state
  const [isAddAnnOpen, setIsAddAnnOpen] = useState(false);
  const [isEditAnnOpen, setIsEditAnnOpen] = useState(false);
  const [selectedAnnForEdit, setSelectedAnnForEdit] = useState(null);
  const [annToDelete, setAnnToDelete] = useState(null);

  // Form state - Add
  const [annCat, setAnnCat] = useState('penting');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Form state - Edit
  const [editAnnCat, setEditAnnCat] = useState('penting');
  const [editAnnTitle, setEditAnnTitle] = useState('');
  const [editAnnContent, setEditAnnContent] = useState('');

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      const q = annSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (ann.title || '').toLowerCase().includes(q) ||
        (ann.content || '').toLowerCase().includes(q) ||
        (ann.category || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (annFilterCat === 'all') return true;
      return (ann.category || '').toLowerCase() === annFilterCat.toLowerCase();
    });
  }, [announcements, annSearchQuery, annFilterCat]);

  const handleCreateAnn = (e) => {
    e.preventDefault();
    addAnnouncement({
      category: annCat,
      title: annTitle.trim(),
      content: annContent.trim(),
      author: 'Administrator / Pengurus Kelas'
    });
    setIsAddAnnOpen(false);
    setAnnTitle('');
    setAnnContent('');
    showToast('Pengumuman kelas dipublikasikan!', 'success');
  };

  const handleOpenEditAnn = (ann) => {
    setSelectedAnnForEdit(ann);
    setEditAnnCat(ann.category || 'akademik');
    setEditAnnTitle(ann.title || '');
    setEditAnnContent(ann.content || '');
    setIsEditAnnOpen(true);
  };

  const handleUpdateAnn = (e) => {
    e.preventDefault();
    if (!selectedAnnForEdit) return;
    updateAnnouncement(selectedAnnForEdit.id, {
      category: editAnnCat,
      title: editAnnTitle.trim(),
      content: editAnnContent.trim()
    });
    setIsEditAnnOpen(false);
    showToast(`Pengumuman "${editAnnTitle.trim()}" berhasil diperbarui!`, 'success');
  };

  const getCategoryClass = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'penting': return 'notion-tag-red';
      case 'akademik': return 'notion-tag-blue';
      case 'kegiatan': return 'notion-tag-green';
      case 'keuangan': return 'notion-tag-yellow';
      default: return 'notion-tag-gray';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Pengumuman Kelas
          </h2>
          <button
            type="button"
            onClick={() => setIsAddAnnOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem', fontWeight: 600 }}
          >
            <Plus size={15} />
            <span>Tulis Pengumuman</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <SearchInput
            value={annSearchQuery}
            onChange={(e) => setAnnSearchQuery(e.target.value)}
            onClear={() => setAnnSearchQuery('')}
            placeholder="Cari judul atau isi pengumuman..."
            style={{ maxWidth: '300px', height: '36px' }}
          />
          <FilterPills
            options={[
              { value: 'all', label: `Semua (${announcements.length})` },
              { value: 'penting', label: 'Penting' },
              { value: 'akademik', label: 'Akademik' },
              { value: 'kegiatan', label: 'Kegiatan' },
              { value: 'keuangan', label: 'Keuangan' }
            ]}
            activeValue={annFilterCat}
            onChange={setAnnFilterCat}
          />
        </div>

        {/* Announcement Card List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredAnnouncements.length === 0 ? (
            <EmptyState
              title={annSearchQuery || annFilterCat !== 'all' ? 'Pengumuman Tidak Ditemukan' : 'Belum Ada Pengumuman'}
              actionLabel="+ Tulis Pengumuman"
              onAction={() => setIsAddAnnOpen(true)}
            />
          ) : (
            filteredAnnouncements.map(ann => (
              <div
                key={ann.id}
                style={{
                  padding: '1rem 1.15rem',
                  backgroundColor: ann.isPinned ? 'var(--bg-hover)' : 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span
                      className={`notion-tag ${getCategoryClass(ann.category)}`}
                      style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      {ann.category}
                    </span>
                    {ann.isPinned && (
                      <span
                        className="notion-tag notion-tag-orange"
                        style={{ fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        <Pin size={11} />
                        <span>Disematkan</span>
                      </span>
                    )}
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {ann.createdAt ? formatCompactDateTime(ann.createdAt) : ''}
                      {ann.author ? ` · Oleh ${ann.author}` : ''}
                    </span>
                  </div>

                  <ActionMenu
                    items={[
                      {
                        label: 'Edit Pengumuman',
                        icon: <Edit3 size={14} />,
                        onClick: () => handleOpenEditAnn(ann)
                      },
                      {
                        label: ann.isPinned ? 'Lepas Sematan' : 'Sematkan di Atas',
                        icon: ann.isPinned ? <PinOff size={14} /> : <Pin size={14} />,
                        onClick: () => {
                          togglePinAnnouncement(ann.id);
                          showToast(ann.isPinned ? 'Pin dilepas' : 'Pengumuman disematkan di atas', 'info');
                        }
                      },
                      {
                        label: 'Hapus Pengumuman',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        onClick: () => setAnnToDelete(ann)
                      }
                    ]}
                  />
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.3rem 0', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                  {ann.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {ann.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: TULIS PENGUMUMAN */}
      <Modal isOpen={isAddAnnOpen} onClose={() => setIsAddAnnOpen(false)} title="Tulis Pengumuman Baru">
        <form onSubmit={handleCreateAnn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select
              className="form-select"
              value={annCat}
              onChange={(e) => setAnnCat(e.target.value)}
            >
              <option value="penting">Penting</option>
              <option value="akademik">Akademik</option>
              <option value="kegiatan">Kegiatan</option>
              <option value="keuangan">Keuangan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Judul Pengumuman</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Informasi Ujian Praktek Pekan Depan"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Isi Pengumuman</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Tuliskan pesan lengkap untuk teman-teman sekelas..."
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Publikasikan
          </button>
        </form>
      </Modal>

      {/* MODAL: EDIT PENGUMUMAN */}
      <Modal isOpen={isEditAnnOpen} onClose={() => setIsEditAnnOpen(false)} title="Edit Pengumuman">
        <form onSubmit={handleUpdateAnn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select
              className="form-select"
              value={editAnnCat}
              onChange={(e) => setEditAnnCat(e.target.value)}
            >
              <option value="penting">Penting</option>
              <option value="akademik">Akademik</option>
              <option value="kegiatan">Kegiatan</option>
              <option value="keuangan">Keuangan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Judul Pengumuman</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Informasi Ujian Praktek Pekan Depan"
              value={editAnnTitle}
              onChange={(e) => setEditAnnTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Isi Pengumuman</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Tuliskan pesan lengkap untuk teman-teman sekelas..."
              value={editAnnContent}
              onChange={(e) => setEditAnnContent(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditAnnOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DIALOG: HAPUS PENGUMUMAN */}
      <ConfirmDialog
        isOpen={Boolean(annToDelete)}
        onClose={() => setAnnToDelete(null)}
        onConfirm={() => {
          if (annToDelete) {
            const backupAnn = { ...annToDelete };
            deleteAnnouncement(annToDelete.id);
            showToast(`Pengumuman "${backupAnn.title}" berhasil dihapus`, 'info', {
              action: {
                label: 'Urungkan',
                onClick: () => {
                  addAnnouncement(backupAnn);
                  showToast(`Pengumuman "${backupAnn.title}" dipulihkan! ✨`, 'success');
                }
              }
            });
            setAnnToDelete(null);
          }
        }}
        title="Hapus Pengumuman Kelas"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${annToDelete?.title}"?`}
        confirmLabel="Hapus Pengumuman"
        variant="danger"
      />
    </div>
  );
}
