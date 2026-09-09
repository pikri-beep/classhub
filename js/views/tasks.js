/**
 * TASKS & PROGRESS VIEW
 * ClassHub - Manajemen Tugas & Progres Kelas
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast, openModal, closeModal } from '../app.js';

let currentStatusFilter = 'all';
let currentSubjectFilter = 'all';

export function renderTasks(container) {
  const user = auth.getCurrentUser();
  const isAdmin = auth.isAdmin();
  const { tasks, members } = store.data;
  const totalStudents = members.length;

  const subjects = ['all', ...new Set(tasks.map(t => t.subject))];

  const filteredTasks = tasks.filter(task => {
    if (currentSubjectFilter !== 'all' && task.subject !== currentSubjectFilter) {
      return false;
    }

    const isDone = task.completedStudentIds.includes(user.id);
    const isDoing = task.inProgressStudentIds.includes(user.id);
    const isTodo = !isDone && !isDoing;

    if (currentStatusFilter === 'todo' && !isTodo) return false;
    if (currentStatusFilter === 'doing' && !isDoing) return false;
    if (currentStatusFilter === 'done' && !isDone) return false;

    return true;
  });

  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <div class="filter-bar">
            <button class="filter-pill ${currentStatusFilter === 'all' ? 'active' : ''}" data-status="all">Semua Status</button>
            <button class="filter-pill ${currentStatusFilter === 'todo' ? 'active' : ''}" data-status="todo">🔴 Belum Mulai</button>
            <button class="filter-pill ${currentStatusFilter === 'doing' ? 'active' : ''}" data-status="doing">🟡 Sedang Dikerjakan</button>
            <button class="filter-pill ${currentStatusFilter === 'done' ? 'active' : ''}" data-status="done">🟢 Selesai</button>
          </div>

          <select id="task-subject-select" class="form-select" style="width: auto; padding: 0.4rem 0.75rem; font-size: 0.85rem;">
            <option value="all">Semua Mata Pelajaran</option>
            ${subjects.filter(s => s !== 'all').map(s => `
              <option value="${s}" ${currentSubjectFilter === s ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>
        </div>

        ${isAdmin ? `
          <button class="btn btn-primary" id="btn-add-task">
            <i data-lucide="plus"></i> Tambah Tugas Baru
          </button>
        ` : ''}
      </div>

      <div class="task-grid">
        ${filteredTasks.length === 0 ? `
          <div class="card empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon"><i data-lucide="clipboard-check"></i></div>
            <h3 class="empty-title">Tidak ada tugas ditemukan</h3>
            <p class="empty-desc">Tidak ada tugas yang sesuai dengan kriteria filter.</p>
          </div>
        ` : filteredTasks.map(task => {
          const isDone = task.completedStudentIds.includes(user.id);
          const isDoing = task.inProgressStudentIds.includes(user.id);
          const isTodo = !isDone && !isDoing;

          const doneCount = task.completedStudentIds.length;
          const donePercent = Math.round((doneCount / totalStudents) * 100);

          const deadlineDate = new Date(task.deadline);
          const deadlineFormatted = `${deadlineDate.getDate()} ${monthsMap[deadlineDate.getMonth()]} ${deadlineDate.getFullYear()} • ${deadlineDate.getHours()}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`;
          const isUrgent = (deadlineDate - new Date()) < 86400000 * 3 && (deadlineDate - new Date()) > 0;

          return `
            <div class="card task-card">
              <div class="task-card-header">
                <div>
                  <span class="task-subject">${task.subject}</span>
                  <h3 class="task-title">${task.title}</h3>
                </div>
                ${isAdmin ? `
                  <button class="btn btn-soft-danger btn-sm btn-icon-only delete-task-btn" data-id="${task.id}" title="Hapus Tugas">
                    <i data-lucide="trash-2"></i>
                  </button>
                ` : ''}
              </div>

              <div class="task-card-body">
                <div style="margin-bottom: 0.75rem;">
                  <span class="task-deadline-tag ${isUrgent ? 'urgent' : ''}">
                    <i data-lucide="clock" style="width: 13px; height: 13px;"></i>
                    Deadline: ${deadlineFormatted}
                  </span>
                </div>

                <p class="task-desc">${task.description || 'Tidak ada instruksi tambahan.'}</p>

                ${task.link ? `
                  <div style="margin-bottom: 1rem;">
                    <a href="${task.link}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="width: 100%; justify-content: center;">
                      <i data-lucide="external-link"></i> Buka Tautan Pengumpulan
                    </a>
                  </div>
                ` : ''}

                <!-- PERSONAL STATUS TOGGLE -->
                <div class="personal-status-box">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">Status Pengerjaan Anda:</span>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">${user ? user.name : 'Siswa'}</span>
                  </div>
                  <div class="status-toggle-group">
                    <button class="status-btn ${isTodo ? 'active todo' : ''}" data-task-id="${task.id}" data-status="todo">
                      Belum
                    </button>
                    <button class="status-btn ${isDoing ? 'active doing' : ''}" data-task-id="${task.id}" data-status="doing">
                      Dikerjakan
                    </button>
                    <button class="status-btn ${isDone ? 'active done' : ''}" data-task-id="${task.id}" data-status="done">
                      Selesai
                    </button>
                  </div>
                </div>

                <!-- AGGREGATE CLASS PROGRESS -->
                <div class="class-progress-section">
                  <div class="progress-header">
                    <span>Progres Kelas (${doneCount}/${totalStudents} Siswa)</span>
                    <span style="font-weight: 700; color: ${donePercent >= 80 ? 'var(--success)' : 'var(--text-primary)'};">${donePercent}%</span>
                  </div>
                  <div class="progress-bar-wrap">
                    <div class="progress-bar-fill ${donePercent >= 80 ? 'success' : (donePercent >= 40 ? 'primary' : 'warning')}" style="width: ${donePercent}%"></div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      currentStatusFilter = btn.getAttribute('data-status');
      renderTasks(container);
    });
  });

  const subjectSelect = container.querySelector('#task-subject-select');
  if (subjectSelect) {
    subjectSelect.addEventListener('change', (e) => {
      currentSubjectFilter = e.target.value;
      renderTasks(container);
    });
  }

  container.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.getAttribute('data-task-id');
      const newStatus = btn.getAttribute('data-status');
      store.updateTaskStatus(taskId, user.id, newStatus);
      showToast('Status tugas berhasil diperbarui!', 'success');
    });
  });

  if (isAdmin) {
    const addBtn = container.querySelector('#btn-add-task');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openAddTaskModal();
      });
    }

    container.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Yakin ingin menghapus tugas ini untuk seluruh kelas?')) {
          store.deleteTask(id);
          showToast('Tugas berhasil dihapus', 'success');
        }
      });
    });
  }
}

function openAddTaskModal() {
  const modalContent = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Tugas Baru</h3>
        <button class="btn btn-secondary btn-sm btn-icon-only" onclick="window.closeModal()">✕</button>
      </div>
      <form id="form-add-task">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mata Pelajaran</label>
              <input type="text" class="form-input" id="tsk-subject" placeholder="Contoh: Pemrograman Web" required />
            </div>

            <div class="form-group">
              <label class="form-label">Batas Waktu (Deadline)</label>
              <input type="datetime-local" class="form-input" id="tsk-deadline" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Judul Tugas</label>
            <input type="text" class="form-input" id="tsk-title" placeholder="Contoh: Modul Praktikum JavaScript DOM" required />
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi / Instruksi Pengerjaan</label>
            <textarea class="form-textarea" id="tsk-desc" placeholder="Jelaskan detail petunjuk tugas atau format file..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Link Pengumpulan / Bahan (Opsional)</label>
            <input type="url" class="form-input" id="tsk-link" placeholder="https://drive.google.com/... atau https://classroom.google.com/..." />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan & Publikasikan</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalContent);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  tomorrow.setHours(23, 59, 0, 0);
  const tzOffset = tomorrow.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(tomorrow - tzOffset)).toISOString().slice(0, 16);
  document.getElementById('tsk-deadline').value = localISOTime;

  const form = document.getElementById('form-add-task');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = document.getElementById('tsk-subject').value.trim();
    const deadline = document.getElementById('tsk-deadline').value;
    const title = document.getElementById('tsk-title').value.trim();
    const description = document.getElementById('tsk-desc').value.trim();
    const link = document.getElementById('tsk-link').value.trim();

    if (!subject || !title || !deadline) return;

    store.addTask({
      subject,
      title,
      description,
      deadline,
      link
    });

    closeModal();
    showToast('Tugas baru berhasil ditambahkan untuk seluruh kelas!', 'success');
  });
}
