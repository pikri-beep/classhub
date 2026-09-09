/**
 * CALENDAR & EVENTS VIEW
 * ClassHub - Kalender Kelas & Agenda Terpadu
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast, openModal, closeModal } from '../app.js';

let displayedMonth = new Date().getMonth();
let displayedYear = new Date().getFullYear();
let selectedDateStr = new Date().toISOString().split('T')[0];

export function renderCalendar(container) {
  const isAdmin = auth.isAdmin();
  const { events, tasks, exams } = store.data;

  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const unifiedEvents = {};

  events.forEach(ev => {
    if (!unifiedEvents[ev.date]) unifiedEvents[ev.date] = [];
    unifiedEvents[ev.date].push({
      id: ev.id,
      title: ev.title,
      type: ev.type || 'event',
      desc: ev.desc || '',
      isCustomEvent: true
    });
  });

  exams.forEach(ex => {
    const dStr = ex.examDate.split('T')[0];
    if (!unifiedEvents[dStr]) unifiedEvents[dStr] = [];
    unifiedEvents[dStr].push({
      id: ex.id,
      title: `Ujian: ${ex.title} (${ex.subject})`,
      type: 'exam',
      desc: `Ruang: ${ex.room || 'Kelas'}`
    });
  });

  tasks.forEach(tsk => {
    const dStr = tsk.deadline.split('T')[0];
    if (!unifiedEvents[dStr]) unifiedEvents[dStr] = [];
    unifiedEvents[dStr].push({
      id: tsk.id,
      title: `Deadline: ${tsk.title}`,
      type: 'task',
      desc: tsk.subject
    });
  });

  const firstDayIndex = new Date(displayedYear, displayedMonth, 1).getDay();
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(displayedYear, displayedMonth, 0).getDate();

  const totalCells = 35;
  const calendarCells = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    calendarCells.push({
      day: dayNum,
      isOtherMonth: true,
      dateStr: ''
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${displayedYear}-${String(displayedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      day: i,
      isOtherMonth: false,
      dateStr: dStr,
      events: unifiedEvents[dStr] || []
    });
  }

  const remaining = totalCells - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({
      day: i,
      isOtherMonth: true,
      dateStr: ''
    });
  }

  const selectedEvents = unifiedEvents[selectedDateStr] || [];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">Agenda & Kalender Akademik</h2>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Pantau kegiatan kelas, deadline tugas, dan jadwal ujian bulanan</p>
        </div>

        ${isAdmin ? `
          <button class="btn btn-primary" id="btn-add-event">
            <i data-lucide="plus"></i> Tambah Kegiatan Kelas
          </button>
        ` : ''}
      </div>

      <div class="calendar-layout">
        <div class="card" style="padding: 1.25rem;">
          <div class="calendar-header">
            <h3 class="calendar-month-title">${monthsMap[displayedMonth]} ${displayedYear}</h3>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-secondary btn-sm btn-icon-only" id="cal-prev-btn"><i data-lucide="chevron-left"></i></button>
              <button class="btn btn-secondary btn-sm" id="cal-today-btn">Hari Ini</button>
              <button class="btn btn-secondary btn-sm btn-icon-only" id="cal-next-btn"><i data-lucide="chevron-right"></i></button>
            </div>
          </div>

          <div class="calendar-grid-header">
            ${dayNames.map(d => `<div>${d}</div>`).join('')}
          </div>

          <div class="calendar-grid-days">
            ${calendarCells.map(cell => {
              if (cell.isOtherMonth) {
                return `<div class="calendar-day-cell other-month"><span class="day-number">${cell.day}</span></div>`;
              }

              const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
              const isSelected = cell.dateStr === selectedDateStr;

              return `
                <div class="calendar-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${cell.dateStr}">
                  <span class="day-number">${cell.day}</span>
                  <div class="event-dot-container">
                    ${(cell.events || []).slice(0, 2).map(ev => `
                      <span class="event-badge-mini ${ev.type}" title="${ev.title}">
                        ${ev.title}
                      </span>
                    `).join('')}
                    ${(cell.events || []).length > 2 ? `
                      <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">+${cell.events.length - 2} lagi</span>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="card" style="height: 100%; display: flex; flex-direction: column;">
          <div class="card-header">
            <div class="card-title-group">
              <div class="card-title">
                <i data-lucide="calendar-days" style="color: var(--primary); width: 18px; height: 18px;"></i>
                Agenda Tanggal Terpilih
              </div>
              <div class="card-subtitle">${selectedDateStr}</div>
            </div>
          </div>

          <div class="card-body" style="flex: 1; overflow-y: auto;">
            ${selectedEvents.length === 0 ? `
              <div class="empty-state" style="padding: 2.5rem 0;">
                <p class="empty-desc">Tidak ada agenda atau kegiatan pada tanggal ini.</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${selectedEvents.map(ev => `
                  <div style="padding: 0.85rem; border-radius: var(--radius-md); background-color: var(--bg); border: 1px solid var(--border); border-left: 4px solid ${ev.type === 'exam' ? 'var(--danger)' : (ev.type === 'task' ? 'var(--primary)' : 'var(--success)')};">
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem;">
                      <div>
                        <span class="badge ${ev.type === 'exam' ? 'badge-danger' : (ev.type === 'task' ? 'badge-primary' : 'badge-success')}" style="margin-bottom: 0.25rem;">
                          ${ev.type.toUpperCase()}
                        </span>
                        <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--text-primary); margin-top: 0.2rem;">${ev.title}</h4>
                        ${ev.desc ? `<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">${ev.desc}</p>` : ''}
                      </div>
                      ${isAdmin && ev.isCustomEvent ? `
                        <button class="btn btn-soft-danger btn-sm btn-icon-only delete-evt-btn" data-id="${ev.id}" title="Hapus Kegiatan">
                          <i data-lucide="trash-2"></i>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#cal-prev-btn').addEventListener('click', () => {
    displayedMonth--;
    if (displayedMonth < 0) {
      displayedMonth = 11;
      displayedYear--;
    }
    renderCalendar(container);
  });

  container.querySelector('#cal-next-btn').addEventListener('click', () => {
    displayedMonth++;
    if (displayedMonth > 11) {
      displayedMonth = 0;
      displayedYear++;
    }
    renderCalendar(container);
  });

  container.querySelector('#cal-today-btn').addEventListener('click', () => {
    displayedMonth = new Date().getMonth();
    displayedYear = new Date().getFullYear();
    selectedDateStr = new Date().toISOString().split('T')[0];
    renderCalendar(container);
  });

  container.querySelectorAll('.calendar-day-cell:not(.other-month)').forEach(cell => {
    cell.addEventListener('click', () => {
      selectedDateStr = cell.getAttribute('data-date');
      renderCalendar(container);
    });
  });

  if (isAdmin) {
    const addBtn = container.querySelector('#btn-add-event');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openAddEventModal();
      });
    }

    container.querySelectorAll('.delete-evt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Yakin ingin menghapus agenda kegiatan ini?')) {
          store.deleteEvent(id);
          showToast('Agenda berhasil dihapus', 'success');
        }
      });
    });
  }
}

function openAddEventModal() {
  const modalContent = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Kegiatan / Agenda Kelas</h3>
        <button class="btn btn-secondary btn-sm btn-icon-only" onclick="window.closeModal()">✕</button>
      </div>
      <form id="form-add-event">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Kegiatan</label>
              <input type="text" class="form-input" id="evt-title" placeholder="Contoh: Gotong Royong / Buka Bersama" required />
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Pelaksanaan</label>
              <input type="date" class="form-input" id="evt-date" value="${selectedDateStr}" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Jenis Agenda</label>
            <select class="form-select" id="evt-type">
              <option value="event" selected>🎯 Kegiatan Kelas / Acara</option>
              <option value="exam">📕 Ujian / Evaluasi</option>
              <option value="task">📝 Deadline Penting</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Keterangan / Lokasi</label>
            <textarea class="form-textarea" id="evt-desc" placeholder="Rincian tempat atau perlengkapan yang perlu dibawa..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Agenda</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalContent);

  const form = document.getElementById('form-add-event');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('evt-title').value.trim();
    const date = document.getElementById('evt-date').value;
    const type = document.getElementById('evt-type').value;
    const desc = document.getElementById('evt-desc').value.trim();

    if (!title || !date) return;

    store.addEvent({
      title,
      date,
      type,
      desc
    });

    closeModal();
    showToast('Agenda kegiatan berhasil ditambahkan ke kalender!', 'success');
  });
}
