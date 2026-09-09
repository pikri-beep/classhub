/**
 * EXAMS & COUNTDOWN VIEW
 * ClassHub - Countdown & Jadwal Ujian Terstruktur
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast, openModal, closeModal } from '../app.js';

let countdownInterval = null;

export function renderExams(container) {
  const isAdmin = auth.isAdmin();
  const { exams } = store.data;

  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const sortedExams = [...exams].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">
            Hitung mundur waktu tersisa menuju ujian semester & praktikum. Persiapkan materi sejak dini!
          </p>
        </div>

        ${isAdmin ? `
          <button class="btn btn-primary" id="btn-add-exam">
            <i data-lucide="plus"></i> Jadwalkan Ujian Baru
          </button>
        ` : ''}
      </div>

      <div class="exam-grid">
        ${sortedExams.length === 0 ? `
          <div class="card empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon"><i data-lucide="graduation-cap"></i></div>
            <h3 class="empty-title">Belum ada ujian terjadwal</h3>
            <p class="empty-desc">Tidak ada jadwal PTS/PAS atau kuis yang akan datang.</p>
          </div>
        ` : sortedExams.map(exam => {
          const dateObj = new Date(exam.examDate);
          const dateFormatted = `${dateObj.getDate()} ${monthsMap[dateObj.getMonth()]} ${dateObj.getFullYear()} • ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')} WIB`;
          
          const diffMs = dateObj - new Date();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          let urgencyBadge = 'badge-success';
          let urgencyText = `${diffDays} Hari Lagi`;
          if (diffDays <= 3) {
            urgencyBadge = 'badge-danger';
            urgencyText = diffDays <= 0 ? 'Hari Ini / Selesai' : 'Mendesak: ' + diffDays + ' Hari Lagi';
          } else if (diffDays <= 7) {
            urgencyBadge = 'badge-warning';
          }

          return `
            <div class="card exam-card">
              <div class="card-header">
                <div>
                  <span class="badge badge-primary" style="margin-bottom: 0.35rem;">${exam.subject}</span>
                  <h3 class="card-title">${exam.title}</h3>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge ${urgencyBadge}">${urgencyText}</span>
                  ${isAdmin ? `
                    <button class="btn btn-soft-danger btn-sm btn-icon-only delete-exam-btn" data-id="${exam.id}" title="Hapus Jadwal Ujian">
                      <i data-lucide="trash-2"></i>
                    </button>
                  ` : ''}
                </div>
              </div>

              <div class="card-body">
                <div style="display: flex; gap: 1rem; font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                  <div><i data-lucide="calendar" style="width: 14px; height: 14px; display: inline;"></i> ${dateFormatted}</div>
                  <div><i data-lucide="map-pin" style="width: 14px; height: 14px; display: inline;"></i> ${exam.room || 'Ruang Kelas'}</div>
                </div>

                <!-- LIVE COUNTDOWN BOX -->
                <div class="countdown-box exam-live-box" data-target="${exam.examDate}" id="exam-cd-${exam.id}">
                  <div class="countdown-unit">
                    <span class="countdown-number cd-days">0</span>
                    <span class="countdown-label">Hari</span>
                  </div>
                  <div class="countdown-unit">
                    <span class="countdown-number cd-hours">0</span>
                    <span class="countdown-label">Jam</span>
                  </div>
                  <div class="countdown-unit">
                    <span class="countdown-number cd-mins">0</span>
                    <span class="countdown-label">Menit</span>
                  </div>
                  <div class="countdown-unit">
                    <span class="countdown-number cd-secs">0</span>
                    <span class="countdown-label">Detik</span>
                  </div>
                </div>

                ${exam.scope ? `
                  <div class="exam-scope">
                    <div style="font-weight: 700; font-size: 0.78rem; color: var(--text-primary); margin-bottom: 0.2rem;">
                      <i data-lucide="book-open" style="width: 13px; height: 13px; display: inline;"></i> Kisi-kisi / Ruang Lingkup Materi:
                    </div>
                    <div>${exam.scope}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  startExamTimers();

  if (isAdmin) {
    const addBtn = container.querySelector('#btn-add-exam');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openAddExamModal();
      });
    }

    container.querySelectorAll('.delete-exam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Yakin ingin menghapus jadwal ujian ini?')) {
          store.deleteExam(id);
          showToast('Jadwal ujian berhasil dihapus', 'success');
        }
      });
    });
  }
}

function startExamTimers() {
  if (countdownInterval) clearInterval(countdownInterval);

  const boxes = document.querySelectorAll('.exam-live-box');
  if (boxes.length === 0) return;

  function tick() {
    const now = new Date().getTime();

    boxes.forEach(box => {
      const targetStr = box.getAttribute('data-target');
      if (!targetStr) return;

      const target = new Date(targetStr).getTime();
      const diff = target - now;

      const daysElem = box.querySelector('.cd-days');
      const hoursElem = box.querySelector('.cd-hours');
      const minsElem = box.querySelector('.cd-mins');
      const secsElem = box.querySelector('.cd-secs');

      if (diff <= 0) {
        if (daysElem) daysElem.textContent = '0';
        if (hoursElem) hoursElem.textContent = '0';
        if (minsElem) minsElem.textContent = '0';
        if (secsElem) secsElem.textContent = '0';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysElem) daysElem.textContent = days;
      if (hoursElem) hoursElem.textContent = hours;
      if (minsElem) minsElem.textContent = mins;
      if (secsElem) secsElem.textContent = secs;
    });
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

function openAddExamModal() {
  const modalContent = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Jadwalkan Ujian Baru</h3>
        <button class="btn btn-secondary btn-sm btn-icon-only" onclick="window.closeModal()">✕</button>
      </div>
      <form id="form-add-exam">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mata Pelajaran</label>
              <input type="text" class="form-input" id="exm-subject" placeholder="Contoh: Basis Data" required />
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal & Waktu Ujian</label>
              <input type="datetime-local" class="form-input" id="exm-date" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Judul Ujian</label>
              <input type="text" class="form-input" id="exm-title" placeholder="Contoh: PTS Teori / Praktikum" required />
            </div>

            <div class="form-group">
              <label class="form-label">Ruang Ujian</label>
              <input type="text" class="form-input" id="exm-room" placeholder="Contoh: Lab Komputer 2" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Kisi-kisi & Materi yang Diujikan</label>
            <textarea class="form-textarea" id="exm-scope" placeholder="Tuliskan rangkuman materi, bab, atau referensi soal..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Jadwal Ujian</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalContent);

  const form = document.getElementById('form-add-exam');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = document.getElementById('exm-subject').value.trim();
    const examDate = document.getElementById('exm-date').value;
    const title = document.getElementById('exm-title').value.trim();
    const room = document.getElementById('exm-room').value.trim();
    const scope = document.getElementById('exm-scope').value.trim();

    if (!subject || !title || !examDate) return;

    store.addExam({
      subject,
      examDate,
      title,
      room,
      scope
    });

    closeModal();
    showToast('Jadwal ujian berhasil ditambahkan!', 'success');
  });
}
