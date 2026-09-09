/**
 * MAIN APP CONTROLLER & GATEKEEPER ROUTER
 * ClassHub - Single Page Application Controller
 */

import { store } from './store.js';
import { auth } from './auth.js';
import { renderLoginGate } from './views/loginGate.js';
import { renderDashboard } from './views/dashboard.js';
import { renderAnnouncements } from './views/announcements.js';
import { renderTasks } from './views/tasks.js';
import { renderExams } from './views/exams.js';
import { renderSchedules } from './views/schedules.js';
import { renderCalendar } from './views/calendar.js';
import { renderCash } from './views/cash.js';
import { renderMembers } from './views/members.js';

// Route Map
const routes = {
  '#dashboard': { title: 'Dashboard Kelas', subtitle: 'Ringkasan aktivitas dan fokus harian', render: renderDashboard },
  '#announcements': { title: 'Papan Pengumuman', subtitle: 'Informasi dan warta resmi kelas', render: renderAnnouncements },
  '#tasks': { title: 'Daftar Tugas & Progres', subtitle: 'Status pengerjaan pribadi dan rekap kelas', render: renderTasks },
  '#exams': { title: 'Countdown & Jadwal Ujian', subtitle: 'Hitung mundur dan ruang lingkup ujian', render: renderExams },
  '#schedules': { title: 'Jadwal Pelajaran & Piket', subtitle: 'Jam mata pelajaran dan regu piket', render: renderSchedules },
  '#calendar': { title: 'Kalender & Agenda', subtitle: 'Kalender kegiatan dan agenda bulanan', render: renderCalendar },
  '#cash': { title: 'Kas & Iuran Kelas', subtitle: 'Matrix iuran anggota dan transparansi buku kas', render: renderCash },
  '#members': { title: 'Daftar Anggota Kelas', subtitle: 'Struktur pengurus dan direktori siswa', render: renderMembers }
};

let currentHash = window.location.hash || '#dashboard';

// --- TOAST HELPER ---
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="font-weight: 600;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- MODAL HELPER ---
export function openModal(htmlContent) {
  const overlay = document.getElementById('app-modal-overlay');
  if (!overlay) return;
  overlay.innerHTML = htmlContent;
  overlay.classList.add('active');
  if (window.lucide) window.lucide.createIcons();
}

export function closeModal() {
  const overlay = document.getElementById('app-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  overlay.innerHTML = '';
}
window.closeModal = closeModal;

// --- ROUTER & GATEKEEPER NAVIGATION ---
export function renderApp() {
  const isAuthenticated = auth.isAuthenticated();
  const sidebar = document.getElementById('sidebar');
  const topHeader = document.getElementById('top-header');
  const mainContainer = document.getElementById('main-view-container');
  const mainWrapper = document.getElementById('main-wrapper');

  if (!isAuthenticated) {
    // Hide UI chrome when unauthenticated
    if (sidebar) sidebar.style.display = 'none';
    if (topHeader) topHeader.style.display = 'none';
    if (mainWrapper) mainWrapper.style.marginLeft = '0';
    
    // Render Gatekeeper screen
    renderLoginGate(mainContainer);
    return;
  }

  // User is authenticated: restore UI chrome
  if (sidebar) sidebar.style.display = '';
  if (topHeader) topHeader.style.display = '';
  if (mainWrapper) mainWrapper.style.marginLeft = '';

  updateUserInfoHeader();

  // Navigate to current route
  let hash = window.location.hash || '#dashboard';
  if (!routes[hash]) hash = '#dashboard';
  currentHash = hash;

  // Update Nav Item Active State
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('href') === hash) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update Header Title
  const route = routes[hash];
  const titleElem = document.getElementById('header-title');
  const subElem = document.getElementById('header-subtitle');
  if (titleElem) titleElem.textContent = route.title;
  if (subElem) subElem.textContent = route.subtitle;

  // Render View
  if (mainContainer) {
    route.render(mainContainer);
    if (window.lucide) window.lucide.createIcons();
  }

  closeMobileSidebar();
}

// --- THEME MANAGER ---
function initTheme() {
  const savedTheme = localStorage.getItem('classhub_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('classhub_theme', next);
      updateThemeIcon(next);
      showToast(`Mode ${next === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`, 'info');
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
  if (window.lucide) window.lucide.createIcons();
}

// --- SIDEBAR MOBILE TOGGLE ---
function initSidebar() {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
}

// --- USER HEADER & AUTH SWITCHER ---
function updateUserInfoHeader() {
  const user = auth.getCurrentUser();
  if (!user) return;

  const avatarElem = document.getElementById('sidebar-user-avatar');
  const nameElem = document.getElementById('sidebar-user-name');
  const roleBadgeElem = document.getElementById('sidebar-user-role');
  const headerRoleBadge = document.getElementById('header-role-badge');

  if (avatarElem) avatarElem.textContent = user.avatarText || user.name.substring(0, 2).toUpperCase();
  if (nameElem) nameElem.textContent = user.name;
  if (roleBadgeElem) {
    roleBadgeElem.className = `user-role-badge ${user.role === 'admin' ? 'admin' : ''}`;
    roleBadgeElem.innerHTML = `
      <i data-lucide="${user.role === 'admin' ? 'shield-check' : 'user'}" style="width: 12px; height: 12px;"></i>
      ${user.roleTitle || (user.role === 'admin' ? 'Admin' : 'Siswa')}
    `;
  }

  if (headerRoleBadge) {
    headerRoleBadge.className = `badge ${user.role === 'admin' ? 'badge-warning' : 'badge-primary'}`;
    headerRoleBadge.innerHTML = `
      <i data-lucide="${user.role === 'admin' ? 'shield-check' : 'user'}" style="width: 12px; height: 12px;"></i>
      ${user.role === 'admin' ? 'Admin Mode' : 'Member Mode'}
    `;
  }

  if (window.lucide) window.lucide.createIcons();
}

// Switch User Modal
export function openSwitchUserModal() {
  const { members } = store.data;
  const currentUser = auth.getCurrentUser() || members[0];

  const modalContent = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Ganti Pengguna / Masuk Akun</h3>
        <button class="btn btn-secondary btn-sm btn-icon-only" onclick="window.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <!-- STUDENT SELECT LOGIN -->
        <div style="margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border);">
          <h4 style="font-size: 0.92rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary);">
            Masuk sebagai Siswa
          </h4>
          <div class="form-group">
            <label class="form-label">Pilih Nama Siswa</label>
            <select class="form-select" id="login-student-select">
              ${members.map(m => `
                <option value="${m.id}" ${m.id === currentUser.id ? 'selected' : ''}>
                  Absen ${m.absentNo}. ${m.name} (${m.roleTitle || 'Siswa'})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">PIN Siswa (Default: 1234)</label>
            <input type="password" class="form-input" id="login-student-pin" value="1234" placeholder="Masukkan 4 digit PIN" />
          </div>

          <button class="btn btn-primary" id="btn-login-student" style="width: 100%;">
            <i data-lucide="log-in"></i> Beralih ke Akun Ini
          </button>
        </div>

        <!-- MASTER ADMIN LOGIN -->
        <div style="margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border);">
          <h4 style="font-size: 0.92rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem;">
            <i data-lucide="shield" style="color: var(--warning); width: 16px; height: 16px;"></i>
            Mode Admin Pengurus Kelas
          </h4>
          <div class="form-group">
            <label class="form-label">Master PIN Admin (Default: admin123)</label>
            <input type="password" class="form-input" id="login-admin-pin" placeholder="Masukkan Master PIN" />
          </div>
          <button class="btn btn-secondary" id="btn-login-admin" style="width: 100%; border-color: var(--warning); color: var(--warning);">
            <i data-lucide="shield-check"></i> Masuk Mode Pengurus (Admin)
          </button>
        </div>

        <!-- RESET TESTING DATA OPTION -->
        <div style="padding: 0.85rem; border-radius: var(--radius-md); background-color: var(--danger-soft); border: 1px solid var(--danger-border);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--danger);">Reset Data Testing / Demo</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Kembalikan seluruh data ke kondisi awal.</div>
            </div>
            <button class="btn btn-danger btn-sm" id="btn-reset-demo-data">
              <i data-lucide="rotate-ccw"></i> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  openModal(modalContent);

  document.getElementById('btn-reset-demo-data').addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin mereset semua data testing ke kondisi awal?')) {
      store.resetToDefault();
      auth.logout();
      closeModal();
      showToast('Semua data testing berhasil di-reset!', 'success');
    }
  });

  document.getElementById('btn-login-student').addEventListener('click', () => {
    const studentId = document.getElementById('login-student-select').value;
    const pin = document.getElementById('login-student-pin').value.trim();

    const res = auth.loginAsStudent(studentId, pin);
    if (res.success) {
      closeModal();
      showToast(`Beralih ke akun ${res.user.name}!`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  });

  document.getElementById('btn-login-admin').addEventListener('click', () => {
    const pin = document.getElementById('login-admin-pin').value.trim();
    const res = auth.loginAsMasterAdmin(pin);
    if (res.success) {
      closeModal();
      showToast('Berhasil masuk sebagai Pengurus / Admin!', 'success');
    } else {
      showToast(res.message, 'error');
    }
  });
}
window.openSwitchUserModal = openSwitchUserModal;

// --- APP INIT ---
function initApp() {
  initTheme();
  initSidebar();

  // Listen to hash changes
  window.addEventListener('hashchange', () => {
    renderApp();
  });

  // Listen to store updates
  store.subscribe(() => {
    renderApp();
  });

  // Listen to auth changes
  auth.onAuthChange(() => {
    renderApp();
  });

  // Switch user trigger
  const switchUserBtn = document.getElementById('sidebar-user-card');
  if (switchUserBtn) {
    switchUserBtn.addEventListener('click', () => {
      openSwitchUserModal();
    });
  }

  const headerSwitchBtn = document.getElementById('header-switch-user-btn');
  if (headerSwitchBtn) {
    headerSwitchBtn.addEventListener('click', () => {
      openSwitchUserModal();
    });
  }

  // Logout / Lock Access Button
  const headerLogoutBtn = document.getElementById('header-logout-btn');
  if (headerLogoutBtn) {
    headerLogoutBtn.addEventListener('click', () => {
      if (confirm('Keluar dari akun dan kunci akses kelas?')) {
        auth.logout();
        showToast('Akses kelas telah dikunci.', 'info');
      }
    });
  }

  const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', () => {
      if (confirm('Keluar dari akun dan kunci akses kelas?')) {
        auth.logout();
        showToast('Akses kelas telah dikunci.', 'info');
      }
    });
  }

  // Initial Render
  renderApp();
}

document.addEventListener('DOMContentLoaded', initApp);
