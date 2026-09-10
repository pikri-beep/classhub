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
      (m.roleTitle && m.roleTitle.toLowerCase().includes(memberSearch.toLowerCase())) ||
      (m.nisn && m.nisn.includes(memberSearch));
  });
  filteredMembers.sort((a, b) => (a.absentNo || 0) - (b.absentNo || 0));

  const handleCreateAnn = (e) => {
    e.preventDefault();
    addAnnouncement({
      category: annCat,
      title: annTitle.trim(),
      content: annContent.trim(),
      author: `${currentUser.name} (${currentUser.roleTitle || 'Pengurus'})`
    });
    setIsAddAnnOpen(false);
    setAnnTitle('');
    setAnnContent('');
    showToast('Pengumuman baru berhasil dipublikasikan!', 'success');
  };

  return (
    <div>
      {/* 1. NOTION PAGE HEADER */}
      <div className="notion-header">
        <span className="notion-header-icon">🏛️</span>
        <h1 className="notion-header-title">Ruang Kelas</h1>
        <p className="notion-header-desc">
          Papan warta pengumuman resmi & direktori siswa {classInfo.name} • {classInfo.school}
        </p>
      </div>

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
        <div className="scrollable-tabs" style={{ flex: 1, minWidth: '240px' }}>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`btn ${activeTab === 'announcements' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
            style={{ fontWeight: activeTab === 'announcements' ? 700 : 500 }}
          >
            <Megaphone size={15} />
            <span>Papan Pengumuman ({announcements.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`btn ${activeTab === 'members' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
            style={{ fontWeight: activeTab === 'members' ? 700 : 500 }}
          >
            <Users size={15} />
            <span>Direktori Siswa ({members.length})</span>
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
          {/* Filter Bar & Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <div className="scrollable-tabs" style={{ flex: 1, minWidth: '240px' }}>
              <button
                onClick={() => setCurrentCategory('all')}
                className={`btn ${currentCategory === 'all' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
              >
                Semua
              </button>
              <button
                onClick={() => setCurrentCategory('penting')}
                className={`btn ${currentCategory === 'penting' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
              >
                Penting
              </button>
              <button
                onClick={() => setCurrentCategory('akademik')}
                className={`btn ${currentCategory === 'akademik' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
              >
                Akademik
              </button>
              <button
                onClick={() => setCurrentCategory('kegiatan')}
                className={`btn ${currentCategory === 'kegiatan' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
              >
                Kegiatan
              </button>
              <button
                onClick={() => setCurrentCategory('keuangan')}
                className={`btn ${currentCategory === 'keuangan' ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
              >
                Keuangan
              </button>
            </div>

            <input
              type="text"
              className="form-input"
              placeholder="Cari pengumuman..."
              value={annSearch}
              onChange={(e) => setAnnSearch(e.target.value)}
              style={{ minWidth: '180px', flex: 1, maxWidth: '280px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
            />
          </div>

          {filteredAnnouncements.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, margin: 0 }}>Tidak ada pengumuman ditemukan</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Belum ada warta untuk filter pencarian ini.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredAnnouncements.map(ann => {
                const dateObj = new Date(ann.createdAt);
                const dateStr = !isNaN(dateObj) ? `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}` : '';

                return (
                  <div
                    key={ann.id}
                    className="card"
                    style={{
                      padding: '1.25rem 1.4rem',
                      borderLeft: ann.isPinned ? '3px solid var(--primary)' : '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          {ann.isPinned && <span className="notion-tag notion-tag-orange">📌 Disematkan</span>}
                          <span className="notion-tag notion-tag-gray" style={{ textTransform: 'uppercase' }}>
                            {ann.category}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dateStr}</span>
                        </div>

                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
                          {ann.title}
                        </h3>

                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-line', margin: '0 0 0.65rem 0' }}>
                          {ann.content}
                        </p>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Ditulis oleh: <strong style={{ color: 'var(--text-primary)' }}>{ann.author}</strong>
                        </div>
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

      {/* 4. MEMBERS CONTENT */}
      {activeTab === 'members' && (
        <div>
          {/* Properties bar */}
          <div className="notion-properties-bar">
            <div className="notion-prop-item">
              <span style={{ color: 'var(--text-muted)' }}>Wali Kelas:</span>
              <strong>{classInfo.homeroomTeacher}</strong>
            </div>
            <div className="notion-prop-item">
              <span style={{ color: 'var(--text-muted)' }}>Tahun Ajaran:</span>
              <span>{classInfo.academicYear}</span>
            </div>
            <div className="notion-prop-item">
              <span style={{ color: 'var(--text-muted)' }}>Total Siswa:</span>
              <span className="notion-tag notion-tag-gray">{members.length} Siswa</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Menampilkan {filteredMembers.length} siswa
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama, absen, atau peran..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              style={{ minWidth: '180px', flex: 1, maxWidth: '280px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
            />
          </div>

          <div className="notion-table-wrapper">
            <table className="notion-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Absen</th>
                  <th>Nama Lengkap</th>
                  <th style={{ width: '130px' }}>NISN</th>
                  <th style={{ width: '170px' }}>Jabatan / Peran</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Tidak ada siswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map(m => {
                    const isMe = m.id === currentUser.id;
                    const isOfficer = m.roleTitle && m.roleTitle !== 'Anggota' && m.roleTitle !== 'Siswa';

                    return (
                      <tr key={m.id} style={{ backgroundColor: isMe ? 'var(--bg-hover)' : 'transparent' }}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{m.absentNo}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: isMe ? 700 : 'normal' }}>{m.name}</span>
                            {isMe && <span className="notion-tag notion-tag-green">Saya</span>}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                          {m.nisn}
                        </td>
                        <td>
                          <span className={`notion-tag ${isOfficer ? 'notion-tag-orange' : 'notion-tag-gray'}`}>
                            {m.roleTitle || 'Siswa'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Aktif</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
