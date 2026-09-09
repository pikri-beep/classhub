/**
 * MAIN APP CONTROLLER & GATEKEEPER ROUTER (ZEN / APPLE MINIMALIST)
 * ClassHub - Single Page Application Controller
 */

import { store } from './store.js';
import { auth } from './auth.js';
import { renderLoginGate } from './views/loginGate.js';
import { renderDashboard } from './views/dashboard.js';
import { renderAcademic } from './views/academic.js';
import { renderSchedule } from './views/scheduleView.js';
import { renderCash } from './views/cash.js';
import { renderClass } from './views/classView.js';

// Route Definitions (5 Main Consolidated Sections)
const routes = {
  '#dashboard': { title: 'Hari Ini', subtitle: 'Fokus harian & ringkasan aktivitas', render: renderDashboard },
  '#academic': { title: 'Akademik', subtitle: 'Daftar tugas & jadwal ujian', render: renderAcademic },
  '#schedule': { title: 'Jadwal & Agenda', subtitle: 'Jadwal mapel, piket & kalender', render: renderSchedule },
  '#cash': { title: 'Kas & Iuran', subtitle: 'Transparansi kas & matrix iuran', render: renderCash },
  '#class': { title: 'Ruang Kelas', subtitle: 'Pengumuman resmi & direktori siswa', render: renderClass }
};

// Aliases for backward-compatibility & direct sub-tab links
const routeAliases = {
  '#tasks': { route: '#academic', subTab: 'tasks' },
  '#exams': { route: '#academic', subTab: 'exams' },
  '#schedules': { route: '#schedule', subTab: 'lessons' },
  '#calendar': { route: '#schedule', subTab: 'calendar' },
  '#announcements': { route: '#class', subTab: 'announcements' },
  '#members': { route: '#class', subTab: 'members' }
};

let currentHash = window.location.hash || '#dashboard';

// --- TOAST HELPER ---
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="font-weight: 600; font-size: 0.85rem;">${message}</div>
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
  const bottomNav = document.getElementById('mobile-bottom-nav');

  if (!isAuthenticated) {
    // Hide UI chrome when unauthenticated
    if (sidebar) sidebar.style.display = 'none';
    if (topHeader) topHeader.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';
    if (mainWrapper) mainWrapper.style.marginLeft = '0';
    
    // Render Gatekeeper screen
    renderLoginGate(mainContainer);
    return;
  }

  // User is authenticated: restore UI chrome
  if (sidebar) sidebar.style.display = '';
  if (topHeader) topHeader.style.display = '';
  if (bottomNav) bottomNav.style.display = '';
  if (mainWrapper) mainWrapper.style.marginLeft = '';

  updateUserInfoHeader();

  // Resolve route & aliases
  let rawHash = window.location.hash || '#dashboard';
  let targetRoute = rawHash;
  let subTabToActivate = null;

  if (routeAliases[rawHash]) {
    targetRoute = routeAliases[rawHash].route;
    subTabToActivate = routeAliases[rawHash].subTab;
  }

  if (!routes[targetRoute]) {
    targetRoute = '#dashboard';
  }

  currentHash = targetRoute;
  const navKey = targetRoute.replace('#', '');

  // Update Nav Item Active State in Sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-nav') === navKey || item.getAttribute('href') === targetRoute) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update Mobile Bottom Nav Active State
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    if (item.getAttribute('data-nav') === navKey || item.getAttribute('href') === targetRoute) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update Header Title
  const route = routes[targetRoute];
  const titleElem = document.getElementById('header-title');
  const subElem = document.getElementById('header-subtitle');
  if (titleElem) titleElem.textContent = route.title;
  if (subElem) subElem.textContent = route.subtitle;

  // Render View
  if (mainContainer) {
    route.render(mainContainer, subTabToActivate);
    if (window.lucide) window.lucide.createIcons();
  }

  closeMobileSidebar();
  closeUserPopover();
}

// --- THEME MANAGER ---
function initTheme() {
  const savedTheme = localStorage.getItem('classhub_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeElements(savedTheme);
}

function updateThemeElements(theme) {
  const icon = document.getElementById('popover-theme-icon');
  const text = document.getElementById('popover-theme-text');
  const isDark = theme === 'dark';

  if (icon) icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
  if (text) text.textContent = isDark ? 'Mode Terang' : 'Mode Gelap';
  if (window.lucide) window.lucide.createIcons();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('classhub_theme', next);
  updateThemeElements(next);
  showToast(`Mode ${next === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`, 'info');
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

// --- USER HEADER & POPOVER MANAGER ---
function updateUserInfoHeader() {
  const user = auth.getCurrentUser();
  if (!user) return;

  const initials = user.avatarText || user.name.substring(0, 2).toUpperCase();
  const isAdmin = user.role === 'admin';

  // Sidebar mini card
  const sAvatar = document.getElementById('sidebar-user-avatar');
  const sName = document.getElementById('sidebar-user-name');
  const sRoleText = document.getElementById('sidebar-user-role-text');

  if (sAvatar) sAvatar.textContent = initials;
  if (sName) sName.textContent = user.name;
  if (sRoleText) sRoleText.textContent = user.roleTitle || (isAdmin ? 'Admin Kelas' : 'Siswa');

  // Header Avatar button
  const hAvatar = document.getElementById('header-user-avatar');
  const hDot = document.getElementById('header-role-dot');

  if (hAvatar) hAvatar.textContent = initials;
  if (hDot) {
    hDot.className = `role-indicator-dot ${isAdmin ? 'admin' : ''}`;
  }

  // Popover Header
  const pAvatar = document.getElementById('popover-user-avatar');
  const pName = document.getElementById('popover-user-name');
  const pSub = document.getElementById('popover-user-sub');

  if (pAvatar) pAvatar.textContent = initials;
  if (pName) pName.textContent = user.name;
  if (pSub) pSub.textContent = `${user.roleTitle || (isAdmin ? 'Admin' : 'Siswa')} • Absen ${user.absentNo || '-'}`;

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeElements(currentTheme);

  if (window.lucide) window.lucide.createIcons();
}

function initUserPopover() {
  const triggerBtn = document.getElementById('header-user-menu-btn');
  const popover = document.getElementById('user-popover-menu');
  const sidebarUserCard = document.getElementById('sidebar-user-card');

  if (triggerBtn && popover) {
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.classList.toggle('open');
      triggerBtn.classList.toggle('active');
    });
  }

  if (sidebarUserCard) {
    sidebarUserCard.addEventListener('click', (e) => {
      e.stopPropagation();
      openSwitchUserModal();
    });
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (popover && !popover.contains(e.target) && triggerBtn && !triggerBtn.contains(e.target)) {
      closeUserPopover();
    }
  });

  // Switch user in popover
  const popoverSwitchBtn = document.getElementById('popover-switch-user-btn');
  if (popoverSwitchBtn) {
    popoverSwitchBtn.addEventListener('click', () => {
      closeUserPopover();
      openSwitchUserModal();
    });
  }

  // Theme toggle in popover
  const popoverThemeBtn = document.getElementById('popover-theme-toggle-btn');
  if (popoverThemeBtn) {
    popoverThemeBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }

  // Logout in popover
  const popoverLogoutBtn = document.getElementById('popover-logout-btn');
  if (popoverLogoutBtn) {
    popoverLogoutBtn.addEventListener('click', () => {
      closeUserPopover();
      if (confirm('Keluar dari sesi dan kunci akses kelas?')) {
        auth.logout();
        showToast('Akses kelas telah dikunci.', 'info');
      }
    });
  }
}

function closeUserPopover() {
  const popover = document.getElementById('user-popover-menu');
  const triggerBtn = document.getElementById('header-user-menu-btn');
  if (popover) popover.classList.remove('open');
  if (triggerBtn) triggerBtn.classList.remove('active');
}

// Switch User Modal
export function openSwitchUserModal() {
  const { members } = store.data;
  const currentUser = auth.getCurrentUser() || members[0];

  const modalContent = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Ganti Akun Pengguna</h3>
        <button class="btn btn-secondary btn-sm btn-icon-only" onclick="window.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <!-- STUDENT SELECT LOGIN -->
        <div style="margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle);">
          <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 0.85rem; color: var(--text-primary);">
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
            <label class="form-label">PIN Siswa (Bawaan: 1234)</label>
            <input type="password" class="form-input" id="login-student-pin" value="1234" placeholder="Masukkan 4 digit PIN" />
          </div>

          <button class="btn btn-primary" id="btn-login-student" style="width: 100%; margin-top: 0.4rem; padding: 0.65rem;">
            <i data-lucide="log-in" style="width: 15px; height: 15px;"></i> Masuk ke Akun Ini
          </button>
        </div>

        <!-- MASTER ADMIN LOGIN -->
        <div style="margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle);">
          <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem;">
            <i data-lucide="shield-check" style="color: var(--warning); width: 16px; height: 16px;"></i>
            Mode Pengurus / Admin
          </h4>
          <div class="form-group">
            <label class="form-label">Master PIN Admin (Default: admin123)</label>
            <input type="password" class="form-input" id="login-admin-pin" placeholder="Masukkan Master PIN" />
          </div>
          <button class="btn btn-secondary" id="btn-login-admin" style="width: 100%; color: var(--warning); border-color: var(--warning-border); padding: 0.65rem;">
            <i data-lucide="shield-check" style="width: 15px; height: 15px;"></i> Masuk Mode Pengurus
          </button>
        </div>

        <!-- RESET TESTING DATA -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.85rem 1rem; border-radius: var(--radius-sm); background-color: var(--card-subtle); border: 1px solid var(--border);">
          <div>
            <div style="font-size: 0.875rem; font-weight: 700; color: var(--text-primary);">Reset Data Demo</div>
            <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.1rem;">Kembalikan data ke nilai awal bawaan.</div>
          </div>
          <button class="btn btn-soft-danger btn-sm" id="btn-reset-demo-data" style="font-size: 0.8125rem;">
            Reset
          </button>
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
      showToast('Semua data berhasil di-reset!', 'success');
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
  initUserPopover();

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

  // Initial Render
  renderApp();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
