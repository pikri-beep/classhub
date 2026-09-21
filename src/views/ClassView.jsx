import React, { useState } from 'react';
import { Megaphone, Users, Plus, Pin, PinOff, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function ClassView() {
  const { currentUser, isAdmin } = useAuth();
  const { data, addAnnouncement, togglePinAnnouncement, deleteAnnouncement } = useStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('announcements');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [annSearch, setAnnSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  // Add announcement modal
  const [isAddAnnOpen, setIsAddAnnOpen] = useState(false);
  const [annCat, setAnnCat] = useState('akademik');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  const announcements = data.announcements || [];
  const members = data.members || [];
  const classInfo = data.classInfo || {};

  // Filtered announcements
  let filteredAnnouncements = announcements.filter(item => {
    const matchCat = currentCategory === 'all' || item.category === currentCategory;
    const matchSearch = annSearch === '' ||
      item.title.toLowerCase().includes(annSearch.toLowerCase()) ||
      item.content.toLowerCase().includes(annSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  filteredAnnouncements.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Filtered members
  const filteredMembers = members.filter(m => {
    return memberSearch === '' ||
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      String(m.absentNo).includes(memberSearch);
  });
  filteredMembers.sort((a, b) => (a.absentNo || 0) - (b.absentNo || 0));

  const handleCreateAnn = (e) => {
    e.preventDefault();
    addAnnouncement({
      category: annCat,
      title: annTitle.trim(),
      content: annContent.trim(),
      author: currentUser.name
    });
    setIsAddAnnOpen(false);
    setAnnTitle('');
    setAnnContent('');
    showToast('Pengumuman baru berhasil dipublikasikan!', 'success');
  };

  return (
    <div>

      {/* 2. SUB-TABS & ACTIONS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.65rem'
      }}>
        <div className="clean-filter-chips">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`clean-filter-chip ${activeTab === 'announcements' ? 'active' : ''}`}
          >
            <Megaphone size={14} />
            <span>Pengumuman ({announcements.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`clean-filter-chip ${activeTab === 'members' ? 'active' : ''}`}
          >
            <Users size={14} />
            <span>Teman Sekelas ({members.length})</span>
          </button>
        </div>

        {activeTab === 'announcements' && isAdmin && (
          <button onClick={() => setIsAddAnnOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>+ Buat Pengumuman</span>
          </button>
        )}
      </div>

      {/* 3. ANNOUNCEMENTS CONTENT */}
      {activeTab === 'announcements' && (
        <div>
          {/* Category Pills & Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div className="clean-filter-chips">
              <button
                onClick={() => setCurrentCategory('all')}
                className={`clean-filter-chip ${currentCategory === 'all' ? 'active' : ''}`}
              >
                Semua
              </button>
              <button
                onClick={() => setCurrentCategory('penting')}
                className={`clean-filter-chip ${currentCategory === 'penting' ? 'active' : ''}`}
              >
                Penting
              </button>
              <button
                onClick={() => setCurrentCategory('akademik')}
                className={`clean-filter-chip ${currentCategory === 'akademik' ? 'active' : ''}`}
              >
                Akademik
              </button>
              <button
                onClick={() => setCurrentCategory('kegiatan')}
                className={`clean-filter-chip ${currentCategory === 'kegiatan' ? 'active' : ''}`}
              >
                Kegiatan
              </button>
              <button
                onClick={() => setCurrentCategory('keuangan')}
                className={`clean-filter-chip ${currentCategory === 'keuangan' ? 'active' : ''}`}
              >
                Kas
              </button>
            </div>

            <input
              type="text"
              className="form-input"
              placeholder="Cari pengumuman..."
              value={annSearch}
              onChange={(e) => setAnnSearch(e.target.value)}
              style={{ width: 'auto', minWidth: '180px', padding: '0.4rem 0.65rem', fontSize: '0.8125rem' }}
            />
          </div>

          {filteredAnnouncements.length === 0 ? (
            <div className="clean-empty-state">
              Tidak ada pengumuman yang sesuai.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredAnnouncements.map(ann => {
                return (
                  <div
                    key={ann.id}
                    className="card"
                    style={{
                      padding: '1.25rem 1.4rem',
                      borderLeft: ann.isPinned ? '3px solid var(--primary)' : '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                          <span className={`notion-tag ${ann.category === 'penting' ? 'notion-tag-red' : 'notion-tag-gray'}`} style={{ textTransform: 'uppercase', fontSize: '0.72rem' }}>
                            {ann.category}
                          </span>
                          {ann.isPinned && (
                            <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.72rem' }}>
                              📌 Disematkan
                            </span>
                          )}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--text-primary)' }}>
                          {ann.title}
                        </h3>

                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-line', margin: 0 }}>
                          {ann.content}
                        </p>
                      </div>

                      {isAdmin && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                          <button
                            onClick={() => togglePinAnnouncement(ann.id)}
                            className="btn-ghost"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
                            title={ann.isPinned ? 'Lepas Pin' : 'Sematkan'}
                          >
                            {ann.isPinned ? <PinOff size={15} /> : <Pin size={15} />}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus pengumuman ini?')) {
                                deleteAnnouncement(ann.id);
                                showToast('Pengumuman dihapus', 'info');
                              }
                            }}
                            className="btn-ghost"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--danger)' }}
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. ENGAGING CLASSMATES ROSTER */}
      {activeTab === 'members' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama teman atau nomor absen..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              style={{ flex: 1, minWidth: '180px', maxWidth: '320px', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {filteredMembers.length} Siswa
            </span>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="clean-empty-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Tidak ada siswa yang cocok dengan pencarian.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '0.65rem'
            }}>
              {filteredMembers.map((m, idx) => {
                const absentNum = String(m.absentNo || idx + 1).padStart(2, '0');
                const role = m.roleTitle && m.roleTitle !== 'Anggota' && m.roleTitle !== 'Siswa' ? m.roleTitle : null;

                return (
                  <div
                    key={m.id}
                    className="card"
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'none',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--border)',
                        padding: '0.2rem 0.45rem',
                        borderRadius: 'var(--radius-xs)',
                        flexShrink: 0
                      }}>
                        #{absentNum}
                      </span>
                      <strong style={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {m.name}
                      </strong>
                    </div>

                    {role && (
                      <span
                        className="notion-tag notion-tag-blue"
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          flexShrink: 0,
                          fontWeight: 600
                        }}
                      >
                        {role}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD ANNOUNCEMENT */}
      <Modal isOpen={isAddAnnOpen} onClose={() => setIsAddAnnOpen(false)} title="Buat Pengumuman Baru">
        <form onSubmit={handleCreateAnn}>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select" value={annCat} onChange={(e) => setAnnCat(e.target.value)}>
              <option value="penting">Penting (Wajib Baca)</option>
              <option value="akademik">Akademik & Mapel</option>
              <option value="kegiatan">Kegiatan & Acara</option>
              <option value="keuangan">Keuangan & Kas</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Judul Pengumuman</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Jadwal Pengumpulan Tugas Portofolio"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Isi Warta / Pengumuman</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Tuliskan isi pengumuman kelas..."
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setIsAddAnnOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Publikasikan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
