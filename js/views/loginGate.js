/**
 * LOGIN GATEKEEPER VIEW - NOTION ULTRA-SIMPLE WORKSPACE
 * ClassHub - Gerbang Masuk Kelas Terproteksi (Clean & Minimalist)
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
        
        <!-- HEADER -->
        <div class="login-gate-header">
          <div style="font-size: 2.5rem; line-height: 1; margin-bottom: 0.5rem;">🔒</div>
          <h1 class="login-gate-title">ClassHub</h1>
          <p class="login-gate-subtitle">Portal Terpadu Kelas <strong>${classInfo.name}</strong> • ${classInfo.school}</p>
          <div style="margin-top: 0.5rem;">
            <span class="notion-tag notion-tag-gray">Akses Terproteksi Anggota Kelas</span>
          </div>
        </div>

        <!-- TAB SWITCHER -->
        <div style="display: flex; gap: 0.35rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
          <button class="btn ${activeLoginTab === 'student' ? 'btn-secondary' : 'btn-ghost'} btn-sm" id="tab-btn-student" style="flex: 1; font-weight: ${activeLoginTab === 'student' ? '700' : '500'};">
            <i data-lucide="user"></i> Masuk Siswa
          </button>
          <button class="btn ${activeLoginTab === 'admin' ? 'btn-secondary' : 'btn-ghost'} btn-sm" id="tab-btn-admin" style="flex: 1; font-weight: ${activeLoginTab === 'admin' ? '700' : '500'};">
            <i data-lucide="shield-check"></i> Pengurus / Admin
          </button>
        </div>

        <!-- FORM CONTENT -->
        <div>
          ${activeLoginTab === 'student' ? `
            <form id="form-gate-student">
              <div class="form-group" style="margin-bottom: 0.85rem;">
                <label class="form-label">Pilih Nama Anda</label>
                <select class="form-select" id="gate-student-id" required>
                  ${members.map(m => `
                    <option value="${m.id}" ${m.id === 'std-1' ? 'selected' : ''}>Absen ${m.absentNo}. ${m.name} (${m.roleTitle || 'Siswa'})</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <label class="form-label">PIN Siswa</label>
                  <span style="font-size: 0.78rem; color: var(--text-muted);">Default: 1234</span>
                </div>
                <input type="password" class="form-input" id="gate-student-pin" placeholder="Masukkan PIN" value="1234" required />
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.65rem; font-size: 0.9rem;">
                Masuk ke Kelas Saya →
              </button>

              <button type="button" class="btn btn-ghost" id="btn-quick-login-std1" style="width: 100%; margin-top: 0.5rem; font-size: 0.8125rem; border: 1px dashed var(--border);">
                ⚡ Masuk Instan (Ahmad Fauzan - Demo)
              </button>
            </form>
          ` : `
            <form id="form-gate-admin">
              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label">Master PIN Pengurus / Admin</label>
                <input type="password" class="form-input" id="gate-admin-pin" placeholder="Masukkan PIN Admin" value="admin123" required />
                <span class="form-help" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.35rem; display: block;">
                  PIN Bawaan Pengurus: <strong>admin123</strong>
                </span>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.65rem; font-size: 0.9rem;">
                Buka Akses Admin Kelas →
              </button>
            </form>
          `}
        </div>

        <!-- FOOTER INFO -->
        <div style="margin-top: 1.5rem; text-align: center; font-size: 0.8125rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 0.85rem;">
          Wali Kelas: <strong style="color: var(--text-primary);">${classInfo.homeroomTeacher}</strong>
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

  // Quick instant login button
  const quickLoginBtn = container.querySelector('#btn-quick-login-std1');
  if (quickLoginBtn) {
    quickLoginBtn.addEventListener('click', () => {
      const res = auth.loginAsStudent('std-1', '1234');
      if (res.success) {
        showToast(`Selamat datang, ${res.user.name}! (Demo)`, 'success');
      } else {
        showToast(res.message, 'error');
      }
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
