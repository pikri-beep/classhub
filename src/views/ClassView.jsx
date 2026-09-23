import React, { useState } from 'react';
import { Megaphone, Users, Plus, Pin, PinOff, Trash2, Settings, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { processImageFile } from '../lib/imageUtils';
import Modal from '../components/Modal';

export default function ClassView() {
  const { currentUser, isAdmin } = useAuth();
  const { data, addAnnouncement, togglePinAnnouncement, deleteAnnouncement, updateClassInfo } = useStore();
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

  // Edit class profile modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editAppName, setEditAppName] = useState('');
  const [editName, setEditName] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [editAcademicYear, setEditAcademicYear] = useState('');
  const [editHomeroomTeacher, setEditHomeroomTeacher] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [isProcessingImg, setIsProcessingImg] = useState(false);

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

  const handleOpenEditProfile = () => {
    setEditAppName(classInfo.appName || 'ClassHub');
    setEditName(classInfo.name || 'Kelas');
    setEditSchool(classInfo.school || 'SMK Negeri 1');
    setEditAcademicYear(classInfo.academicYear || '2026/2027');
    setEditHomeroomTeacher(classInfo.homeroomTeacher || '');
    setEditLogoUrl(classInfo.logoUrl || '');
    setIsEditProfileOpen(true);
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingImg(true);
      const dataUrl = await processImageFile(file, 320, 0.85);
      setEditLogoUrl(dataUrl);
      showToast('Gambar berhasil dimuat dan dikompresi!', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal memproses gambar', 'error');
    } finally {
      setIsProcessingImg(false);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateClassInfo({
      appName: editAppName.trim() || 'ClassHub',
      name: editName.trim() || 'Kelas',
      school: editSchool.trim(),
      academicYear: editAcademicYear.trim(),
      homeroomTeacher: editHomeroomTeacher.trim(),
      logoUrl: editLogoUrl.trim()
    });
    setIsEditProfileOpen(false);
    showToast('Identitas kelas berhasil diperbarui! 🎉', 'success');
  };

  return (
    <div>

      {/* 1. CLASS IDENTITY BANNER / CARD */}
      <div className="card" style={{
        padding: '1.25rem 1.4rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--primary-soft) 100%)',
        borderColor: 'var(--primary-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
          {/* Class Logo / Photo */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            border: '2px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.35rem',
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {classInfo.logoUrl ? (
              <img 
                src={classInfo.logoUrl} 
                alt={classInfo.name || 'Foto Kelas'} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              (classInfo.name || 'KL').slice(0, 2).toUpperCase()
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                {classInfo.appName || 'ClassHub'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tahun Ajaran {classInfo.academicYear || '2026/2027'}
              </span>
            </div>

            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0.2rem 0',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {classInfo.name || 'Kelas Belum Dinamai'}
            </h2>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span>🏫 {classInfo.school || 'SMK Negeri 1'}</span>
              <span>•</span>
              <span>👨‍🏫 Wali: {classInfo.homeroomTeacher || '-'}</span>
              <span>•</span>
              <span>👥 {members.length} Siswa</span>
            </div>
          </div>
        </div>

        {/* Edit Button for Admin */}
        {isAdmin && (
          <button
            onClick={handleOpenEditProfile}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 700, gap: '0.4rem', borderRadius: 'var(--radius-sm)' }}
          >
            <Settings size={14} />
            <span>Edit Profil & Foto Kelas</span>
          </button>
        )}
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
                Keuangan
              </button>
            </div>

            <input
              type="text"
              className="form-input"
              placeholder="Cari pengumuman..."
              value={annSearch}
              onChange={(e) => setAnnSearch(e.target.value)}
              style={{ minWidth: '180px', maxWidth: '280px', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
            />
          </div>

          {/* Announcement Cards List */}
          {filteredAnnouncements.length === 0 ? (
            <div className="clean-empty-state" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Belum ada pengumuman yang sesuai filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredAnnouncements.map(ann => {
                const dateObj = new Date(ann.createdAt);
                const dateStr = !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '';

                return (
                  <div
                    key={ann.id}
                    className="card"
                    style={{
                      padding: '1.15rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      position: 'relative',
                      borderLeft: ann.isPinned ? '4px solid var(--primary)' : '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        {ann.isPinned && (
                          <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.7rem', fontWeight: 700, gap: '0.25rem' }}>
                            <Pin size={11} /> Disematkan
                          </span>
                        )}
                        <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                          {ann.category || 'Warta'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {dateStr}
                        </span>
                      </div>

                      {isAdmin && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            onClick={() => togglePinAnnouncement(ann.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.25rem 0.4rem', color: ann.isPinned ? 'var(--primary)' : 'var(--text-muted)' }}
                            title={ann.isPinned ? 'Lepas Sematan' : 'Sematkan Pengumuman'}
                          >
                            {ann.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus pengumuman ini?')) {
                                deleteAnnouncement(ann.id);
                                showToast('Pengumuman dihapus.', 'info');
                              }
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.25rem 0.4rem', color: 'var(--danger)' }}
                            title="Hapus Pengumuman"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {ann.title}
                    </h3>

                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      margin: 0,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {ann.content}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Ditulis oleh: <strong>{ann.author || 'Pengurus Kelas'}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. CLASSMATES ROSTER */}
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
              {filteredMembers.length} Siswa Terdaftar
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

      {/* MODAL: EDIT CLASS PROFILE & LOGO */}
      <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Edit Profil & Identitas Kelas">
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Logo / Foto Kelas Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-soft)',
              border: '2px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontWeight: 800,
              fontSize: '1.25rem',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {editLogoUrl ? (
                <img src={editLogoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={24} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Logo / Foto Kelas (Tampil di Web & Header)
              </label>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', fontSize: '0.75rem', gap: '0.35rem', padding: '0.35rem 0.65rem' }}>
                  <Upload size={13} />
                  <span>{isProcessingImg ? 'Memproses...' : 'Upload dari HP/Laptop'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    style={{ display: 'none' }}
                    disabled={isProcessingImg}
                  />
                </label>

                {editLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setEditLogoUrl('')}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)', fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Atau URL manual */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Atau Link URL Gambar Online
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://contoh.com/logo-kelas.png"
              value={editLogoUrl.startsWith('data:') ? '' : editLogoUrl}
              onChange={(e) => setEditLogoUrl(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Web / Aplikasi</label>
              <input
                type="text"
                className="form-input"
                placeholder="ClassHub"
                value={editAppName}
                onChange={(e) => setEditAppName(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                Mengganti nama brand "ClassHub" di header
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Kelas</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: XII PPLG 1"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Sekolah</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: SMK Negeri 1 Cibinong"
              value={editSchool}
              onChange={(e) => setEditSchool(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tahun Ajaran</label>
              <input
                type="text"
                className="form-input"
                placeholder="2026/2027"
                value={editAcademicYear}
                onChange={(e) => setEditAcademicYear(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Wali Kelas</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nama Bapak/Ibu Guru"
                value={editHomeroomTeacher}
                onChange={(e) => setEditHomeroomTeacher(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={() => setIsEditProfileOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Identitas Kelas
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
