/**
 * MEMBERS VIEW
 * ClassHub - Struktur Organisasi & Direktori Anggota Kelas
 */

import { store } from '../store.js';
import { auth } from '../auth.js';

let memberSearch = '';

export function renderMembers(container) {
  const user = auth.getCurrentUser();
  const { classInfo, members, cash } = store.data;

  const filteredMembers = members.filter(m => {
    return memberSearch === '' ||
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.roleTitle && m.roleTitle.toLowerCase().includes(memberSearch.toLowerCase())) ||
      (m.nisn && m.nisn.includes(memberSearch));
  });

  filteredMembers.sort((a, b) => (a.absentNo || 0) - (b.absentNo || 0));
  const officers = members.filter(m => m.roleTitle && m.roleTitle !== 'Anggota');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div class="card" style="padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <div class="brand-logo-container" style="width: 48px; height: 48px; border-radius: var(--radius-md);" title="Logo Kelas">
            <img src="assets/logo.svg" alt="Logo Kelas" class="brand-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="brand-logo-fallback" style="display: none; font-size: 1.1rem;">
              <span>CH</span>
            </div>
          </div>
          <div>
            <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">${classInfo.name} • ${classInfo.school}</h2>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.15rem;">
              Wali Kelas: <strong>${classInfo.homeroomTeacher}</strong> • TA ${classInfo.academicYear}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <input 
            type="text" 
            id="member-search-input" 
            class="form-input" 
            placeholder="Cari nama / jabatan / NISN..." 
            value="${memberSearch}" 
            style="width: 250px; padding: 0.45rem 0.75rem; font-size: 0.85rem;"
          />
        </div>
      </div>

      <div>
        <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="award" style="color: var(--warning); width: 18px; height: 18px;"></i>
          Struktur Pengurus Kelas
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
          ${officers.map(officer => `
            <div class="card" style="padding: 1rem; display: flex; align-items: center; gap: 0.85rem; border-top: 3px solid var(--primary);">
              <div class="user-avatar" style="width: 38px; height: 38px;">
                ${officer.avatarText || officer.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--primary);">${officer.roleTitle}</div>
                <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">${officer.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Absen ${officer.absentNo}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="users" style="color: var(--primary); width: 18px; height: 18px;"></i>
            Seluruh Siswa (${members.length} Orang)
          </h3>
        </div>

        <div class="member-grid">
          ${filteredMembers.map(m => {
            const isMe = m.id === user.id;
            const paidDues = cash.duesPeriods.filter(p => p.paidStudentIds.includes(m.id)).length;
            const totalDues = cash.duesPeriods.length;

            return `
              <div class="card member-card" style="${isMe ? 'border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary);' : ''}">
                <div class="member-avatar-lg">
                  ${m.avatarText || m.name.substring(0, 2).toUpperCase()}
                </div>
                <div class="member-details">
                  <div style="display: flex; align-items: center; gap: 0.4rem; justify-content: space-between;">
                    <span class="member-fullname">${m.name}</span>
                    ${isMe ? '<span class="badge badge-primary">Saya</span>' : ''}
                  </div>
                  <div class="member-subinfo">
                    <span>Absen ${m.absentNo}</span> • <span>NISN: ${m.nisn}</span>
                  </div>
                  <div style="margin-top: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                    <span class="badge ${m.role === 'admin' ? 'badge-warning' : 'badge-neutral'}">
                      ${m.roleTitle || (m.role === 'admin' ? 'Admin' : 'Siswa')}
                    </span>
                    <span class="badge ${paidDues === totalDues ? 'badge-success' : 'badge-neutral'}" style="font-size: 0.68rem;" title="Status Iuran Kas">
                      Kas: ${paidDues}/${totalDues}
                    </span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#member-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      memberSearch = e.target.value;
      renderMembers(container);
    });
  }
}
