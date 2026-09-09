/**
 * DASHBOARD VIEW (HARI INI) - NOTION ULTRA-SIMPLE WORKSPACE
 * ClassHub - Fokus Hari Ini yang Bersih, Tenang & Mudah Dibaca
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast } from '../app.js';

export function renderDashboard(container) {
  const user = auth.getCurrentUser();
  const isAdmin = auth.isAdmin();
  const { classInfo, announcements, tasks, exams, schedules, cash } = store.data;

  // Indonesian Date Formatting
  const now = new Date();
  const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const currentDayName = daysMap[now.getDay()];
  const formattedDate = `${currentDayName}, ${now.getDate()} ${monthsMap[now.getMonth()]} ${now.getFullYear()}`;

  // Metrics
  const myPendingTasks = tasks.filter(t => !(t.completedStudentIds || []).includes(user.id));
  const myDoneTasks = tasks.filter(t => (t.completedStudentIds || []).includes(user.id));

  // Today's schedule & Piket
  const todaySchedule = schedules[currentDayName] || schedules['Senin'] || { subjects: [], piket: [] };
  const isPiketToday = (todaySchedule.piket || []).includes(user.name);

  // Nearest exam
  const sortedExams = [...exams].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  const nearestExam = sortedExams[0];

  // Latest announcement
  const latestAnnouncement = announcements[0];

  container.innerHTML = `
    <div>
      <!-- 1. NOTION PAGE HEADER -->
      <div class="notion-page-header">
        <span class="notion-page-icon">⚡</span>
        <h1 class="notion-page-title">Hari Ini</h1>
        <p class="notion-page-desc">${formattedDate} • Ruang Kelas <strong>${classInfo.name}</strong> • ${classInfo.school}</p>
      </div>

      <!-- 2. NOTION CALLOUT BLOCK -->
      <div class="notion-callout">
        <span class="notion-callout-icon">💡</span>
        <div class="notion-callout-content">
          <strong>Halo, ${user.name.split(' ')[0]}!</strong>
          ${myPendingTasks.length > 0 
            ? `Kamu memiliki <strong>${myPendingTasks.length} tugas</strong> yang belum selesai.` 
            : 'Semua tugas kelasmu sudah tuntas! 🎉'}
          ${isPiketToday ? ` Hari ini kamu bertugas <strong>Piket Kebersihan</strong> bersama tim piket ${currentDayName}.` : ''}
        </div>
      </div>

      <!-- 3. INLINE PROPERTIES STRIP -->
      <div class="notion-properties-bar">
        <div class="notion-prop-item">
          <span style="color: var(--text-muted);">Status Tugas:</span>
          <span class="notion-tag ${myPendingTasks.length === 0 ? 'notion-tag-green' : 'notion-tag-orange'}">
            ${myPendingTasks.length === 0 ? '✓ Selesai Semua' : `${myPendingTasks.length} Belum Selesai`}
          </span>
        </div>
        <div class="notion-prop-item">
          <span style="color: var(--text-muted);">Jadwal Piket:</span>
          <span class="notion-tag ${isPiketToday ? 'notion-tag-orange' : 'notion-tag-gray'}">
            ${isPiketToday ? '⚡ Bertugas Hari Ini' : 'Bebas Piket'}
          </span>
        </div>
        <div class="notion-prop-item">
          <span style="color: var(--text-muted);">Saldo Kas:</span>
          <strong>Rp ${Number(cash.balance || 0).toLocaleString('id-ID')}</strong>
        </div>
        ${nearestExam ? `
          <div class="notion-prop-item">
            <span style="color: var(--text-muted);">Ujian Terdekat:</span>
            <span class="notion-tag notion-tag-blue">${nearestExam.subject} (${nearestExam.examDate})</span>
          </div>
        ` : ''}
      </div>

      <!-- 4. NOTION TO-DO LIST SECTION -->
      <div class="notion-section-title">
        <span>To-Do & Daftar Tugas</span>
        <a href="#academic" class="btn btn-ghost btn-sm" style="font-weight: 500;">
          Lihat Semua Tugas (${tasks.length}) →
        </a>
      </div>
      <p class="notion-section-desc">Klik kotak centang di bawah untuk menandai tugas yang sudah kamu selesaikan.</p>

      <div class="card" style="padding: 0.5rem 0.75rem; margin-bottom: 1.5rem;">
        <div class="notion-todo-list" style="margin-bottom: 0;">
          ${tasks.length === 0 ? `
            <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
              Belum ada tugas yang ditambahkan.
            </div>
          ` : tasks.slice(0, 5).map(task => {
            const isDone = (task.completedStudentIds || []).includes(user.id);
            const dObj = new Date(task.deadline);
            const deadlineFormatted = !isNaN(dObj) 
              ? `${dObj.getDate()} ${monthsMap[dObj.getMonth()]}` 
              : task.deadline;

            return `
              <div class="notion-todo-item ${isDone ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="notion-todo-checkbox">
                  <i data-lucide="check" style="width: 12px; height: 12px; stroke-width: 3;"></i>
                </div>
                <span class="notion-todo-text">${task.title}</span>
                <div class="notion-todo-meta">
                  <span class="notion-tag notion-tag-gray">${task.subject}</span>
                  <span>tenggat ${deadlineFormatted}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 5. JADWAL PELAJARAN HARI INI (NOTION TABLE) -->
      <div class="notion-section-title">
        <span>Jadwal Pelajaran ${currentDayName}</span>
        <a href="#schedule" class="btn btn-ghost btn-sm" style="font-weight: 500;">
          Jadwal Mingguan →
        </a>
      </div>

      <div class="notion-table-wrapper">
        <table class="notion-table">
          <thead>
            <tr>
              <th style="width: 50px;">Jam</th>
              <th>Mata Pelajaran</th>
              <th>Guru Pengampu</th>
              <th style="width: 120px;">Waktu</th>
            </tr>
          </thead>
          <tbody>
            ${(todaySchedule.subjects || []).length === 0 ? `
              <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                  Tidak ada jam pelajaran hari ini (Libur / Hari Bebas).
                </td>
              </tr>
            ` : (todaySchedule.subjects || []).map((sub, idx) => `
              <tr>
                <td style="color: var(--text-muted); font-weight: 600;">#${idx + 1}</td>
                <td>
                  <strong>${sub.subject}</strong>
                </td>
                <td style="color: var(--text-secondary);">${sub.teacher || '—'}</td>
                <td>
                  <span class="notion-tag notion-tag-blue">${sub.timeStart} - ${sub.timeEnd}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- 6. PENGUMUMAN KELAS TERKINI -->
      ${latestAnnouncement ? `
        <div class="notion-section-title">
          <span>Pengumuman Terkini</span>
          <a href="#class" class="btn btn-ghost btn-sm" style="font-weight: 500;">
            Semua Pengumuman →
          </a>
        </div>
        <div class="card" style="padding: 1.15rem 1.35rem; margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.45rem;">
            <span class="notion-tag notion-tag-orange" style="text-transform: uppercase;">${latestAnnouncement.category}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${latestAnnouncement.author || 'Pengurus Kelas'}</span>
          </div>
          <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">
            ${latestAnnouncement.title}
          </h4>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
            ${latestAnnouncement.content}
          </p>
        </div>
      ` : ''}

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Notion To-Do Checkbox click handler
  container.querySelectorAll('.notion-todo-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = item.getAttribute('data-task-id');
      const isDone = item.classList.contains('completed');
      store.updateTaskStatus(taskId, user.id, isDone ? 'todo' : 'done');
      renderDashboard(container);
      showToast(isDone ? 'Tugas ditandai belum selesai' : 'Tugas selesai! 🎉', 'success');
    });
  });
}
