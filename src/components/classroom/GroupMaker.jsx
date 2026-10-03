import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, 
  Shuffle, 
  Maximize, 
  Minimize, 
  Copy, 
  Check, 
  Filter, 
  ArrowLeftRight, 
  CheckSquare, 
  Square, 
  X,
  Share2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Harmonious accent colors for group cards
const GROUP_PALETTE = [
  { border: '#F59E0B', softBg: 'rgba(245, 158, 11, 0.08)', text: '#D97706', badge: '#F59E0B' },
  { border: '#10B981', softBg: 'rgba(16, 185, 129, 0.08)', text: '#059669', badge: '#10B981' },
  { border: '#3B82F6', softBg: 'rgba(59, 130, 246, 0.08)', text: '#2563EB', badge: '#3B82F6' },
  { border: '#EC4899', softBg: 'rgba(236, 72, 153, 0.08)', text: '#DB2777', badge: '#EC4899' },
  { border: '#8B5CF6', softBg: 'rgba(139, 92, 246, 0.08)', text: '#7C3AED', badge: '#8B5CF6' },
  { border: '#06B6D4', softBg: 'rgba(6, 182, 212, 0.08)', text: '#0891B2', badge: '#06B6D4' },
  { border: '#F97316', softBg: 'rgba(249, 115, 22, 0.08)', text: '#EA580C', badge: '#F97316' },
  { border: '#14B8A6', softBg: 'rgba(20, 184, 166, 0.08)', text: '#0D9488', badge: '#14B8A6' },
  { border: '#6366F1', softBg: 'rgba(99, 102, 241, 0.08)', text: '#4F46E5', badge: '#6366F1' },
  { border: '#84CC16', softBg: 'rgba(132, 204, 22, 0.08)', text: '#65A30D', badge: '#84CC16' }
];

export default function GroupMaker({ members = [], isAdmin = false }) {
  const { showToast } = useToast();
  const containerRef = useRef(null);

  // Helper to resolve student display name (prioritizes admin nickname)
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

  // Generation options
  const [splitMode, setSplitMode] = useState('byGroups'); // 'byGroups' | 'byMembers'
  const [targetNumber, setTargetNumber] = useState(5); // 5 groups or 5 per group
  const [groups, setGroups] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);

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
    showToast(`Berhasil membagi ${result.length} kelompok! 🎉`, 'success');
  };

  // Admin Manual Swap Click Handler
  const handleStudentClick = (groupIdx, memberIdx, student) => {
    if (!isAdmin) return; // Strict: only Admin can manually swap

    if (!swapSource) {
      // Pick first student for swap
      setSwapSource({ groupIdx, memberIdx, student });
      showToast(`Pilih siswa lain untuk ditukar dengan "${student.name}"`, 'info');
    } else {
      // Picked second student: execute swap
      if (swapSource.groupIdx === groupIdx && swapSource.memberIdx === memberIdx) {
        // Clicked same student -> cancel
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

  // WhatsApp Format Generator (Admin Only)
  const handleCopyWhatsApp = () => {
    if (groups.length === 0) return;

    let text = `👥 *PEMBAGIAN KELOMPOK KELAS*\n`;
    text += `📊 Total: ${groups.length} Kelompok (${presentStudents.length} Siswa Hadir)\n`;
    text += `───────────────────────\n\n`;

    groups.forEach((g, i) => {
      text += `📌 *${g.name}* (${g.members.length} Orang):\n`;
      g.members.forEach((m, idx) => {
        text += `  ${idx + 1}. ${m.name}${m.absentNo ? ` (#${m.absentNo})` : ''}\n`;
      });
      text += `\n`;
    });

    text += `📢 _Dibuat otomatis via ClassHub Toolkit_`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedWA(true);
      showToast('Format kelompok WhatsApp berhasil disalin ke clipboard! 📋', 'success');
      setTimeout(() => setCopiedWA(false), 2500);
    }).catch(() => {
      showToast('Gagal menyalin teks ke clipboard.', 'error');
    });
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

  return (
    <div 
      ref={containerRef}
      className={`group-maker-container ${isFullscreen ? 'group-maker-fullscreen' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative',
        padding: isFullscreen ? '1.5rem 2rem' : '0.5rem 0',
        backgroundColor: isFullscreen ? '#0B0F19' : 'transparent',
        minHeight: isFullscreen ? '100vh' : 'auto'
      }}
    >
      {/* Top Configuration & Action Toolbar */}
      <div 
        style={
          isFullscreen
            ? {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(10px)',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }
            : {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border)'
              }
        }
      >
        {/* Left: Mode & Count controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <button
              onClick={() => setSplitMode('byGroups')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: splitMode === 'byGroups' ? 700 : 500,
                backgroundColor: splitMode === 'byGroups' ? 'var(--primary)' : 'var(--bg-surface)',
                color: splitMode === 'byGroups' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Jumlah Kelompok
            </button>
            <button
              onClick={() => setSplitMode('byMembers')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: splitMode === 'byMembers' ? 700 : 500,
                backgroundColor: splitMode === 'byMembers' ? 'var(--primary)' : 'var(--bg-surface)',
                color: splitMode === 'byMembers' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Siswa per Kelompok
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <input
              type="number"
              min="2"
              max={Math.max(2, presentStudents.length)}
              value={targetNumber}
              onChange={e => setTargetNumber(Math.max(1, Number(e.target.value)))}
              style={{
                width: '60px',
                padding: '0.35rem 0.45rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                textAlign: 'center',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
            />
            <span style={{ fontSize: '0.78rem', color: isFullscreen ? '#E2E8F0' : 'var(--text-muted)' }}>
              {splitMode === 'byGroups' ? 'Kelompok' : 'Orang/Kelompok'}
            </span>
          </div>

          {/* Attendance Filter Trigger */}
          <button
            onClick={() => setIsAttendanceModalOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ 
              fontSize: '0.75rem', 
              gap: '0.35rem',
              borderColor: isFullscreen ? 'rgba(255, 255, 255, 0.2)' : undefined,
              color: isFullscreen ? '#F8FAFC' : undefined
            }}
          >
            <Filter size={13} />
            <span>{presentStudents.length} Siswa Hadir</span>
            {studentList.some(s => !s.isPresent) && (
              <span style={{ fontSize: '0.68rem', backgroundColor: 'var(--danger)', color: '#FFFFFF', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-full)' }}>
                {studentList.filter(s => !s.isPresent).length} Absen
              </span>
            )}
          </button>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            onClick={handleGenerateGroups}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem', fontWeight: 700, padding: '0.45rem 1rem' }}
          >
            <Shuffle size={14} />
            <span>{groups.length === 0 ? 'Bagi Kelompok' : 'Acak Ulang'}</span>
          </button>

          {/* WhatsApp Export Button: STRICTLY ADMIN ONLY */}
          {isAdmin && groups.length > 0 && (
            <button
              onClick={handleCopyWhatsApp}
              className="btn btn-sm"
              title="Salin format kelompok ke WhatsApp"
              style={{
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                gap: '0.35rem',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            >
              {copiedWA ? <Check size={14} /> : <Share2 size={14} />}
              <span>{copiedWA ? 'Tersalin!' : 'Salin ke WA'}</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="btn btn-ghost btn-sm btn-icon"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh Proyektor'}
            style={{ color: isFullscreen ? '#F8FAFC' : 'var(--text-secondary)' }}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Admin Swap Hint Banner */}
      {isAdmin && groups.length > 0 && (
        <div 
          style={{
            backgroundColor: swapSource ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.08)',
            border: `1px solid ${swapSource ? 'var(--primary)' : 'rgba(59, 130, 246, 0.25)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: swapSource ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ArrowLeftRight size={14} />
            <span>
              {swapSource 
                ? `Mode Tukar Aktif: Klik siswa tujuan untuk ditukar dengan "${swapSource.student.name}"`
                : `Wewenang Admin: Anda bisa mengklik nama 2 siswa untuk saling menukar kelompok secara manual.`
              }
            </span>
          </div>
          {swapSource && (
            <button 
              onClick={() => setSwapSource(null)}
              className="btn btn-ghost btn-xs"
              style={{ color: 'var(--danger)', fontWeight: 700 }}
            >
              Batal
            </button>
          )}
        </div>
      )}

      {/* GROUPS PRESENTATION GRID */}
      {groups.length === 0 ? (
        <div 
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            backgroundColor: isFullscreen ? 'rgba(15, 23, 42, 0.4)' : 'var(--bg-surface)',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-xl)',
            margin: '1rem 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <Users size={28} />
          </div>
          <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Belum Ada Kelompok Terbentuk
          </h4>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.5 }}>
            Pilih mode pembagian di atas lalu tekan tombol di bawah untuk mengacak seluruh siswa ke dalam kelompok secara adil.
          </p>
          <button
            onClick={handleGenerateGroups}
            className="btn btn-primary"
            style={{ gap: '0.45rem', fontWeight: 700, borderRadius: 'var(--radius-full)', padding: '0.65rem 1.65rem' }}
          >
            <Shuffle size={15} />
            <span>Mulai Pembagian Kelompok</span>
          </button>
        </div>
      ) : (
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: isFullscreen 
              ? 'repeat(auto-fit, minmax(280px, 1fr))' 
              : 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: isFullscreen ? '1.25rem' : '0.85rem',
            width: '100%'
          }}
        >
          {groups.map((group, groupIdx) => {
            const palette = GROUP_PALETTE[groupIdx % GROUP_PALETTE.length];
            return (
              <div 
                key={group.id}
                style={{
                  backgroundColor: isFullscreen ? 'rgba(30, 41, 59, 0.7)' : 'var(--bg-surface)',
                  border: `2px solid ${palette.border}`,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: isFullscreen ? '0 10px 25px -5px rgba(0,0,0,0.4)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease'
                }}
              >
                {/* Group Card Header */}
                <div 
                  style={{
                    backgroundColor: palette.softBg,
                    borderBottom: `1px solid ${palette.border}`,
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span 
                    style={{ 
                      fontSize: isFullscreen ? '1.15rem' : '0.95rem', 
                      fontWeight: 800, 
                      color: palette.text,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {group.name}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 700,
                      backgroundColor: palette.badge,
                      color: '#FFFFFF',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {group.members.length} Orang
                  </span>
                </div>

                {/* Group Members List */}
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
                  {group.members.map((member, memberIdx) => {
                    const isSelected = swapSource && swapSource.groupIdx === groupIdx && swapSource.memberIdx === memberIdx;

                    return (
                      <div 
                        key={member.id}
                        onClick={() => handleStudentClick(groupIdx, memberIdx, member)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.45rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected 
                            ? 'rgba(245, 158, 11, 0.25)' 
                            : isFullscreen ? 'rgba(15, 23, 42, 0.45)' : 'var(--bg)',
                          border: isSelected 
                            ? '2px solid var(--primary)' 
                            : '1px solid var(--border)',
                          cursor: isAdmin ? 'pointer' : 'default',
                          transition: 'all 0.15s ease'
                        }}
                        title={isAdmin ? (isSelected ? 'Batal tukar' : 'Klik untuk menukar siswa ini') : undefined}
                      >
                        <span 
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: palette.border,
                            color: '#FFFFFF',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {memberIdx + 1}
                        </span>

                        <span 
                          style={{
                            fontSize: isFullscreen ? '1.05rem' : '0.88rem',
                            fontWeight: 700,
                            color: isFullscreen ? '#F8FAFC' : 'var(--text-primary)',
                            flex: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {member.name}
                        </span>

                        {member.absentNo && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            #{member.absentNo}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ATTENDANCE CHECKLIST MODAL */}
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
              maxWidth: '520px',
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
                padding: '1.15rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Filter Kehadiran Hari Ini</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Hilangkan centang siswa yang Sakit, Izin, atau Alpa agar tidak dimasukkan ke kelompok.
                </p>
              </div>
              <button 
                onClick={() => setIsAttendanceModalOpen(false)}
                className="btn btn-ghost btn-sm btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Bulk Actions */}
            <div 
              style={{
                padding: '0.65rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg)'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {presentStudents.length} dari {studentList.length} Siswa Hadir
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  onClick={() => handleSetAllPresence(true)}
                  className="btn btn-ghost btn-xs"
                  style={{ color: 'var(--primary)', fontWeight: 700 }}
                >
                  Semua Hadir
                </button>
                <button
                  onClick={() => handleSetAllPresence(false)}
                  className="btn btn-ghost btn-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Kosongkan
                </button>
              </div>
            </div>

            {/* Students List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {studentList.map(s => (
                <div 
                  key={s.id}
                  onClick={() => handleTogglePresence(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: s.isPresent ? 'var(--bg-surface)' : 'rgba(239, 68, 68, 0.06)',
                    border: `1px solid ${s.isPresent ? 'var(--border)' : 'rgba(239, 68, 68, 0.25)'}`,
                    cursor: 'pointer'
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
                        color: s.isPresent ? 'var(--text-primary)' : 'var(--danger)',
                        textDecoration: s.isPresent ? 'none' : 'line-through'
                      }}
                    >
                      {s.name} {s.absentNo ? `(#${s.absentNo})` : ''}
                    </span>
                  </div>

                  <span 
                    style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 700,
                      color: s.isPresent ? 'var(--success)' : 'var(--danger)'
                    }}
                  >
                    {s.isPresent ? 'Hadir' : 'Tidak Hadir'}
                  </span>
                </div>
              ))}
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
                onClick={() => setIsAttendanceModalOpen(false)}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700 }}
              >
                Terapkan Kehadiran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
