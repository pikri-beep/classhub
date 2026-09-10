import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, ArrowRight, Sparkles, Coffee, BookOpen, Sun, Moon, Calendar } from 'lucide-react';

export default function LiveClassTracker({ schedules, onNavigate }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every 20 seconds for precise countdown and status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayIndex = currentTime.getDay();
  const currentDayName = daysMap[dayIndex];
  const isWeekend = dayIndex === 0 || dayIndex === 6;

  // Convert "HH:MM" to total minutes from midnight
  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Next school day helper
  const getNextSchoolDay = () => {
    if (dayIndex === 5) return 'Senin'; // Friday -> Monday
    if (dayIndex === 6) return 'Senin'; // Saturday -> Monday
    if (dayIndex === 0) return 'Senin'; // Sunday -> Monday
    return daysMap[dayIndex + 1] || 'Senin';
  };

  const todaySchedule = schedules[currentDayName] || { subjects: [], piket: [] };
  const subjects = todaySchedule.subjects || [];

  // Determine current class status
  let status = 'unknown';
  let activeSubject = null;
  let nextSubject = null;
  let timeRemaining = 0;
  let progressPercent = 0;
  let gapType = 'istirahat'; // 'istirahat' or 'jam-kosong'

  if (isWeekend || subjects.length === 0) {
    status = 'weekend';
    const nextDay = getNextSchoolDay();
    nextSubject = (schedules[nextDay]?.subjects || [])[0] || null;
  } else {
    const firstStart = toMinutes(subjects[0].timeStart);
    const lastEnd = toMinutes(subjects[subjects.length - 1].timeEnd);

    if (currentMinutes < firstStart) {
      status = 'before-school';
      nextSubject = subjects[0];
      timeRemaining = firstStart - currentMinutes;
    } else if (currentMinutes >= lastEnd) {
      status = 'after-school';
      const nextDay = getNextSchoolDay();
      nextSubject = (schedules[nextDay]?.subjects || [])[0] || null;
    } else {
      // Check if inside one of the subjects
      let foundActive = false;
      for (let i = 0; i < subjects.length; i++) {
        const sub = subjects[i];
        const start = toMinutes(sub.timeStart);
        const end = toMinutes(sub.timeEnd);

        if (currentMinutes >= start && currentMinutes < end) {
          status = 'in-class';
          activeSubject = sub;
          nextSubject = subjects[i + 1] || null;
          timeRemaining = end - currentMinutes;
          const totalDuration = end - start;
          const passed = currentMinutes - start;
          progressPercent = Math.min(100, Math.max(0, Math.round((passed / totalDuration) * 100)));
          foundActive = true;
          break;
        }
      }

      // If not in a subject, it must be in a gap / break
      if (!foundActive) {
        status = 'break';
        // Find the upcoming subject
        for (let i = 0; i < subjects.length; i++) {
          const start = toMinutes(subjects[i].timeStart);
          if (currentMinutes < start) {
            nextSubject = subjects[i];
            timeRemaining = start - currentMinutes;
            break;
          }
        }

        // Determine if this is a standard break or conditional free period
        const hour = currentTime.getHours();
        if ((hour >= 9 && hour < 11) || (hour >= 11 && hour < 13)) {
          gapType = 'istirahat';
        } else {
          gapType = 'jam-kosong';
        }
      }
    }
  }

  // Format minutes into human readable text
  const formatRemaining = (mins) => {
    if (mins <= 0) return 'sebentar lagi';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h} jam ${m > 0 ? `${m} mnt` : ''}`;
    return `${m} menit`;
  };

  const formattedCurrentTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="live-tracker-card card">
      {/* HEADER STRIP */}
      <div className="live-tracker-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {status === 'in-class' && (
            <span className="live-pulse-badge">
              <span className="live-pulse-dot"></span>
              LIVE KBM
            </span>
          )}
          {status === 'break' && (
            <span className="live-pulse-badge badge-amber">
              <Coffee size={12} />
              {gapType === 'istirahat' ? 'ISTIRAHAT' : 'JAM KOSONG'}
            </span>
          )}
          {status === 'before-school' && (
            <span className="live-pulse-badge badge-blue">
              <Sun size={12} />
              SEBELUM KBM
            </span>
          )}
          {status === 'after-school' && (
            <span className="live-pulse-badge badge-gray">
              <Moon size={12} />
              KBM SELESAI
            </span>
          )}
          {status === 'weekend' && (
            <span className="live-pulse-badge badge-purple">
              <Sparkles size={12} />
              AKHIR PEKAN
            </span>
          )}
          <span className="live-tracker-clock">
            <Clock size={13} style={{ opacity: 0.7 }} />
            {formattedCurrentTime} WIB
          </span>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('schedule')}
          className="btn btn-ghost btn-xs"
          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
        >
          <span>Jadwal Lengkap</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* BODY CONTENT BY STATUS */}
      <div className="live-tracker-body">
        {status === 'in-class' && activeSubject && (
          <div>
            <div className="live-subject-row">
              <div>
                <span className="live-label">Mata Pelajaran Saat Ini</span>
                <h3 className="live-subject-title">{activeSubject.subject}</h3>
              </div>
              <div className="live-remaining-pill">
                <span className="live-remaining-time">Sisa {formatRemaining(timeRemaining)}</span>
                <span className="live-remaining-sub">{activeSubject.timeStart} - {activeSubject.timeEnd}</span>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="live-progress-container">
              <div className="live-progress-bar">
                <div className="live-progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span className="live-progress-text">{progressPercent}% selesai</span>
            </div>

            {/* DETAILS & NEXT */}
            <div className="live-meta-grid">
              <div className="live-meta-item">
                <User size={14} className="live-meta-icon" />
                <span>{activeSubject.teacher || 'Guru Pengampu'}</span>
              </div>
              <div className="live-meta-item">
                <MapPin size={14} className="live-meta-icon" />
                <span>{activeSubject.room || 'Ruang Teori'}</span>
              </div>
              {nextSubject && (
                <div className="live-meta-item live-meta-next">
                  <ArrowRight size={14} className="live-meta-icon" />
                  <span>Berikutnya: <strong>{nextSubject.subject}</strong> ({nextSubject.timeStart})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'break' && (
          <div className="live-state-message clean-state">
            <div className="live-state-icon-box amber">
              <Coffee size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {gapType === 'istirahat' ? 'Waktu Istirahat' : 'Jam Kosong / Mandiri'}
                </h4>
                {timeRemaining > 0 && (
                  <span className="notion-tag notion-tag-orange" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Selesai dlm {formatRemaining(timeRemaining)}
                  </span>
                )}
              </div>
              {nextSubject && (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Berikutnya: <strong style={{ color: 'var(--text-primary)' }}>{nextSubject.subject}</strong> pukul {nextSubject.timeStart} • {nextSubject.room || 'Ruang Kelas'}
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'before-school' && (
          <div className="live-state-message clean-state">
            <div className="live-state-icon-box blue">
              <Sun size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  KBM Belum Dimulai
                </h4>
                {timeRemaining > 0 && (
                  <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Mulai dlm {formatRemaining(timeRemaining)}
                  </span>
                )}
              </div>
              {nextSubject && (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Pelajaran pertama: <strong style={{ color: 'var(--text-primary)' }}>{nextSubject.subject}</strong> ({nextSubject.timeStart}) • {nextSubject.teacher || 'Guru Pengampu'}
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'after-school' && (
          <div className="live-state-message clean-state">
            <div className="live-state-icon-box gray">
              <Moon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  KBM Hari Ini Selesai
                </h4>
                <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.78rem' }}>
                  Waktu Bebas
                </span>
              </div>
              {nextSubject && (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} style={{ opacity: 0.7 }} />
                  <span>Mapel pertama hari {getNextSchoolDay()}: <strong style={{ color: 'var(--text-primary)' }}>{nextSubject.subject}</strong> ({nextSubject.timeStart})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'weekend' && (
          <div className="live-state-message clean-state">
            <div className="live-state-icon-box purple">
              <Sparkles size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Akhir Pekan (Libur KBM)
                </h4>
                <span className="notion-tag notion-tag-purple" style={{ fontSize: '0.78rem' }}>
                  Libur
                </span>
              </div>
              {nextSubject && (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} style={{ opacity: 0.7 }} />
                  <span>Jadwal Senin: <strong style={{ color: 'var(--text-primary)' }}>{nextSubject.subject}</strong> ({nextSubject.timeStart}) • {nextSubject.room || 'Kelas'}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
