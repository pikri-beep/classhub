import React, { useState } from 'react';
import { CalendarDays, CalendarClock, ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function ScheduleView() {
  const { currentUser, isAdmin } = useAuth();
  const { data, addEvent } = useStore();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('lessons');
  const [activeDay, setActiveDay] = useState('Senin');

  // Calendar state
  const [displayedMonth, setDisplayedMonth] = useState(new Date().getMonth());
  const [displayedYear, setDisplayedYear] = useState(new Date().getFullYear());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Add event modal
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState('event');

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const daySchedule = data.schedules[activeDay] || { subjects: [], piket: [] };
  const isUserPiketToday = (daySchedule.piket || []).includes(currentUser.name);

  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Combine events, tasks, and exams
  const unifiedEvents = {};
  (data.events || []).forEach(ev => {
    if (!unifiedEvents[ev.date]) unifiedEvents[ev.date] = [];
    unifiedEvents[ev.date].push({ id: ev.id, title: ev.title, type: ev.type || 'event', desc: ev.desc });
  });

  (data.exams || []).forEach(ex => {
    const dStr = (ex.examDate || '').split('T')[0];
    if (dStr) {
      if (!unifiedEvents[dStr]) unifiedEvents[dStr] = [];
      unifiedEvents[dStr].push({ id: ex.id, title: `Ujian: ${ex.title}`, type: 'exam', desc: `${ex.subject} (${ex.room || 'Kelas'})` });
    }
  });

  (data.tasks || []).forEach(tsk => {
    const dStr = (tsk.deadline || '').split('T')[0];
    if (dStr) {
      if (!unifiedEvents[dStr]) unifiedEvents[dStr] = [];
      unifiedEvents[dStr].push({ id: tsk.id, title: `Deadline: ${tsk.title}`, type: 'task', desc: tsk.subject });
    }
  });

  // Calendar cells calculation
  const firstDayIndex = new Date(displayedYear, displayedMonth, 1).getDay();
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(displayedYear, displayedMonth, 0).getDate();

  const calendarCells = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({ day: daysInPrevMonth - i, isOtherMonth: true, dateStr: '' });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${displayedYear}-${String(displayedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({ day: i, isOtherMonth: false, dateStr: dStr, events: unifiedEvents[dStr] || [] });
  }
  const remaining = 35 - calendarCells.length;
  for (let i = 1; i <= Math.max(0, remaining); i++) {
    calendarCells.push({ day: i, isOtherMonth: true, dateStr: '' });
  }

  const selectedEvents = unifiedEvents[selectedDateStr] || [];

  const handlePrevMonth = () => {
    if (displayedMonth === 0) {
      setDisplayedMonth(11);
      setDisplayedYear(prev => prev - 1);
    } else {
      setDisplayedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayedMonth === 11) {
      setDisplayedMonth(0);
      setDisplayedYear(prev => prev + 1);
    } else {
      setDisplayedMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setDisplayedMonth(now.getMonth());
    setDisplayedYear(now.getFullYear());
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    addEvent({
      title: eventTitle.trim(),
      desc: eventDesc.trim(),
      type: eventType,
      date: selectedDateStr
    });
    setIsAddEventOpen(false);
    setEventTitle('');
    setEventDesc('');
    showToast('Agenda baru berhasil ditambahkan ke kalender!', 'success');
  };

  return (
    <div>

      {/* 2. SUB-TAB SWITCHER */}
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
            onClick={() => setActiveSubTab('lessons')}
            className={`clean-filter-chip ${activeSubTab === 'lessons' ? 'active' : ''}`}
          >
            <CalendarClock size={14} />
            <span>Pelajaran & Piket</span>
          </button>
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`clean-filter-chip ${activeSubTab === 'calendar' ? 'active' : ''}`}
          >
            <CalendarDays size={14} />
            <span>Kalender Agenda</span>
          </button>
        </div>
      </div>

      {/* 3. LESSONS CONTENT */}
      {activeSubTab === 'lessons' && (
        <div>
          {/* Day Buttons */}
          <div className="scrollable-tabs" style={{ marginBottom: '1.25rem' }}>
            {days.map(d => (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={`btn ${activeDay === d ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
                style={{ fontWeight: activeDay === d ? 700 : 500, minWidth: '60px' }}
              >
                {d}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Left: Subjects */}
            <div>
              <div className="notion-section-title" style={{ marginTop: 0 }}>
                <span>Mata Pelajaran Hari {activeDay}</span>
                <span className="notion-tag notion-tag-gray">{(daySchedule.subjects || []).length} Mapel</span>
              </div>

              <div className="notion-table-wrapper">
                <table className="notion-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>Jam</th>
                      <th>Mata Pelajaran</th>
                      <th>Pengajar</th>
                      <th style={{ width: '120px' }}>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(daySchedule.subjects || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          Tidak ada jam pelajaran di hari ini (Libur / Hari Bebas).
                        </td>
                      </tr>
                    ) : (
                      daySchedule.subjects.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{idx + 1}</td>
                          <td><strong>{item.subject}</strong></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{item.teacher || '—'}</td>
                          <td><span className="notion-tag notion-tag-blue">{item.timeStart} - {item.timeEnd}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Piket */}
            <div>
              <div className="notion-section-title" style={{ marginTop: 0 }}>
                <span>Regu Piket Hari {activeDay}</span>
                <span className={`notion-tag ${isUserPiketToday ? 'notion-tag-orange' : 'notion-tag-gray'}`}>
                  {isUserPiketToday ? '⚡ Giliran Kamu' : `${(daySchedule.piket || []).length} Siswa`}
                </span>
              </div>

              {isUserPiketToday && (
                <div className="notion-callout" style={{ marginBottom: '0.85rem' }}>
                  <span className="notion-callout-icon">🧹</span>
                  <div className="notion-callout-content">
                    <strong>Pengingat Piket:</strong> Kamu bertugas piket kebersihan kelas hari {activeDay}. Harap hadir 15 menit lebih awal.
                  </div>
                </div>
              )}

              <div className="notion-table-wrapper" style={{ marginBottom: '1.25rem' }}>
                <table className="notion-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>No</th>
                      <th>Nama Siswa Piket</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Peran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(daySchedule.piket || []).length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                          Belum ada regu piket yang dijadwalkan.
                        </td>
                      </tr>
                    ) : (
                      daySchedule.piket.map((name, i) => (
                        <tr key={i}>
                          <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}.</td>
                          <td><strong>{name}</strong></td>
                          <td style={{ textAlign: 'center' }}>
                            {name === currentUser.name ? (
                              <span className="notion-tag notion-tag-green">Saya</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Anggota</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="notion-callout">
                <span className="notion-callout-icon">📌</span>
                <div className="notion-callout-content">
                  <strong>Tanggung Jawab Bersama:</strong> Sapu dan pel lantai, bersihkan papan tulis, kosongkan tempat sampah, serta matikan AC/kipas angin sebelum pulang.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CALENDAR CONTENT */}
      {activeSubTab === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Calendar Grid */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                {monthsMap[displayedMonth]} {displayedYear}
              </h3>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button onClick={handlePrevMonth} className="btn btn-ghost btn-sm" style={{ padding: '4px 6px' }}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={handleGoToday} className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
                  Hari Ini
                </button>
                <button onClick={handleNextMonth} className="btn btn-ghost btn-sm" style={{ padding: '4px 6px' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem' }}>
              {dayNames.map(d => (
                <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.2rem 0' }}>
                  {d}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {calendarCells.map((cell, idx) => {
                if (cell.isOtherMonth) {
                  return (
                    <div key={idx} style={{ padding: '0.6rem 0.2rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', opacity: 0.35 }}>
                      {cell.day}
                    </div>
                  );
                }

                const isSelected = cell.dateStr === selectedDateStr;
                const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
                const hasEvents = cell.events && cell.events.length > 0;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    style={{
                      padding: '0.6rem 0.2rem',
                      textAlign: 'center',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'transparent'}`
                    }}
                  >
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: isToday || isSelected ? 700 : 'normal',
                      color: isToday ? 'var(--primary)' : 'var(--text-primary)'
                    }}>
                      {cell.day}
                    </div>
                    {hasEvents ? (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginTop: '3px' }}>
                        {cell.events.slice(0, 3).map((ev, i) => (
                          <span
                            key={i}
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: ev.type === 'exam' ? 'var(--danger)' : (ev.type === 'task' ? 'var(--warning)' : 'var(--primary)')
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div style={{ height: '5px', marginTop: '3px' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agenda on Selected Date */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Agenda Tanggal</h4>
                <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>{selectedDateStr}</span>
              </div>
              {isAdmin && (
                <button onClick={() => setIsAddEventOpen(true)} className="btn btn-ghost btn-sm" style={{ gap: '0.25rem' }}>
                  <Plus size={14} />
                  <span>+ Agenda</span>
                </button>
              )}
            </div>

            {selectedEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Tidak ada agenda atau jadwal di tanggal ini.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {selectedEvents.map(ev => (
                  <div
                    key={ev.id}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--callout-bg)',
                      borderLeft: `3px solid ${ev.type === 'exam' ? 'var(--danger)' : (ev.type === 'task' ? 'var(--warning)' : 'var(--primary)')}`,
                      borderTop: '1px solid var(--border)',
                      borderRight: '1px solid var(--border)',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{ev.title}</span>
                      <span className={`notion-tag ${ev.type === 'exam' ? 'notion-tag-red' : (ev.type === 'task' ? 'notion-tag-orange' : 'notion-tag-blue')}`}>
                        {ev.type === 'exam' ? 'Ujian' : (ev.type === 'task' ? 'Tugas' : 'Agenda')}
                      </span>
                    </div>
                    {ev.desc && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{ev.desc}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD AGENDA EVENT */}
      <Modal isOpen={isAddEventOpen} onClose={() => setIsAddEventOpen(false)} title="Tambah Agenda Baru">
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">Tanggal Terpilih</label>
            <input type="text" className="form-input" value={selectedDateStr} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Jenis Agenda</label>
            <select className="form-select" value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <option value="event">Kegiatan / Agenda Umum</option>
              <option value="exam">Ujian / Evaluasi</option>
              <option value="task">Tenggat Tugas</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Judul Agenda</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kunjungan Industri / Tryout"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Keterangan Singkat (Opsional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Detail kegiatan..."
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setIsAddEventOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Agenda
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
