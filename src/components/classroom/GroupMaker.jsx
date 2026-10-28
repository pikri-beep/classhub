import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, 
  Shuffle, 
  Maximize, 
  Minimize, 
  Filter, 
  ArrowLeftRight, 
  CheckSquare, 
  Square, 
  X,
  Search,
  Minus,
  Plus,
  Settings2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function GroupMaker({ members = [], isAdmin = false }) {
  const { showToast } = useToast();
  const containerRef = useRef(null);

  // Helper to resolve student display name (clean name)
  const getDisplayName = (m) => {
    if (m.nickname && m.nickname.trim()) return m.nickname.trim();
    if (m.name && m.name.trim()) return m.name.trim().split(/\s+/)[0];
    return `Siswa ${m.absentNo || ''}`;
  };

  // State: List of present / active students
  const [studentList, setStudentList] = useState(() => {
    return (members || []).map(m => ({
      id: String(m.id || m.absentNo || Math.random()),
      name: getDisplayName(m),
      fullName: m.name,
      absentNo: m.absentNo,
      isPresent: true
    }));
  });

  // Re-sync if members data changes
  useEffect(() => {
    if (members && members.length > 0) {
      setStudentList(prev => {
        const presenceMap = new Map(prev.map(p => [p.id, p.isPresent]));
        return members.map(m => {
          const id = String(m.id || m.absentNo || Math.random());
          return {
            id,
            name: getDisplayName(m),
            fullName: m.name,
            absentNo: m.absentNo,
            isPresent: presenceMap.has(id) ? presenceMap.get(id) : true
          };
        });
      });
    }
  }, [members]);

  // View state: 'config' (pengaturan) atau 'results' (halaman hasil)
  const [viewState, setViewState] = useState('config');

  // Generation options
  const [splitMode, setSplitMode] = useState('byGroups'); // 'byGroups' | 'byMembers'
  const [targetNumber, setTargetNumber] = useState(4); // default 4 groups
  const [groups, setGroups] = useState([]);
  const [shuffleKey, setShuffleKey] = useState(0); // for staggered reveal animation trigger
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceSearch, setAttendanceSearch] = useState('');

  // Admin Manual Swap State: { groupIdx, memberIdx, student }
  const [swapSource, setSwapSource] = useState(null);

  // Active (present) students
  const presentStudents = useMemo(() => {
    return studentList.filter(s => s.isPresent);
  }, [studentList]);

  // Fullscreen tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen tidak didukung:', err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Generate / Randomize Groups (Fisher-Yates Shuffle)
  const handleGenerateGroups = () => {
    if (presentStudents.length === 0) {
      showToast('Tidak ada siswa yang berstatus hadir!', 'warning');
      return;
    }

    // Shuffle present students
    const shuffled = [...presentStudents];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let numGroups = targetNumber;
    if (splitMode === 'byMembers') {
      const membersPerGroup = Math.max(1, targetNumber);
      numGroups = Math.max(1, Math.ceil(shuffled.length / membersPerGroup));
    } else {
      numGroups = Math.max(1, Math.min(targetNumber, shuffled.length));
    }

    // Initialize groups
    const result = Array.from({ length: numGroups }, (_, i) => ({
      id: `group-${i + 1}`,
      name: `Kelompok ${i + 1}`,
      members: []
    }));

    // Distribute students round-robin
    shuffled.forEach((student, index) => {
      const groupIdx = index % numGroups;
      result[groupIdx].members.push(student);
    });

    setGroups(result);
    setSwapSource(null);
    setShuffleKey(prev => prev + 1);
    setViewState('results'); // Langsung beralih ke halaman hasilnya!

    // Smooth scroll to top of view
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    showToast(`Berhasil membagi ${result.length} kelompok! 🎉`, 'success');
  };

  // Stepper increment / decrement
  const handleStep = (delta) => {
    setTargetNumber(prev => {
      const next = prev + delta;
      const min = 2;
      const max = Math.max(2, presentStudents.length);
      return Math.min(max, Math.max(min, next));
    });
  };

  // Admin Manual Swap Click Handler
  const handleStudentClick = (groupIdx, memberIdx, student) => {
    if (!isAdmin) return;

    if (!swapSource) {
      setSwapSource({ groupIdx, memberIdx, student });
      showToast(`Pilih siswa lain untuk ditukar dengan "${student.name}"`, 'info');
    } else {
      if (swapSource.groupIdx === groupIdx && swapSource.memberIdx === memberIdx) {
        setSwapSource(null);
        return;
      }

      setGroups(prevGroups => {
        const next = prevGroups.map(g => ({ ...g, members: [...g.members] }));
        const studentA = next[swapSource.groupIdx].members[swapSource.memberIdx];
        const studentB = next[groupIdx].members[memberIdx];

        next[swapSource.groupIdx].members[swapSource.memberIdx] = studentB;
        next[groupIdx].members[memberIdx] = studentA;

        return next;
      });

      showToast(`Berhasil menukar "${swapSource.student.name}" dengan "${student.name}"!`, 'success');
      setSwapSource(null);
    }
  };

  // Toggle student presence in modal
  const handleTogglePresence = (id) => {
    setStudentList(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isPresent: !s.isPresent };
      }
      return s;
    }));
  };

  // Mark all present / absent
  const handleSetAllPresence = (status) => {
    setStudentList(prev => prev.map(s => ({ ...s, isPresent: status })));
  };

  // Filtered attendance modal list
  const filteredAttendance = studentList.filter(s => {
    if (!attendanceSearch.trim()) return true;
    const q = attendanceSearch.toLowerCase().trim();
    return (s.name || '').toLowerCase().includes(q) || (s.fullName || '').toLowerCase().includes(q);
  });

  const absentCount = studentList.filter(s => !s.isPresent).length;

  return (
    <div 
      ref={containerRef}
      className={`group-maker-container ${isFullscreen ? 'group-maker-fullscreen' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative',
        padding: isFullscreen ? '1.5rem 2rem' : '0.25rem 0',
        backgroundColor: isFullscreen ? '#0B0F19' : 'transparent',
        minHeight: isFullscreen ? '100vh' : 'auto'
      }}
    >
      {/* =====================================================================
          VIEW 1: FORM PENGATURAN PEMBAGI KELOMPOK
          ===================================================================== */}
      {viewState === 'config' ? (
        <div className="group-maker-config-card">
          {/* Top Controls: Mode Switch & Attendance Pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
            {/* Mode Switch Pills */}
            <div className="clean-filter-chips" style={{ margin: 0 }}>
              <button
                type="button"
                onClick={() => setSplitMode('byGroups')}
                className={`clean-filter-chip ${splitMode === 'byGroups' ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                Jumlah Kelompok
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('byMembers')}
                className={`clean-filter-chip ${splitMode === 'byMembers' ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                Siswa per Kelompok
              </button>
            </div>

            {/* Attendance Trigger Pill */}
            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(true)}
              className="btn btn-outline btn-sm"
              style={{ 
                fontSize: '0.76rem', 
                gap: '0.35rem',
                padding: '0.35rem 0.65rem'
              }}
              title="Atur siswa yang hadir atau absen hari ini"
            >
              <Filter size={13} color="var(--primary)" />
              <span>{presentStudents.length} Siswa Hadir</span>
              {absentCount > 0 && (
                <span className="notion-tag notion-tag-red" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
                  {absentCount} Absen
                </span>
              )}
            </button>
          </div>

          {/* Stepper (- / +) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0' }}>
            <div className="group-maker-stepper-box">
              <button
                type="button"
                onClick={() => handleStep(-1)}
                disabled={targetNumber <= 2}
                className="group-maker-stepper-btn"
                title="Kurangi"
              >
                <Minus size={14} />
              </button>
              <div className="group-maker-stepper-val">
                {targetNumber}
              </div>
              <button
                type="button"
                onClick={() => handleStep(1)}
                disabled={targetNumber >= presentStudents.length}
                className="group-maker-stepper-btn"
                title="Tambah"
              >
                <Plus size={14} />
              </button>
            </div>

            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {splitMode === 'byGroups' ? 'Kelompok yang Ingin Dibuat' : 'Siswa per Kelompok'}
            </span>
          </div>

          {/* Bottom Launch Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={handleGenerateGroups}
              className="btn btn-primary"
              style={{ 
                flex: 1, 
                height: '44px', 
                fontWeight: 800, 
                fontSize: '0.95rem',
                gap: '0.5rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <Shuffle size={16} />
              <span>Bagikan Kelompok</span>
            </button>

            {groups.length > 0 && (
              <button
                type="button"
                onClick={() => setViewState('results')}
                className="btn btn-secondary"
                style={{ height: '44px', fontSize: '0.82rem', fontWeight: 600, padding: '0 0.85rem' }}
                title="Lihat hasil kelompok sebelumnya"
              >
                Lihat Hasil Sebelumnya
              </button>
            )}
          </div>
        </div>
      ) : (
        /* =====================================================================
            VIEW 2: HALAMAN HASIL KELOMPOK (FULL FOCUS ON CARDS & REVEAL ANIMATION)
            ===================================================================== */
        <div>
          {/* Top Results Navigation Toolbar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <button
              type="button"
              onClick={() => setViewState('config')}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem', fontSize: '0.78rem', fontWeight: 600 }}
              title="Kembali untuk mengubah jumlah kelompok"
            >
              <Settings2 size={13} />
              <span>Ubah Pengaturan</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <button
                type="button"
                onClick={handleGenerateGroups}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700 }}
                title="Acak ulang susunan kelompok"
              >
                <Shuffle size={13} />
                <span>Acak Ulang</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="btn btn-ghost btn-sm btn-icon"
                style={{ color: 'var(--text-secondary)' }}
                title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh Proyektor'}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>
          </div>

          {/* Admin Swap Hint Banner */}
          {isAdmin && swapSource && (
            <div 
              style={{
                backgroundColor: 'var(--primary-soft)',
                border: '1px solid var(--primary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                color: 'var(--primary)',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ArrowLeftRight size={15} />
                <span>Klik siswa lain untuk ditukar dengan <strong>"{swapSource.student.name}"</strong></span>
              </div>
              <button 
                type="button"
                onClick={() => setSwapSource(null)}
                className="btn btn-ghost btn-xs"
                style={{ color: 'var(--danger)', fontWeight: 700 }}
              >
                Batal
              </button>
            </div>
          )}

          {/* Groups Grid with Staggered Reveal Animation */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isFullscreen 
                ? 'repeat(auto-fit, minmax(280px, 1fr))' 
                : 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.75rem',
              width: '100%'
            }}
          >
            {groups.map((group, groupIdx) => (
              <div 
                key={`${shuffleKey}-${group.id}`}
                className="group-card-notion"
              >
                {/* Clean Group Header */}
                <div className="group-card-notion-header">
                  <span className="group-card-notion-title">
                    {group.name}
                  </span>
                  <span className="group-card-notion-count">
                    {group.members.length} Siswa
                  </span>
                </div>

                {/* Group Members List with Staggered Reveal Effect */}
                <div className="group-card-notion-body">
                  {group.members.map((member, memberIdx) => {
                    const isSelected = swapSource && swapSource.groupIdx === groupIdx && swapSource.memberIdx === memberIdx;
                    // Staggered delay: each name reveals smoothly one by one
                    const revealDelay = Math.min(1.2, (groupIdx * 0.08) + (memberIdx * 0.045));

                    return (
                      <div 
                        key={`${shuffleKey}-${member.id}`}
                        onClick={() => handleStudentClick(groupIdx, memberIdx, member)}
                        className={`group-member-row group-member-reveal ${isSelected ? 'is-swap-selected' : ''}`}
                        style={{ 
                          cursor: isAdmin ? 'pointer' : 'default',
                          animationDelay: `${revealDelay}s`
                        }}
                        title={isAdmin ? (isSelected ? 'Batal tukar' : 'Klik untuk menukar siswa ini') : undefined}
                      >
                        <span className="group-member-idx">
                          {memberIdx + 1}.
                        </span>

                        <span className="group-member-name" title={member.fullName || member.name}>
                          {member.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: FILTER KEHADIRAN SISWA
          ===================================================================== */}
      {isAttendanceModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAttendanceModalOpen(false);
          }}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {/* Modal Header */}
            <div 
              style={{
                padding: '1.1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Filter Kehadiran Siswa
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {presentStudents.length} dari {studentList.length} siswa siap dimasukkan ke kelompok.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="btn btn-ghost btn-sm btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search & Bulk Actions Bar */}
            <div 
              style={{
                padding: '0.65rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cari nama siswa..."
                  value={attendanceSearch}
                  onChange={e => setAttendanceSearch(e.target.value)}
                  style={{ paddingLeft: '1.9rem', fontSize: '0.82rem', height: '32px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleSetAllPresence(true)}
                  className="btn btn-secondary btn-xs"
                  style={{ fontSize: '0.74rem' }}
                >
                  Semua Hadir
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllPresence(false)}
                  className="btn btn-ghost btn-xs"
                  style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}
                >
                  Kosongkan
                </button>
              </div>
            </div>

            {/* Students List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {filteredAttendance.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Tidak ada siswa yang cocok dengan "{attendanceSearch}".
                </div>
              ) : (
                filteredAttendance.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => handleTogglePresence(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: s.isPresent ? 'var(--bg-surface)' : 'rgba(239, 68, 68, 0.05)',
                      border: `1px solid ${s.isPresent ? 'var(--border)' : 'rgba(239, 68, 68, 0.2)'}`,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {s.isPresent ? (
                        <CheckSquare size={16} color="var(--primary)" />
                      ) : (
                        <Square size={16} color="var(--danger)" />
                      )}
                      <span 
                        style={{ 
                          fontSize: '0.86rem', 
                          fontWeight: 600,
                          color: s.isPresent ? 'var(--text-primary)' : 'var(--text-muted)',
                          textDecoration: s.isPresent ? 'none' : 'line-through'
                        }}
                      >
                        {s.name}
                      </span>
                    </div>

                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700,
                        color: s.isPresent ? 'var(--success)' : 'var(--danger)'
                      }}
                    >
                      {s.isPresent ? 'Hadir' : 'Absen'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div 
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}
            >
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700 }}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
