import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Phone
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

export default function MembersTab() {
  const { data, addMember, updateMember, deleteMember } = useStore();
  const { showToast } = useToast();

  const members = data.members || [];

  // Search & Filter state
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('all');

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Form state - Add Member
  const [studentAbsentNo, setStudentAbsentNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentNickname, setStudentNickname] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentRoleTitle, setStudentRoleTitle] = useState('Anggota');

  // Form state - Edit Member
  const [editMemberAbsentNo, setEditMemberAbsentNo] = useState('');
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberNickname, setEditMemberNickname] = useState('');
  const [editMemberPhone, setEditMemberPhone] = useState('');
  const [editMemberRoleTitle, setEditMemberRoleTitle] = useState('Anggota');

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const q = memberSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        String(m.absentNo || '').includes(q) ||
        (m.roleTitle || '').toLowerCase().includes(q) ||
        (m.phone || '').includes(q);

      const isAdminRole = m.role === 'admin' || (m.roleTitle && m.roleTitle !== 'Anggota' && m.roleTitle !== 'Siswa');
      const matchesFilter = memberRoleFilter === 'all'
        ? true
        : memberRoleFilter === 'admin'
          ? isAdminRole
          : !isAdminRole;

      return matchesSearch && matchesFilter;
    });
  }, [members, memberSearchQuery, memberRoleFilter]);

  const handleCreateMember = (e) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    addMember({
      absentNo: Number(studentAbsentNo) || (members.length + 1),
      name: studentName.trim(),
      nickname: studentNickname.trim(),
      phone: studentPhone.trim(),
      roleTitle: studentRoleTitle.trim() || 'Anggota'
    });
    setIsAddMemberOpen(false);
    setStudentName('');
    setStudentNickname('');
    setStudentPhone('');
    showToast(`Siswa "${studentName.trim()}" berhasil ditambahkan! 🎉`, 'success');
  };

  const handleUpdateMember = (e) => {
    e.preventDefault();
    if (!selectedMemberForEdit || !editMemberName.trim()) return;
    updateMember(selectedMemberForEdit.id, {
      absentNo: Number(editMemberAbsentNo),
      name: editMemberName.trim(),
      nickname: editMemberNickname.trim(),
      phone: editMemberPhone.trim(),
      roleTitle: editMemberRoleTitle.trim() || 'Anggota'
    });
    setIsEditMemberOpen(false);
    showToast(`Data siswa "${editMemberName.trim()}" diperbarui!`, 'success');
  };

  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          Data Siswa & Jabatan
        </h3>
        <button
          type="button"
          onClick={() => {
            setStudentAbsentNo(members.length + 1);
            setStudentName('');
            setStudentNickname('');
            setStudentPhone('');
            setStudentRoleTitle('Anggota');
            setIsAddMemberOpen(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ fontWeight: 600, gap: '0.35rem' }}
        >
          <Plus size={15} />
          <span>Tambah Siswa</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div
        className="admin-members-filter-bar"
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
          value={memberSearchQuery}
          onChange={(e) => setMemberSearchQuery(e.target.value)}
          onClear={() => setMemberSearchQuery('')}
          placeholder="Cari nama, absen, jabatan..."
          style={{ maxWidth: '280px', height: '36px' }}
        />
        <FilterPills
          options={[
            { value: 'all', label: 'Semua' },
            { value: 'admin', label: 'Pengurus' },
            { value: 'member', label: 'Siswa' }
          ]}
          activeValue={memberRoleFilter}
          onChange={setMemberRoleFilter}
        />
      </div>

      {/* 1. Desktop View: Table */}
      <div className="admin-members-desktop-view" style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <table className="notion-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
              <th style={{ width: '45px', textAlign: 'center', padding: '0.75rem 0.85rem' }}>#</th>
              <th style={{ padding: '0.75rem 0.85rem' }}>Nama Siswa</th>
              <th style={{ padding: '0.75rem 0.85rem' }}>WhatsApp</th>
              <th style={{ padding: '0.75rem 0.85rem' }}>Jabatan</th>
              <th style={{ width: '50px', textAlign: 'center', padding: '0.75rem 0.85rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2.5rem 1rem' }}>
                  <EmptyState
                    title={memberSearchQuery || memberRoleFilter !== 'all' ? "Siswa Tidak Ditemukan" : "Belum Ada Siswa"}
                  />
                </td>
              </tr>
            ) : (
              filteredMembers.map(m => {
                const hasSpecialRole = m.roleTitle && m.roleTitle !== 'Anggota' && m.roleTitle !== 'Siswa';
                const cleanPhone = (m.phone || '').replace(/[^0-9]/g, '');
                const waFormatted = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', padding: '0.75rem 0.85rem', fontSize: '0.82rem' }}>
                      {String(m.absentNo || 0).padStart(2, '0')}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 600 }}>{m.name}</strong>
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      {m.phone ? (
                        <a
                          href={`https://wa.me/${waFormatted}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: '#16a34a',
                            fontWeight: 500,
                            fontSize: '0.8rem',
                            textDecoration: 'none',
                            backgroundColor: 'rgba(22, 163, 74, 0.08)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid rgba(22, 163, 74, 0.2)'
                          }}
                          title={`Chat WhatsApp dengan ${m.name}`}
                        >
                          <Phone size={11} strokeWidth={2.2} />
                          <span>{m.phone}</span>
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      {hasSpecialRole ? (
                        <span className="notion-tag notion-tag-orange" style={{ fontWeight: 600, fontSize: '0.74rem' }}>
                          {m.roleTitle}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.75rem 0.85rem' }}>
                      <ActionMenu
                        align="right"
                        items={[
                          {
                            label: 'Edit Data',
                            icon: <Edit3 size={14} />,
                            onClick: () => {
                              setSelectedMemberForEdit(m);
                              setEditMemberAbsentNo(m.absentNo || '');
                              setEditMemberName(m.name || '');
                              setEditMemberPhone(m.phone || '');
                              setEditMemberRoleTitle(m.roleTitle || 'Anggota');
                              setIsEditMemberOpen(true);
                            }
                          },
                          {
                            label: 'Hapus Siswa',
                            icon: <Trash2 size={14} />,
                            variant: 'danger',
                            onClick: () => setMemberToDelete(m)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile View: Vertical Card List */}
      <div className="admin-members-mobile-view">
        {filteredMembers.length === 0 ? (
          <EmptyState
            title={memberSearchQuery || memberRoleFilter !== 'all' ? "Siswa Tidak Ditemukan" : "Belum Ada Siswa"}
          />
        ) : (
          filteredMembers.map(m => {
            const hasSpecialRole = m.roleTitle && m.roleTitle !== 'Anggota' && m.roleTitle !== 'Siswa';
            const cleanPhone = (m.phone || '').replace(/[^0-9]/g, '');
            const waFormatted = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

            return (
              <div
                key={m.id}
                className="card admin-student-mobile-card"
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    #{String(m.absentNo || 0).padStart(2, '0')}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <span>{m.name}</span>
                      {m.nickname && (
                        <span 
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--primary-soft)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary-border)'
                          }}
                        >
                          {m.nickname}
                        </span>
                      )}
                    </div>

                    {hasSpecialRole && (
                      <div style={{ marginTop: '0.15rem' }}>
                        <span
                          className="notion-tag notion-tag-orange"
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.1rem 0.4rem'
                          }}
                        >
                          {m.roleTitle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  {m.phone && (
                    <a
                      href={`https://wa.me/${waFormatted}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Chat WhatsApp dengan ${m.name}`}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'rgba(22, 163, 74, 0.08)',
                        border: '1px solid rgba(22, 163, 74, 0.2)',
                        color: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                      title={`Chat WhatsApp dengan ${m.name}`}
                    >
                      <Phone size={13} strokeWidth={2.2} />
                    </a>
                  )}
                  <ActionMenu
                    align="right"
                    items={[
                      {
                        label: 'Edit Data',
                        icon: <Edit3 size={14} />,
                        onClick: () => {
                          setSelectedMemberForEdit(m);
                          setEditMemberAbsentNo(m.absentNo || '');
                          setEditMemberName(m.name || '');
                          setEditMemberNickname(m.nickname || '');
                          setEditMemberPhone(m.phone || '');
                          setEditMemberRoleTitle(m.roleTitle || 'Anggota');
                          setIsEditMemberOpen(true);
                        }
                      },
                      {
                        label: 'Hapus Siswa',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        onClick: () => setMemberToDelete(m)
                      }
                    ]}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: INPUT SISWA BARU */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Input Siswa Baru">
        <form onSubmit={handleCreateMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">No. Absen</label>
              <input
                type="number"
                className="form-input"
                placeholder="1"
                value={studentAbsentNo}
                onChange={(e) => setStudentAbsentNo(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Lengkap Siswa</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Muhammad Aditya Pratama"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Panggilan</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Adit"
                value={studentNickname}
                onChange={(e) => setStudentNickname(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">No. WhatsApp (Opsional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Contoh: 08123456789"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jabatan / Peran Kelas</label>
              <select
                className="form-select"
                value={studentRoleTitle}
                onChange={(e) => setStudentRoleTitle(e.target.value)}
              >
                <option value="Anggota">Anggota</option>
                <option value="Ketua Kelas">Ketua Kelas</option>
                <option value="Wakil Ketua">Wakil Ketua</option>
                <option value="Sekretaris">Sekretaris</option>
                <option value="Bendahara">Bendahara</option>
                <option value="Seksi Kebersihan">Seksi Kebersihan</option>
                <option value="Seksi Keamanan">Seksi Keamanan</option>
                <option value="Seksi Olahraga">Seksi Olahraga</option>
                <option value="Seksi Rohani">Seksi Rohani</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddMemberOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Siswa
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT DATA SISWA */}
      <Modal isOpen={isEditMemberOpen} onClose={() => setIsEditMemberOpen(false)} title="Edit Data Siswa">
        <form onSubmit={handleUpdateMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">No. Absen</label>
              <input
                type="number"
                className="form-input"
                value={editMemberAbsentNo}
                onChange={(e) => setEditMemberAbsentNo(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Lengkap Siswa</label>
              <input
                type="text"
                className="form-input"
                value={editMemberName}
                onChange={(e) => setEditMemberName(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Panggilan</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Adit"
                value={editMemberNickname}
                onChange={(e) => setEditMemberNickname(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">No. WhatsApp (Opsional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Contoh: 08123456789"
                value={editMemberPhone}
                onChange={(e) => setEditMemberPhone(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jabatan / Peran Kelas</label>
              <select
                className="form-select"
                value={editMemberRoleTitle}
                onChange={(e) => setEditMemberRoleTitle(e.target.value)}
              >
                <option value="Anggota">Anggota</option>
                <option value="Ketua Kelas">Ketua Kelas</option>
                <option value="Wakil Ketua">Wakil Ketua</option>
                <option value="Sekretaris">Sekretaris</option>
                <option value="Bendahara">Bendahara</option>
                <option value="Seksi Kebersihan">Seksi Kebersihan</option>
                <option value="Seksi Keamanan">Seksi Keamanan</option>
                <option value="Seksi Olahraga">Seksi Olahraga</option>
                <option value="Seksi Rohani">Seksi Rohani</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditMemberOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Perbarui Data
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DIALOG: HAPUS SISWA */}
      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => {
          if (memberToDelete) {
            deleteMember(memberToDelete.id);
            showToast(`Siswa "${memberToDelete.name}" telah dihapus dari kelas.`, 'info');
            setMemberToDelete(null);
          }
        }}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus "${memberToDelete?.name}" (No. Absen ${memberToDelete?.absentNo}) dari daftar kelas?`}
        confirmLabel="Hapus Siswa"
        variant="danger"
      />
    </div>
  );
}
