/**
 * SCHEDULES & PICKETS VIEW
 * ClassHub - Jadwal Pelajaran & Regu Piket Harian
 */

import { store } from '../store.js';
import { auth } from '../auth.js';

let activeDay = 'Senin';

export function renderSchedules(container) {
  const user = auth.getCurrentUser();
  const { schedules } = store.data;

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const daySchedule = schedules[activeDay] || { subjects: [], piket: [] };

  const isUserPiketToday = (daySchedule.piket || []).includes(user.name);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div class="schedule-tabs">
        ${days.map(d => `
          <button class="schedule-tab-btn ${activeDay === d ? 'active' : ''}" data-day="${d}">
            ${d}
          </button>
        `).join('')}
      </div>

      <div class="dashboard-columns">
        <div>
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <div class="card-title">
                  <i data-lucide="book-marked" style="color: var(--primary); width: 18px; height: 18px;"></i>
                  Jadwal Mata Pelajaran - Hari ${activeDay}
                </div>
                <div class="card-subtitle">Urutan jam pelajaran dan guru pengampu</div>
              </div>
            </div>

            <div class="card-body">
              ${daySchedule.subjects.length === 0 ? `
                <div class="empty-state">
                  <p class="empty-desc">Tidak ada mata pelajaran di hari ini (Libur/Kegiatan Luar).</p>
                </div>
              ` : `
                <div class="schedule-timeline">
                  ${daySchedule.subjects.map((item, idx) => `
                    <div class="timeline-item">
                      <div class="timeline-time">
                        <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                        <span>${item.timeStart} - ${item.timeEnd}</span>
                      </div>
                      <div class="timeline-info">
                        <div class="timeline-subject">${item.subject}</div>
                        <div class="timeline-teacher">${item.teacher}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <div class="card-title">
                  <i data-lucide="sparkles" style="color: var(--warning); width: 18px; height: 18px;"></i>
                  Regu Piket Kebersihan (${activeDay})
                </div>
                <div class="card-subtitle">Petugas kebersihan ruang kelas</div>
              </div>
            </div>

            <div class="card-body">
              ${isUserPiketToday ? `
                <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--warning-soft); border: 1px solid var(--warning-border); color: var(--warning); font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                  <i data-lucide="alert-circle"></i> Anda bertugas piket pada hari ${activeDay}!
                </div>
              ` : ''}

              <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                ${daySchedule.piket && daySchedule.piket.length > 0 ? daySchedule.piket.map((name, i) => `
                  <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.85rem; border-radius: var(--radius-md); background-color: var(--bg); border: 1px solid var(--border);">
                    <div class="user-avatar" style="width: 30px; height: 30px; font-size: 0.75rem;">
                      ${i + 1}
                    </div>
                    <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${name}</span>
                    ${name === user.name ? '<span class="badge badge-primary" style="margin-left: auto;">Saya</span>' : ''}
                  </div>
                `).join('') : `
                  <div class="empty-state" style="padding: 1.5rem 0;">
                    <p class="empty-desc">Belum ada daftar piket untuk hari ini.</p>
                  </div>
                `}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                <i data-lucide="info" style="color: var(--primary); width: 16px; height: 16px;"></i>
                Tata Tertib Kelas
              </h4>
              <ul style="padding-left: 1.25rem; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6;">
                <li>Hadir 15 menit sebelum jam pelajaran pertama dimulai.</li>
                <li>Wajib menjaga kebersihan dan membuang sampah pada tempatnya.</li>
                <li>Perangkat HP disimpan saat jam pelajaran berlangsung kecuali diinstruksikan oleh guru mapel.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.schedule-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDay = btn.getAttribute('data-day');
      renderSchedules(container);
    });
  });
}
