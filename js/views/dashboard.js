/**
 * DASHBOARD VIEW (NOTION / LINEAR ULTRA-CLEAN STYLE)
 * ClassHub - Fokus Harian & Ringkasan Kelas Sederhana
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast, openModal } from '../app.js';

export function renderDashboard(container) {
  const user = auth.getCurrentUser();
  const isAdmin = auth.isAdmin();
  const { classInfo, announcements, tasks, exams, schedules, cash, members } = store.data;

  // Indonesian Date Formatting
  const now = new Date();
  const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const currentDayName = daysMap[now.getDay()];
  const formattedDate = `${currentDayName}, ${now.getDate()} ${monthsMap[now.getMonth()]} ${now.getFullYear()}`;

  // Metrics
  const myPendingTasks = tasks.filter(t => !t.completedStudentIds.includes(user.id));
  const myDoneTasks = tasks.filter(t => t.completedStudentIds.includes(user.id));
  const nearestExam = exams[0];
  const cashStats = store.getTotalCashBalance();
  const userDuesPaidCount = cash.duesPeriods.filter(p => p.paidStudentIds.includes(user.id)).length;
  const totalDuesPeriods = cash.duesPeriods.length;

  // Today's schedule & Piket
  const todaySchedule = schedules[currentDayName] || schedules['Senin'];
  const isPiketToday = (todaySchedule.piket || []).includes(user.name);

  // Latest Announcement
  const latestAnnouncement = announcements[0];

  container.innerHTML = `
    <div class="dashboard-grid">

      <!-- 1. CLEAN GREETING BAR -->
      <div class="card" style="padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
            <h1 style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary);">Halo, ${user.name}</h1>
            <span class="badge ${isAdmin ? 'badge-primary' : 'badge-neutral'}">
              ${user.roleTitle || (isAdmin ? 'Admin' : 'Siswa')}
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            ${classInfo.name} • ${classInfo.school} • <span style="color: var(--text-muted);">${formattedDate}</span>
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <button class="btn btn-secondary btn-sm" id="btn-dashboard-help">
            <i data-lucide="help-circle"></i> Info Peran
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash = '#tasks'">
            <i data-lucide="check-square"></i> Kelola Tugas (${myPendingTasks.length})
          </button>
        </div>
      </div>

      <!-- 2. METRIC STRIP (3 CLEAN SUMMARY BLOCKS) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
        
        <!-- BLOCK 1: TUGAS SAYA -->
        <div class="card" style="padding: 1.15rem; cursor: pointer; transition: all var(--transition-fast);" onclick="window.location.hash = '#tasks'">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Tugas Saya</span>
            <span class="status-dot ${myPendingTasks.length === 0 ? 'green' : 'amber'}"></span>
          </div>
          <div style="display: flex; align-items: baseline; gap: 0.4rem;">
            <span style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">${myPendingTasks.length}</span>
            <span style="font-size: 0.82rem; color: var(--text-muted);">belum selesai dari ${tasks.length} tugas</span>
          </div>
          <div class="progress-bar-wrap" style="margin-top: 0.75rem;">
            <div class="progress-bar-fill ${myPendingTasks.length === 0 ? 'success' : ''}" style="width: ${tasks.length > 0 ? (myDoneTasks.length / tasks.length) * 100 : 0}%;"></div>
          </div>
        </div>

        <!-- BLOCK 2: UJIAN TERDEKAT -->
        <div class="card" style="padding: 1.15rem; cursor: pointer; transition: all var(--transition-fast);" onclick="window.location.hash = '#exams'">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Ujian Terdekat</span>
            <i data-lucide="hourglass" style="width: 14px; height: 14px; color: var(--danger);"></i>
          </div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${nearestExam ? nearestExam.subject : 'Tidak ada jadwal'}
          </div>
          <span style="font-size: 0.78rem; color: var(--danger); font-weight: 600;">
            ${nearestExam ? `${nearestExam.date} • ${nearestExam.type || 'Ujian'}` : 'Semua ujian tuntas'}
          </span>
        </div>

        <!-- BLOCK 3: STATUS PIKET & KAS -->
        <div class="card" style="padding: 1.15rem; cursor: pointer; transition: all var(--transition-fast);" onclick="window.location.hash = '#cash'">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Kas & Piket</span>
            <i data-lucide="wallet" style="width: 14px; height: 14px; color: var(--primary);"></i>
          </div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">
            Rp ${cashStats.balance.toLocaleString('id-ID')}
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.15rem;">
            <span>Iuran: <strong>${userDuesPaidCount}/${totalDuesPeriods}</strong> lunas</span>
            <span>•</span>
            <span style="color: ${isPiketToday ? 'var(--warning)' : 'var(--text-muted)'}; font-weight: ${isPiketToday ? '700' : 'normal'};">
              ${isPiketToday ? 'Hari Ini Anda Piket' : 'Tidak Piket'}
            </span>
          </div>
        </div>

      </div>

      <!-- 3. TWO CLEAN WORKSPACE SECTIONS -->
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.25rem;">
        
        <!-- LEFT: DAFTAR TUGAS AKTIF PRIBADI -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <i data-lucide="check-circle-2" style="color: var(--primary); width: 17px; height: 17px;"></i>
              <span>Fokus Tugas Saya</span>
            </div>
            <a href="#tasks" class="btn btn-ghost btn-sm" style="font-size: 0.78rem;">
              Lihat Semua <i data-lucide="arrow-right" style="width: 13px; height: 13px;"></i>
            </a>
          </div>

          <div class="card-body" style="padding: 0.75rem 1rem;">
            ${tasks.length === 0 ? `
              <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
                <i data-lucide="party-popper" style="width: 32px; height: 32px; margin-bottom: 0.5rem;"></i>
                <p style="font-size: 0.85rem;">Tidak ada tugas yang terdaftar saat ini.</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${tasks.slice(0, 5).map(task => {
                  const isDone = task.completedStudentIds.includes(user.id);
                  const isDoing = (task.inProgressStudentIds || []).includes(user.id);
                  
                  return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border); background-color: ${isDone ? 'var(--bg)' : 'var(--card)'};">
                      <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 0; flex: 1;">
                        <button class="task-checkbox-toggle ${isDone ? 'checked' : ''}" data-task-id="${task.id}" title="${isDone ? 'Tandai Belum Selesai' : 'Tandai Selesai'}" style="width: 20px; height: 20px; border-radius: 4px; border: 1.5px solid ${isDone ? 'var(--success)' : 'var(--border)'}; background-color: ${isDone ? 'var(--success)' : 'transparent'}; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
                          ${isDone ? '<i data-lucide="check" style="width: 13px; height: 13px;"></i>' : ''}
                        </button>
                        
                        <div style="min-width: 0;">
                          <div style="font-size: 0.85rem; font-weight: 600; color: ${isDone ? 'var(--text-muted)' : 'var(--text-primary)'}; text-decoration: ${isDone ? 'line-through' : 'none'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${task.title}
                          </div>
                          <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; gap: 0.4rem; align-items: center;">
                            <span class="badge badge-neutral" style="padding: 0.1rem 0.4rem; font-size: 0.68rem;">${task.subject}</span>
                            <span>• Deadline: ${task.deadline}</span>
                          </div>
                        </div>
                      </div>

                      <div style="display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; margin-left: 0.5rem;">
                        <span class="badge ${isDone ? 'badge-success' : (isDoing ? 'badge-warning' : 'badge-neutral')}" style="font-size: 0.7rem;">
                          ${isDone ? 'Selesai' : (isDoing ? 'Dikerjakan' : 'Belum')}
                        </span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- RIGHT: PENGUMUMAN & JADWAL HARI INI -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- PENGUMUMAN TERBARU -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="megaphone" style="color: var(--primary); width: 17px; height: 17px;"></i>
                <span>Pengumuman</span>
              </div>
              <a href="#announcements" class="btn btn-ghost btn-sm" style="font-size: 0.78rem;">Semua</a>
            </div>
            <div class="card-body">
              ${latestAnnouncement ? `
                <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span class="badge badge-primary" style="font-size: 0.68rem;">${latestAnnouncement.category}</span>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">${latestAnnouncement.date}</span>
                  </div>
                  <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-top: 0.2rem;">
                    ${latestAnnouncement.title}
                  </h4>
                  <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
                    ${latestAnnouncement.content}
                  </p>
                </div>
              ` : `
                <p style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">Belum ada pengumuman.</p>
              `}
            </div>
          </div>

          <!-- JADWAL & PIKET HARI INI -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="calendar-clock" style="color: var(--primary); width: 17px; height: 17px;"></i>
                <span>Pelajaran Hari ${currentDayName}</span>
              </div>
              <a href="#schedules" class="btn btn-ghost btn-sm" style="font-size: 0.78rem;">Jadwal</a>
            </div>
            <div class="card-body" style="padding: 0.75rem 1rem;">
              <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                ${(todaySchedule.lessons || []).slice(0, 3).map((lesson, idx) => `
                  <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; padding: 0.35rem 0; border-bottom: 1px dashed var(--border);">
                    <div style="font-weight: 600; color: var(--text-primary);">
                      ${idx + 1}. ${lesson.name}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.75rem;">
                      ${lesson.time}
                    </div>
                  </div>
                `).join('')}
              </div>

              <div style="margin-top: 0.75rem; padding-top: 0.65rem; border-top: 1px solid var(--border); font-size: 0.78rem; color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between;">
                <span>Petugas Piket:</span>
                <span style="font-weight: 700; color: var(--text-primary);">${(todaySchedule.piket || []).join(', ') || '-'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Task Checkbox Toggle in Dashboard
  container.querySelectorAll('.task-checkbox-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.getAttribute('data-task-id');
      const task = store.getTaskById(taskId);
      if (!task) return;

      const isDone = task.completedStudentIds.includes(user.id);
      const nextStatus = isDone ? 'not_started' : 'done';
      store.updateStudentTaskStatus(taskId, user.id, nextStatus);
      
      showToast(isDone ? 'Tugas ditandai belum selesai' : 'Selamat! Tugas berhasil diselesaikan 🎉', isDone ? 'info' : 'success');
      renderDashboard(container);
    });
  });

  // Help Modal
  const helpBtn = container.querySelector('#btn-dashboard-help');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      openModal('Bantuan & Peran Pengguna', `
        <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 0.875rem;">
          <div class="card" style="padding: 1rem; background-color: var(--bg);">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin-bottom: 0.35rem;">
              <i data-lucide="shield-check" style="width: 15px; height: 15px; display: inline;"></i> Mode Admin / Pengurus
            </h4>
            <p style="color: var(--text-secondary); font-size: 0.82rem;">
              Memiliki wewenang penuh untuk menambah, mengedit, dan menghapus tugas, jadwal, pengumuman, ujian, serta mengelola pencatatan kas kelas.
            </p>
          </div>

          <div class="card" style="padding: 1rem; background-color: var(--bg);">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--success); margin-bottom: 0.35rem;">
              <i data-lucide="user" style="width: 15px; height: 15px; display: inline;"></i> Mode Anggota / Siswa
            </h4>
            <p style="color: var(--text-secondary); font-size: 0.82rem;">
              Dapat melihat semua data kelas secara real-time dan bebas mengatur status pengerjaan tugas pribadi (Belum Mulai / Dikerjakan / Selesai).
            </p>
          </div>

          <div style="font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 0.75rem;">
            Tip: Untuk mengganti foto atau logo kelas, cukup letakkan file gambar Anda di folder <code>assets/logo.svg</code> atau <code>assets/logo.png</code>.
          </div>
        </div>
      `);
    });
  }
}
