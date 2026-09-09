/**
 * LOGIN GATEKEEPER VIEW
 * ClassHub - Gerbang Masuk Kelas Terproteksi
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast } from '../app.js';

let activeLoginTab = 'student'; // 'student' | 'admin'

export function renderLoginGate(container) {
  const { classInfo, members } = store.data;

  container.innerHTML = `
    <div class="login-gate-wrapper">
      <div class="login-gate-card card">
        <!-- BRANDING HEADER WITH LOGO IMAGE SLOT -->
        <div class="login-gate-header">
          <div class="brand-logo-container" style="width: 54px; height: 54px; margin: 0 auto 0.85rem; border-radius: var(--radius-lg);" title="Logo Kelas">
            <img src="assets/logo.svg" alt="Logo Kelas" class="brand-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="brand-logo-fallback" style="display: none; font-size: 1.15rem;">
              <span>CH</span>
            </div>
          </div>
          <h1 class="login-gate-title">ClassHub</h1>
          <p class="login-gate-subtitle">Portal Manajemen Terpadu Kelas <strong>${classInfo.name}</strong> • ${classInfo.school}</p>
          <div class="login-gate-badge">
            <i data-lucide="lock" style="width: 13px; height: 13px;"></i>
            Akses Terproteksi Anggota Kelas
          </div>
        </div>

        <!-- TAB SWITCHER -->
        <div class="login-tab-group">
          <button class="login-tab-btn ${activeLoginTab === 'student' ? 'active' : ''}" id="tab-btn-student">
            <i data-lucide="user"></i> Masuk Siswa
          </button>
          <button class="login-tab-btn ${activeLoginTab === 'admin' ? 'active' : ''}" id="tab-btn-admin">
            <i data-lucide="shield-check"></i> Pengurus / Admin
          </button>
        </div>

        <!-- FORM CONTENT -->
        <div class="login-form-area">
          ${activeLoginTab === 'student' ? `
            <form id="form-gate-student">
              <div class="form-group">
                <label class="form-label">Pilih Nama Anda (Anggota Kelas)</label>
                <select class="form-select" id="gate-student-id" required>
                  <option value="" disabled selected>-- Pilih Nama Siswa --</option>
                  ${members.map(m => `
                    <option value="${m.id}">Absen ${m.absentNo}. ${m.name} (${m.roleTitle || 'Siswa'})</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label class="form-label">PIN Siswa</label>
                  <span style="font-size: 0.72rem; color: var(--primary); font-weight: 600;">PIN Bawaan: 1234</span>
                </div>
                <input type="password" class="form-input" id="gate-student-pin" placeholder="Masukkan 4 digit PIN" value="1234" required />
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.75rem; padding: 0.75rem;">
                <i data-lucide="log-in"></i> Masuk ke Kelas Saya
              </button>
            </form>
          ` : `
            <form id="form-gate-admin">
              <div class="form-group">
                <label class="form-label">Master PIN Pengurus / Administrator</label>
                <input type="password" class="form-input" id="gate-admin-pin" placeholder="Masukkan Master PIN Admin" value="admin123" required />
                <span class="form-help" style="color: var(--warning);">
                  <i data-lucide="info" style="width: 12px; height: 12px; display: inline;"></i> PIN Default Pengurus: <strong>admin123</strong>
                </span>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.75rem; padding: 0.75rem; background-color: var(--primary);">
                <i data-lucide="shield-check"></i> Buka Akses Admin Kelas
              </button>
            </form>
          `}
        </div>

        <!-- FOOTER INFO -->
        <div class="login-gate-footer">
          <p>Wali Kelas: <strong>${classInfo.homeroomTeacher}</strong></p>
          <p style="margin-top: 0.25rem; font-size: 0.75rem; color: var(--text-muted);">
            Informasi kelas disimpan secara terpusat dan aman.
          </p>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Tab Events
  const tabStudent = container.querySelector('#tab-btn-student');
  const tabAdmin = container.querySelector('#tab-btn-admin');

  if (tabStudent) {
    tabStudent.addEventListener('click', () => {
      activeLoginTab = 'student';
      renderLoginGate(container);
    });
  }

  if (tabAdmin) {
    tabAdmin.addEventListener('click', () => {
      activeLoginTab = 'admin';
      renderLoginGate(container);
    });
  }

  // Submit student form
  const formStudent = container.querySelector('#form-gate-student');
  if (formStudent) {
    formStudent.addEventListener('submit', (e) => {
      e.preventDefault();
      const studentId = container.querySelector('#gate-student-id').value;
      const pin = container.querySelector('#gate-student-pin').value.trim();

      if (!studentId) {
        showToast('Silakan pilih nama siswa terlebih dahulu!', 'error');
        return;
      }

      const res = auth.loginAsStudent(studentId, pin);
      if (res.success) {
        showToast(`Selamat datang, ${res.user.name}!`, 'success');
      } else {
        showToast(res.message, 'error');
      }
    });
  }

  // Submit admin form
  const formAdmin = container.querySelector('#form-gate-admin');
  if (formAdmin) {
    formAdmin.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = container.querySelector('#gate-admin-pin').value.trim();

      const res = auth.loginAsMasterAdmin(pin);
      if (res.success) {
        showToast('Berhasil masuk dalam Mode Pengurus / Admin!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    });
  }
}
