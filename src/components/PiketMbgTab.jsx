import React, { useState, useMemo } from 'react';
import {
  Utensils,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  MBG_DAYS,
  BASE_REFERENCE_MONDAY,
  getMondayOfWeek,
  getCalendarWeekOffset,
  formatWeekDateRange,
  getCurrentSchoolDay,
  calculateMbgWeekSchedule
} from '../lib/mbgUtils';

export default function PiketMbgTab({ initialDay }) {
  const { data } = useStore();
  const { currentUser } = useAuth();

  // Current real-world school day
  const todaySchoolDay = useMemo(() => getCurrentSchoolDay(new Date()), []);
  const [activeDay, setActiveDay] = useState(initialDay || todaySchoolDay);

  // Week offset state (0 = Pekan Ini)
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate Monday of the targeted week
  const targetedMonday = useMemo(() => {
    const monday = getMondayOfWeek(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);
    return monday;
  }, [weekOffset]);

  const weekRangeText = useMemo(() => {
    return formatWeekDateRange(targetedMonday);
  }, [targetedMonday]);

  // Total calendar week offset from base reference Monday (2026-09-28)
  const totalOffsetFromBase = useMemo(() => {
    const baseOffset = getCalendarWeekOffset(new Date(), BASE_REFERENCE_MONDAY);
    return baseOffset + weekOffset;
  }, [weekOffset]);

  // Calculate the continuous rolling schedule for this week
  const weekSchedule = useMemo(() => {
    return calculateMbgWeekSchedule({
      members: data.members || [],
      weekOffset: totalOffsetFromBase,
      overrides: data.piketMbgOverrides || {}
    });
  }, [data.members, data.piketMbgOverrides, totalOffsetFromBase]);

  const currentDayData = weekSchedule[activeDay] || { ambil: [], balikin: [] };

  // Helper to check if current logged-in user is on duty
  const isUserOnDuty = (studentName) => {
    if (!currentUser?.name || !studentName) return false;
    return currentUser.name.trim().toLowerCase() === studentName.trim().toLowerCase();
  };

  const hasUserDutyToday = useMemo(() => {
    const inAmbil = currentDayData.ambil.some(s => isUserOnDuty(s.name));
    const inBalikin = currentDayData.balikin.some(s => isUserOnDuty(s.name));
    return inAmbil || inBalikin;
  }, [currentDayData, currentUser]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Week Navigator Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.85rem 1.15rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Navigation buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.65rem', gap: '0.2rem', fontSize: '0.8rem' }}
            title="Lihat pekan sebelumnya"
          >
            <ChevronLeft size={15} />
            <span>Pekan Lalu</span>
          </button>

          <button
            type="button"
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.65rem', gap: '0.2rem', fontSize: '0.8rem' }}
            title="Lihat pekan berikutnya"
          >
            <span>Pekan Depan</span>
            <ChevronRight size={15} />
          </button>

          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.35rem 0.55rem', fontSize: '0.76rem', color: 'var(--primary)', gap: '0.25rem' }}
              title="Kembali ke pekan berjalan saat ini"
            >
              <RotateCcw size={13} />
              <span>Pekan Ini</span>
            </button>
          )}
        </div>

        {/* Current target week label & date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={15} color="var(--primary)" />
          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {weekOffset === 0 ? 'Pekan Ini' : weekOffset === 1 ? 'Pekan Depan' : weekOffset === -1 ? 'Pekan Lalu' : `Pekan ${weekOffset > 0 ? `+${weekOffset}` : weekOffset}`}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ({weekRangeText})
          </span>
        </div>
      </div>

      {/* Day Selector Tabs (With subtle indicator underline for today, without notification dots) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flexWrap: 'wrap'
        }}
      >
        {MBG_DAYS.map(day => {
          const isToday = weekOffset === 0 && day === todaySchoolDay;
          const isSelected = activeDay === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.82rem',
                padding: '0.4rem 0.95rem',
                position: 'relative',
                borderBottom: isToday
                  ? `2.5px solid ${isSelected ? '#FFFFFF' : 'var(--primary)'}`
                  : undefined
              }}
              title={isToday ? `${day} (Hari Ini)` : day}
            >
              <span>{day}</span>
            </button>
          );
        })}
      </div>

      {/* User Duty Notice Banner (If user is on duty) */}
      {hasUserDutyToday && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(234, 88, 12, 0.08)',
            border: '1px solid rgba(234, 88, 12, 0.25)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          <Sparkles size={16} color="var(--primary)" />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            <strong>Pengingat:</strong> Hari ini adalah giliran kamu bertugas piket MBG. Mohon bersiap sebelum jam bertugas dimulai!
          </div>
        </div>
      )}

      {/* Teams Grid (2 Columns: Tim Pengambil & Tim Pengembali) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>

        {/* CARD 1: Tim Pengambil (11.30 WIB) */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          {/* Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Utensils size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Tim Pengambil
                </h3>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                  <Clock size={11} />
                  <span>Pukul 11.30 WIB (Sebelum Makan)</span>
                </div>
              </div>
            </div>

            <span
              className="notion-tag notion-tag-orange"
              style={{ fontSize: '0.72rem', fontWeight: 600 }}
            >
              {currentDayData.ambil.length} Siswa
            </span>
          </div>

          {/* Student list (clean name only, no absent number prefix) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {currentDayData.ambil.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Tidak ada petugas yang dijadwalkan.
              </div>
            ) : (
              currentDayData.ambil.map((student, idx) => {
                const isMe = isUserOnDuty(student.name);

                return (
                  <div
                    key={student.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.7rem 0.95rem',
                      backgroundColor: isMe ? 'rgba(234, 88, 12, 0.08)' : 'var(--bg)',
                      borderRadius: 'var(--radius-xs)',
                      border: isMe ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: isMe ? 700 : 600,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={student.name}
                    >
                      {student.name}
                    </span>

                    {isMe && (
                      <span
                        className="notion-tag notion-tag-orange"
                        style={{ fontSize: '0.68rem', fontWeight: 700 }}
                      >
                        Giliran Kamu
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CARD 2: Tim Pengembali (13.00 WIB) */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          {/* Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3B82F6'
              }}>
                <RotateCcw size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Tim Pengembali
                </h3>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                  <Clock size={11} />
                  <span>Pukul 13.00 WIB (Setelah Makan)</span>
                </div>
              </div>
            </div>

            <span
              className="notion-tag notion-tag-blue"
              style={{ fontSize: '0.72rem', fontWeight: 600 }}
            >
              {currentDayData.balikin.length} Siswa
            </span>
          </div>

          {/* Student list (clean name only, no absent number prefix) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {currentDayData.balikin.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Tidak ada petugas yang dijadwalkan.
              </div>
            ) : (
              currentDayData.balikin.map((student, idx) => {
                const isMe = isUserOnDuty(student.name);

                return (
                  <div
                    key={student.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.7rem 0.95rem',
                      backgroundColor: isMe ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg)',
                      borderRadius: 'var(--radius-xs)',
                      border: isMe ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: isMe ? 700 : 600,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={student.name}
                    >
                      {student.name}
                    </span>

                    {isMe && (
                      <span
                        className="notion-tag notion-tag-blue"
                        style={{ fontSize: '0.68rem', fontWeight: 700 }}
                      >
                        Giliran Kamu
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
