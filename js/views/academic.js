/**
 * ACADEMIC VIEW (UNIFIED: TASKS & EXAMS) - NOTION ULTRA-SIMPLE WORKSPACE
 * ClassHub - Manajemen Tugas & Jadwal Ujian Terpadu (Clean & Minimalist)
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast, openModal, closeModal } from '../app.js';

let activeSubTab = 'tasks'; // 'tasks' | 'exams'
let currentStatusFilter = 'all';
let currentSubjectFilter = 'all';

export function renderAcademic(container, defaultTab = null) {
  if (defaultTab) activeSubTab = defaultTab;

  const user = auth.getCurrentUser();
  const isAdmin = auth.isAdmin();
  const { tasks, exams, members } = store.data;

  container.innerHTML = `
    <div>
      <!-- 1. NOTION PAGE HEADER -->
      <div class="notion-page-header">
        <span class="notion-page-icon">📚</span>
        <h1 class="notion-page-title">Akademik</h1>
        <p class="notion-page-desc">Daftar tugas terstruktur & agenda evaluasi kelas</p>
      </div>

      <!-- 2. SUB-TAB & ACTION BAR -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.65rem;">
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <button class="btn ${activeSubTab === 'tasks' ? 'btn-secondary' : 'btn-ghost'} btn-sm view-tab-btn" data-subtab="tasks" style="font-weight: ${activeSubTab === 'tasks' ? '700' : '500'};">
            <i data-lucide="check-square"></i>
            <span>Daftar Tugas (${tasks.length})</span>
          </button>
          <button class="btn ${activeSubTab === 'exams' ? 'btn-secondary' : 'btn-ghost'} btn-sm view-tab-btn" data-subtab="exams" style="font-weight: ${activeSubTab === 'exams' ? '700' : '500'};">
            <i data-lucide="graduation-cap"></i>
            <span>Jadwal Ujian (${exams.length})</span>
          </button>
        </div>

        ${activeSubTab === 'tasks' && isAdmin ? `
          <button class="btn btn-primary btn-sm" id="btn-add-task">
            <i data-lucide="plus"></i> + Tambah Tugas
          </button>
        ` : ''}

        ${activeSubTab === 'exams' && isAdmin ? `
          <button class="btn btn-primary btn-sm" id="btn-add-exam">
            <i data-lucide="plus"></i> + Jadwalkan Ujian
          </button>
        ` : ''}
      </div>

      <!-- 3. TAB CONTENT AREA -->
      <div id="academic-tab-content">
        ${activeSubTab === 'tasks' ? renderTasksContent(tasks, members, user, isAdmin) : renderExamsContent(exams, isAdmin)}
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Subtab buttons listener
  container.querySelectorAll('.view-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSubTab = btn.getAttribute('data-subtab');
      renderAcademic(container);
    });
  });

  // Attach events for current subtab
  if (activeSubTab === 'tasks') {
    attachTaskEvents(container, user, isAdmin);
  } else {
    attachExamEvents(container, isAdmin);
  }
}

// --- TASKS CONTENT (NOTION DATABASE TABLE / LIST VIEW) ---
function renderTasksContent(tasks, members, user, isAdmin) {
  const totalStudents = members.length;
  const subjects = ['all', ...new Set(tasks.map(t => t.subject))];

  const filteredTasks = tasks.filter(task => {
    if (currentSubjectFilter !== 'all' && task.subject !== currentSubjectFilter) return false;

    const isDone = (task.completedStudentIds || []).includes(user.id);
    const isDoing = (task.inProgressStudentIds || []).includes(user.id);
    const isTodo = !isDone && !isDoing;

    if (currentStatusFilter === 'todo' && !isTodo) return false;
    if (currentStatusFilter === 'doing' && !isDoing) return false;
    if (currentStatusFilter === 'done' && !isDone) return false;

    return true;
  });

  const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  return `
    <div>
      <!-- Filter Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
          <button class="btn ${currentStatusFilter === 'all' ? 'btn-secondary' : 'btn-ghost'} btn-sm filter-pill" data-status="all">Semua</button>
          <button class="btn ${currentStatusFilter === 'todo' ? 'btn-secondary' : 'btn-ghost'} btn-sm filter-pill" data-status="todo">Belum Selesai</button>
          <button class="btn ${currentStatusFilter === 'doing' ? 'btn-secondary' : 'btn-ghost'} btn-sm filter-pill" data-status="doing">Sedang Dikerjakan</button>
          <button class="btn ${currentStatusFilter === 'done' ? 'btn-secondary' : 'btn-ghost'} btn-sm filter-pill" data-status="done">Selesai</button>
        </div>

        <select id="task-subject-select" class="form-select" style="width: auto; padding: 0.4rem 0.75rem; font-size: 0.8125rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-weight: 500;">
          <option value="all">Semua Mata Pelajaran</option>
          ${subjects.filter(s => s !== 'all').map(s => `
            <option value="${s}" ${currentSubjectFilter === s ? 'selected' : ''}>${s}</option>
          `).join('')}
        </select>
      </div>

      <!-- Task List as Notion Table -->
      ${filteredTasks.length === 0 ? `
        <div class="card" style="padding: 2.5rem 1.5rem; text-align: center;">
          <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin: 0;">Tidak ada tugas ditemukan</p>
          <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.25rem;">Semua tugas sesuai kriteria filter telah selesai atau belum ditugaskan.</p>
        </div>
      ` : `
        <div class="notion-table-wrapper">
          <table class="notion-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">✓</th>
                <th>Tugas & Deskripsi</th>
                <th style="width: 140px;">Mata Pelajaran</th>
                <th style="width: 130px;">Tenggat</th>
                <th style="width: 140px;">Status Saya</th>
                <th style="width: 110px;">Progres Kelas</th>
                ${isAdmin ? '<th style="width: 50px; text-align: center;">Aksi</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredTasks.map(task => {
                const isDone = (task.completedStudentIds || []).includes(user.id);
                const isDoing = (task.inProgressStudentIds || []).includes(user.id);

                const doneCount = (task.completedStudentIds || []).length;
                const donePercent = Math.round((doneCount / totalStudents) * 100);

                const dObj = new Date(task.deadline);
                const dateStr = !isNaN(dObj) ? `${dObj.getDate()} ${monthsMap[dObj.getMonth()]}` : task.deadline;
                const isNear = (!isNaN(dObj) && (dObj - new Date()) > 0 && (dObj - new Date()) < 86400000 * 3);

                return `
                  <tr>
                    <!-- CHECKBOX -->
                    <td style="text-align: center;">
                      <div 
                        class="notion-todo-checkbox task-notion-check ${isDone ? 'checked' : ''}" 
                        data-task-id="${task.id}"
                        title="${isDone ? 'Tandai Belum Selesai' : 'Tandai Selesai'}"
                        style="margin: 0 auto; ${isDone ? 'background-color: var(--primary); border-color: var(--primary); color: #fff;' : ''}"
                      >
                        ${isDone ? '<i data-lucide="check" style="width: 12px; height: 12px; stroke-width: 3;"></i>' : ''}
                      </div>
                    </td>

                    <!-- TITLE & DESCRIPTION -->
                    <td>
                      <div style="font-weight: 600; color: ${isDone ? 'var(--text-muted)' : 'var(--text-primary)'}; text-decoration: ${isDone ? 'line-through' : 'none'};">
                        ${task.title}
                      </div>
                      ${task.description ? `
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.2rem; line-height: 1.4;">
                          ${task.description}
                        </div>
                      ` : ''}
                      ${task.link ? `
                        <a href="${task.link}" target="_blank" rel="noopener noreferrer" style="font-size: 0.78rem; display: inline-flex; align-items: center; gap: 0.25rem; margin-top: 0.25rem;">
                          <i data-lucide="external-link" style="width: 12px; height: 12px;"></i> Tautan Pengumpulan
                        </a>
                      ` : ''}
                    </td>

                    <!-- SUBJECT -->
                    <td>
                      <span class="notion-tag notion-tag-gray">${task.subject}</span>
                    </td>

                    <!-- DEADLINE -->
                    <td>
                      <span style="color: ${isNear ? 'var(--danger)' : 'var(--text-secondary)'}; font-weight: ${isNear ? '600' : 'normal'};">
                        ${dateStr}
                      </span>
                    </td>

                    <!-- STATUS SAYA (CLICKABLE NOTION TAG) -->
                    <td>
                      <div style="display: flex; gap: 0.25rem;">
                        <button class="notion-tag ${isDone ? 'notion-tag-green' : isDoing ? 'notion-tag-blue' : 'notion-tag-gray'} btn-cycle-status" data-task-id="${task.id}" data-current="${isDone ? 'done' : isDoing ? 'doing' : 'todo'}" style="border: none; cursor: pointer;" title="Klik untuk mengubah status">
                          ${isDone ? '✓ Selesai' : isDoing ? '⋯ Dikerjakan' : '○ Belum'}
                        </button>
                      </div>
                    </td>

                    <!-- CLASS PROGRESS -->
                    <td style="font-size: 0.8125rem; color: var(--text-muted);">
                      ${doneCount}/${totalStudents} (${donePercent}%)
                    </td>

                    <!-- ADMIN ACTION -->
                    ${isAdmin ? `
                      <td style="text-align: center;">
                        <button class="btn btn-ghost btn-sm btn-icon-only delete-task-btn" data-id="${task.id}" title="Hapus Tugas" style="padding: 0.25rem;">
                          <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--danger);"></i>
                        </button>
                      </td>
                    ` : ''}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// --- EXAMS CONTENT (NOTION LIST CARDS) ---
function renderExamsContent(exams, isAdmin) {
  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const sortedExams = [...exams].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  return `
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      ${sortedExams.length === 0 ? `
        <div class="card" style="padding: 2.5rem 1.5rem; text-align: center;">
          <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin: 0;">Belum ada jadwal ujian</p>
          <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.25rem;">Tidak ada PTS, PAS, atau kuis yang akan datang.</p>
        </div>
      ` : sortedExams.map(exam => {
        const dateObj = new Date(exam.examDate);
        const dateFormatted = !isNaN(dateObj) 
          ? `${dateObj.getDate()} ${monthsMap[dateObj.getMonth()]} ${dateObj.getFullYear()} • ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')} WIB`
          : exam.examDate;

        const diffMs = !isNaN(dateObj) ? dateObj - new Date() : 0;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let tagClass = 'notion-tag-blue';
        let urgencyText = `${diffDays} hari lagi`;
        if (diffDays <= 0) {
          urgencyText = 'Hari Ini / Selesai';
          tagClass = 'notion-tag-gray';
        } else if (diffDays <= 3) {
          urgencyText = `${diffDays} hari lagi (Mendesak)`;
          tagClass = 'notion-tag-red';
        } else if (diffDays <= 7) {
          urgencyText = `${diffDays} hari lagi`;
          tagClass = 'notion-tag-orange';
        }

        return `
          <div class="card" style="padding: 1rem 1.25rem;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
                  <span class="notion-tag notion-tag-gray">${exam.subject}</span>
                  <span class="notion-tag ${tagClass}">${urgencyText}</span>
                </div>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">
                  ${exam.title}
                </h3>
                <div style="font-size: 0.8125rem; color: var(--text-secondary); display: flex; gap: 1.25rem; flex-wrap: wrap;">
                  <span>📅 ${dateFormatted}</span>
                  <span>📍 ${exam.room || 'Ruang Kelas'}</span>
                </div>
              </div>

              ${isAdmin ? `
                <button class="btn btn-ghost btn-sm btn-icon-only delete-exam-btn" data-id="${exam.id}" title="Hapus Ujian" style="padding: 0.25rem;">
                  <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--danger);"></i>
                </button>
              ` : ''}
            </div>

            ${exam.scope ? `
              <div style="margin-top: 0.75rem; padding: 0.65rem 0.85rem; background-color: var(--card-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
                <strong style="color: var(--text-primary);">Kisi-kisi & Cakupan:</strong> ${exam.scope}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// --- ATTACH EVENTS ---
function attachTaskEvents(container, user, isAdmin) {
  // Checkbox toggle
  container.querySelectorAll('.task-notion-check').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.getAttribute('data-task-id');
      const isDone = btn.classList.contains('checked');
      store.updateTaskStatus(taskId, user.id, isDone ? 'todo' : 'done');
      renderAcademic(container);
      showToast(isDone ? 'Tugas ditandai belum selesai' : 'Tugas selesai! 🎉', 'success');
    });
  });

  // Cycle status on tag click (todo -> doing -> done -> todo)
  container.querySelectorAll('.btn-cycle-status').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.getAttribute('data-task-id');
      const current = btn.getAttribute('data-current');
      let next = 'doing';
      if (current === 'doing') next = 'done';
      else if (current === 'done') next = 'todo';

      store.updateTaskStatus(taskId, user.id, next);
      renderAcademic(container);
      showToast(`Status tugas diubah ke "${next === 'done' ? 'Selesai' : next === 'doing' ? 'Sedang Dikerjakan' : 'Belum Selesai'}"`, 'info');
    });
  });

  // Filter status pills
  container.querySelectorAll('.filter-pill[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentStatusFilter = btn.getAttribute('data-status');
      renderAcademic(container);
    });
  });

  // Subject select
  const subSelect = container.querySelector('#task-subject-select');
  if (subSelect) {
    subSelect.addEventListener('change', (e) => {
      currentSubjectFilter = e.target.value;
      renderAcademic(container);
    });
  }

  // Delete task
  if (isAdmin) {
    container.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus tugas ini?')) {
          store.deleteTask(id);
          renderAcademic(container);
          showToast('Tugas berhasil dihapus', 'info');
        }
      });
    });

    const addBtn = container.querySelector('#btn-add-task');
    if (addBtn) {
      addBtn.addEventListener('click', () => openAddTaskModal(container));
    }
  }
}

function attachExamEvents(container, isAdmin) {
  if (isAdmin) {
    container.querySelectorAll('.delete-exam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus jadwal ujian ini?')) {
          store.deleteExam(id);
          renderAcademic(container);
          showToast('Jadwal ujian dihapus', 'info');
        }
      });
    });

    const addBtn = container.querySelector('#btn-add-exam');
    if (addBtn) {
      addBtn.addEventListener('click', () => openAddExamModal(container));
    }
  }
}

// --- MODALS ---
function openAddTaskModal(container) {
  const html = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Tugas Baru</h3>
        <button class="modal-close-btn" onclick="closeModal()"><i data-lucide="x"></i></button>
      </div>
      <form id="form-add-task">
        <div class="form-group">
          <label class="form-label">Mata Pelajaran</label>
          <input type="text" class="form-input" id="new-task-subject" placeholder="Contoh: Pemrograman Web" required />
        </div>
        <div class="form-group">
          <label class="form-label">Judul Tugas</label>
          <input type="text" class="form-input" id="new-task-title" placeholder="Contoh: Modul 4 REST API" required />
        </div>
        <div class="form-group">
          <label class="form-label">Tenggat Waktu (Deadline)</label>
          <input type="datetime-local" class="form-input" id="new-task-deadline" required />
        </div>
        <div class="form-group">
          <label class="form-label">Instruksi / Catatan (Opsional)</label>
          <textarea class="form-input" id="new-task-desc" rows="3" placeholder="Detail tugas, format pengumpulan, dll..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Link Pengumpulan / Form (Opsional)</label>
          <input type="url" class="form-input" id="new-task-link" placeholder="https://forms.gle/..." />
        </div>
        <div class="modal-footer" style="padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Tugas</button>
        </div>
      </form>
    </div>
  `;

  openModal(html);

  const form = document.getElementById('form-add-task');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = document.getElementById('new-task-subject').value.trim();
      const title = document.getElementById('new-task-title').value.trim();
      const deadline = document.getElementById('new-task-deadline').value;
      const description = document.getElementById('new-task-desc').value.trim();
      const link = document.getElementById('new-task-link').value.trim();

      store.addTask({ subject, title, deadline, description, link });
      closeModal();
      renderAcademic(container);
      showToast('Tugas baru berhasil ditambahkan!', 'success');
    });
  }
}

function openAddExamModal(container) {
  const html = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3 class="modal-title">Jadwalkan Ujian / Evaluasi</h3>
        <button class="modal-close-btn" onclick="closeModal()"><i data-lucide="x"></i></button>
      </div>
      <form id="form-add-exam">
        <div class="form-group">
          <label class="form-label">Mata Pelajaran</label>
          <input type="text" class="form-input" id="new-exam-subject" placeholder="Contoh: Matematika Terapan" required />
        </div>
        <div class="form-group">
          <label class="form-label">Jenis / Judul Ujian</label>
          <input type="text" class="form-input" id="new-exam-title" placeholder="Contoh: Penilaian Tengah Semester (PTS)" required />
        </div>
        <div class="form-group">
          <label class="form-label">Tanggal & Jam</label>
          <input type="datetime-local" class="form-input" id="new-exam-date" required />
        </div>
        <div class="form-group">
          <label class="form-label">Ruang Ujian (Opsional)</label>
          <input type="text" class="form-input" id="new-exam-room" placeholder="Contoh: Lab Komputer 2" />
        </div>
        <div class="form-group">
          <label class="form-label">Kisi-kisi & Cakupan Materi</label>
          <textarea class="form-input" id="new-exam-scope" rows="3" placeholder="Materi Bab 1 - Bab 3..."></textarea>
        </div>
        <div class="modal-footer" style="padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Jadwal</button>
        </div>
      </form>
    </div>
  `;

  openModal(html);

  const form = document.getElementById('form-add-exam');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = document.getElementById('new-exam-subject').value.trim();
      const title = document.getElementById('new-exam-title').value.trim();
      const examDate = document.getElementById('new-exam-date').value;
      const room = document.getElementById('new-exam-room').value.trim();
      const scope = document.getElementById('new-exam-scope').value.trim();

      store.addExam({ subject, title, examDate, room, scope });
      closeModal();
      renderAcademic(container);
      showToast('Jadwal ujian berhasil ditambahkan!', 'success');
    });
  }
}
