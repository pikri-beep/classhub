/**
 * SCHEDULE & AGENDA VIEW (UNIFIED: LESSONS, PICKETS & CALENDAR) - NOTION ULTRA-SIMPLE WORKSPACE
 * ClassHub - Jadwal Pelajaran, Regu Piket & Kalender Akademik (Clean & Minimalist)
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast, openModal, closeModal } from '../app.js';

let activeSubTab = 'lessons'; // 'lessons' | 'calendar'
let activeDay = 'Senin';
let displayedMonth = new Date().getMonth();
let displayedYear = new Date().getFullYear();
let selectedDateStr = new Date().toISOString().split('T')[0];

export function renderSchedule(container, defaultTab = null) {
  if (defaultTab) activeSubTab = defaultTab;

  const user = auth.getCurrentUser();
  const isAdmin = auth.isAdmin();
  const { schedules, events, tasks, exams } = store.data;

  container.innerHTML = `
    <div>
      <!-- 1. NOTION PAGE HEADER -->
      <div class="notion-page-header">
        <span class="notion-page-icon">📅</span>
        <h1 class="notion-page-title">Jadwal & Agenda</h1>
        <p class="notion-page-desc">Jadwal pelajaran mingguan, petugas piket harian & kalender agenda kelas</p>
      </div>

      <!-- 2. SUB-TAB SWITCHER -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.65rem;">
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <button class="btn ${activeSubTab === 'lessons' ? 'btn-secondary' : 'btn-ghost'} btn-sm view-tab-btn" data-subtab="lessons" style="font-weight: ${activeSubTab === 'lessons' ? '700' : '500'};">
            <i data-lucide="calendar-clock"></i>
            <span>Jadwal Pelajaran & Piket</span>
          </button>
          <button class="btn ${activeSubTab === 'calendar' ? 'btn-secondary' : 'btn-ghost'} btn-sm view-tab-btn" data-subtab="calendar" style="font-weight: ${activeSubTab === 'calendar' ? '700' : '500'};">
            <i data-lucide="calendar-days"></i>
            <span>Kalender Agenda Kelas</span>
          </button>
        </div>
      </div>

      <!-- 3. TAB CONTENT -->
      <div id="schedule-tab-content">
        ${activeSubTab === 'lessons' ? renderLessonsContent(schedules, user, isAdmin) : renderCalendarContent(events, tasks, exams, user, isAdmin)}
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Subtab buttons listener
  container.querySelectorAll('.view-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSubTab = btn.getAttribute('data-subtab');
      renderSchedule(container);
    });
  });

  if (activeSubTab === 'lessons') {
    attachLessonsEvents(container);
  } else {
    attachCalendarEvents(container, isAdmin);
  }
}

// --- LESSONS & PIKET CONTENT ---
function renderLessonsContent(schedules, user, isAdmin) {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const daySchedule = schedules[activeDay] || { subjects: [], piket: [] };
  const isUserPiketToday = (daySchedule.piket || []).includes(user.name);

  return `
    <div>
      <!-- Day Switcher Pills -->
      <div style="display: flex; align-items: center; gap: 0.35rem; overflow-x: auto; margin-bottom: 1.25rem;">
        ${days.map(d => `
          <button class="btn ${activeDay === d ? 'btn-secondary' : 'btn-ghost'} btn-sm schedule-day-btn" data-day="${d}" style="font-weight: ${activeDay === d ? '700' : '500'};">
            ${d}
          </button>
        `).join('')}
      </div>

      <!-- Two Column Layout: Subjects Table & Pickets -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
        
        <!-- Left: Subjects Table -->
        <div>
          <div class="notion-section-title" style="margin-top: 0;">
            <span>Mata Pelajaran Hari ${activeDay}</span>
            <span class="notion-tag notion-tag-gray">${(daySchedule.subjects || []).length} Mapel</span>
          </div>

          <div class="notion-table-wrapper">
            <table class="notion-table">
              <thead>
                <tr>
                  <th style="width: 50px;">Jam</th>
                  <th>Mata Pelajaran</th>
                  <th>Pengajar</th>
                  <th style="width: 120px;">Waktu</th>
                </tr>
              </thead>
              <tbody>
                ${(daySchedule.subjects || []).length === 0 ? `
                  <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                      Tidak ada jam pelajaran di hari ini (Libur atau Kegiatan Sekolah).
                    </td>
                  </tr>
                ` : (daySchedule.subjects || []).map((item, idx) => `
                  <tr>
                    <td style="color: var(--text-muted); font-weight: 600;">#${idx + 1}</td>
                    <td><strong>${item.subject}</strong></td>
                    <td style="color: var(--text-secondary);">${item.teacher || '—'}</td>
                    <td>
                      <span class="notion-tag notion-tag-blue">${item.timeStart} - ${item.timeEnd}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Pickets & Responsibilities -->
        <div>
          <div class="notion-section-title" style="margin-top: 0;">
            <span>Regu Piket Hari ${activeDay}</span>
            <span class="notion-tag ${isUserPiketToday ? 'notion-tag-orange' : 'notion-tag-gray'}">
              ${isUserPiketToday ? '⚡ Giliran Kamu' : `${(daySchedule.piket || []).length} Siswa`}
            </span>
          </div>

          ${isUserPiketToday ? `
            <div class="notion-callout" style="margin-bottom: 0.85rem; border-color: var(--warning-border);">
              <span class="notion-callout-icon">🧹</span>
              <div class="notion-callout-content">
                <strong>Pengingat Piket:</strong> Kamu bertugas piket kebersihan kelas hari ${activeDay}. Harap datang 15 menit lebih awal.
              </div>
            </div>
          ` : ''}

          <div class="notion-table-wrapper" style="margin-bottom: 1.25rem;">
            <table class="notion-table">
              <thead>
                <tr>
                  <th style="width: 45px;">No</th>
                  <th>Nama Petugas Piket</th>
                  <th style="width: 80px; text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${(daySchedule.piket || []).length === 0 ? `
                  <tr>
                    <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                      Belum ada regu piket yang dijadwalkan.
                    </td>
                  </tr>
                ` : (daySchedule.piket || []).map((name, i) => `
                  <tr>
                    <td style="color: var(--text-muted); font-weight: 600;">${i + 1}.</td>
                    <td><strong>${name}</strong></td>
                    <td style="text-align: center;">
                      ${name === user.name ? '<span class="notion-tag notion-tag-green">Saya</span>' : '<span style="color: var(--text-muted); font-size: 0.78rem;">Anggota</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Quick Tip Callout -->
          <div class="notion-callout">
            <span class="notion-callout-icon">📌</span>
            <div class="notion-callout-content">
              <strong>Tanggung Jawab Bersama:</strong> Sapu dan pel lantai kelas, bersihkan papan tulis, kosongkan tempat sampah, serta pastikan lampu dan proyektor mati sebelum pulang.
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}

// --- CALENDAR CONTENT ---
function renderCalendarContent(events, tasks, exams, user, isAdmin) {
  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const unifiedEvents = {};

  (events || []).forEach(ev => {
    if (!unifiedEvents[ev.date]) unifiedEvents[ev.date] = [];
    unifiedEvents[ev.date].push({ id: ev.id, title: ev.title, type: ev.type || 'event', desc: ev.desc || '' });
  });

  (exams || []).forEach(ex => {
    const dStr = (ex.examDate || '').split('T')[0];
    if (dStr) {
      if (!unifiedEvents[dStr]) unifiedEvents[dStr] = [];
      unifiedEvents[dStr].push({ id: ex.id, title: `Ujian: ${ex.title}`, type: 'exam', desc: `${ex.subject} (${ex.room || 'Kelas'})` });
    }
  });

  (tasks || []).forEach(tsk => {
    const dStr = (tsk.deadline || '').split('T')[0];
    if (dStr) {
      if (!unifiedEvents[dStr]) unifiedEvents[dStr] = [];
      unifiedEvents[dStr].push({ id: tsk.id, title: `Deadline: ${tsk.title}`, type: 'task', desc: tsk.subject });
    }
  });

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

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
      
      <!-- Left: Calendar Grid -->
      <div class="card" style="padding: 1.25rem;">
        
        <!-- Month Switcher Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0;">
            ${monthsMap[displayedMonth]} ${displayedYear}
          </h3>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-ghost btn-sm btn-icon-only" id="cal-prev-month" title="Bulan Sebelumnya">
              <i data-lucide="chevron-left" style="width: 15px; height: 15px;"></i>
            </button>
            <button class="btn btn-ghost btn-sm" id="cal-today-btn" style="font-size: 0.8125rem;">
              Hari Ini
            </button>
            <button class="btn btn-ghost btn-sm btn-icon-only" id="cal-next-month" title="Bulan Berikutnya">
              <i data-lucide="chevron-right" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
        </div>

        <!-- Day Names -->
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; margin-bottom: 0.5rem;">
          ${dayNames.map(d => `
            <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); padding: 0.25rem 0;">${d}</div>
          `).join('')}
        </div>

        <!-- Cells Grid -->
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
          ${calendarCells.map(cell => {
            if (cell.isOtherMonth) {
              return `<div style="padding: 0.6rem 0.2rem; text-align: center; font-size: 0.8125rem; color: var(--text-muted); opacity: 0.35;">${cell.day}</div>`;
            }

            const isSelected = cell.dateStr === selectedDateStr;
            const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
            const hasEvents = cell.events && cell.events.length > 0;

            return `
              <div 
                class="cal-day-cell ${isSelected ? 'selected' : ''}" 
                data-date="${cell.dateStr}"
                style="padding: 0.6rem 0.2rem; text-align: center; border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition-fast); background-color: ${isSelected ? 'var(--card-hover)' : 'transparent'}; border: 1px solid ${isSelected ? 'var(--primary)' : 'transparent'};"
              >
                <div style="font-size: 0.875rem; font-weight: ${isToday || isSelected ? '700' : 'normal'}; color: ${isToday ? 'var(--primary)' : 'var(--text-primary)'};">
                  ${cell.day}
                </div>
                ${hasEvents ? `
                  <div style="display: flex; justify-content: center; gap: 3px; margin-top: 3px;">
                    ${cell.events.slice(0, 3).map(ev => `
                      <span style="width: 5px; height: 5px; border-radius: 50%; background-color: ${ev.type === 'exam' ? 'var(--danger)' : (ev.type === 'task' ? 'var(--warning)' : 'var(--primary)')};"></span>
                    `).join('')}
                  </div>
                ` : '<div style="height: 5px; margin-top: 3px;"></div>'}
              </div>
            `;
          }).join('')}
        </div>

      </div>

      <!-- Right: Agenda on Selected Date -->
      <div class="card" style="padding: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle);">
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0;">Agenda Tanggal</h4>
            <span style="font-size: 0.8125rem; color: var(--primary); font-weight: 600;">${selectedDateStr}</span>
          </div>
          ${isAdmin ? `
            <button class="btn btn-ghost btn-sm" id="btn-add-cal-event" style="font-size: 0.8125rem;">
              <i data-lucide="plus" style="width: 14px; height: 14px;"></i> + Agenda
            </button>
          ` : ''}
        </div>

        ${selectedEvents.length === 0 ? `
          <div style="text-align: center; padding: 2rem 0; color: var(--text-muted); font-size: 0.875rem;">
            Tidak ada agenda atau jadwal di tanggal ini.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            ${selectedEvents.map(ev => `
              <div style="padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); background-color: var(--card-subtle); border-left: 3px solid ${ev.type === 'exam' ? 'var(--danger)' : (ev.type === 'task' ? 'var(--warning)' : 'var(--primary)')}; border-top: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.2rem;">
                  <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${ev.title}</span>
                  <span class="notion-tag ${ev.type === 'exam' ? 'notion-tag-red' : (ev.type === 'task' ? 'notion-tag-orange' : 'notion-tag-blue')}">
                    ${ev.type === 'exam' ? 'Ujian' : (ev.type === 'task' ? 'Tugas' : 'Agenda')}
                  </span>
                </div>
                ${ev.desc ? `<div style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.4;">${ev.desc}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

// --- ATTACH EVENTS ---
function attachLessonsEvents(container) {
  container.querySelectorAll('.schedule-day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDay = btn.getAttribute('data-day');
      renderSchedule(container);
    });
  });
}

function attachCalendarEvents(container, isAdmin) {
  const prevBtn = container.querySelector('#cal-prev-month');
  const nextBtn = container.querySelector('#cal-next-month');
  const todayBtn = container.querySelector('#cal-today-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      displayedMonth--;
      if (displayedMonth < 0) {
        displayedMonth = 11;
        displayedYear--;
      }
      renderSchedule(container);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      displayedMonth++;
      if (displayedMonth > 11) {
        displayedMonth = 0;
        displayedYear++;
      }
      renderSchedule(container);
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const now = new Date();
      displayedMonth = now.getMonth();
      displayedYear = now.getFullYear();
      selectedDateStr = now.toISOString().split('T')[0];
      renderSchedule(container);
    });
  }

  container.querySelectorAll('.cal-day-cell[data-date]').forEach(cell => {
    cell.addEventListener('click', () => {
      const date = cell.getAttribute('data-date');
      if (date) {
        selectedDateStr = date;
        renderSchedule(container);
      }
    });
  });

  if (isAdmin) {
    const addEvtBtn = container.querySelector('#btn-add-cal-event');
    if (addEvtBtn) {
      addEvtBtn.addEventListener('click', () => {
        const title = prompt('Judul Kegiatan / Agenda:');
        if (title && title.trim()) {
          const desc = prompt('Keterangan singkat (opsional):') || '';
          store.addEvent({ title: title.trim(), date: selectedDateStr, desc: desc.trim(), type: 'event' });
          renderSchedule(container);
          showToast('Agenda berhasil ditambahkan ke kalender!', 'success');
        }
      });
    }
  }
}
