/**
 * CLASS VIEW (UNIFIED: ANNOUNCEMENTS & MEMBER DIRECTORY) - NOTION ULTRA-SIMPLE WORKSPACE
 * ClassHub - Pengumuman Resmi & Direktori Anggota Kelas (Clean & Minimalist)
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast, openModal, closeModal } from '../app.js';

let activeSubTab = 'announcements'; // 'announcements' | 'members'
let currentCategory = 'all';
let announcementSearch = '';
let memberSearch = '';

export function renderClass(container, defaultTab = null) {
  if (defaultTab) activeSubTab = defaultTab;

  const user = auth.getCurrentUser();
  const isAdmin = auth.isAdmin();
  const { announcements, members, classInfo, cash } = store.data;

  container.innerHTML = `
    <div>
      <!-- 1. NOTION PAGE HEADER -->
      <div class="notion-page-header">
        <span class="notion-page-icon">🏛️</span>
        <h1 class="notion-page-title">Ruang Kelas</h1>
        <p class="notion-page-desc">Papan warta pengumuman resmi & direktori anggota kelas ${classInfo.name} • ${classInfo.school}</p>
      </div>

      <!-- 2. SUB-TAB SWITCHER -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.65rem;">
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <button class="btn ${activeSubTab === 'announcements' ? 'btn-secondary' : 'btn-ghost'} btn-sm view-tab-btn" data-subtab="announcements" style="font-weight: ${activeSubTab === 'announcements' ? '700' : '500'};">
            <i data-lucide="megaphone"></i>
            <span>Papan Pengumuman (${announcements.length})</span>
          </button>
          <button class="btn ${activeSubTab === 'members' ? 'btn-secondary' : 'btn-ghost'} btn-sm view-tab-btn" data-subtab="members" style="font-weight: ${activeSubTab === 'members' ? '700' : '500'};">
            <i data-lucide="users"></i>
            <span>Direktori Siswa (${members.length})</span>
          </button>
        </div>

        ${activeSubTab === 'announcements' && isAdmin ? `
          <button class="btn btn-primary btn-sm" id="btn-add-ann" style="font-size: 0.8125rem;">
            <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
            <span>+ Buat Pengumuman</span>
          </button>
        ` : ''}
      </div>

      <!-- 3. TAB CONTENT -->
      <div id="class-tab-content">
        ${activeSubTab === 'announcements' ? renderAnnouncementsContent(announcements, isAdmin) : renderMembersContent(members, classInfo, cash, user)}
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  container.querySelectorAll('.view-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSubTab = btn.getAttribute('data-subtab');
      renderClass(container);
    });
  });

  if (activeSubTab === 'announcements') {
    attachAnnouncementEvents(container, user, isAdmin);
  } else {
    attachMemberEvents(container);
  }
}

// --- ANNOUNCEMENTS CONTENT ---
function renderAnnouncementsContent(announcements, isAdmin) {
  let filtered = announcements.filter(item => {
    const matchCat = currentCategory === 'all' || item.category === currentCategory;
    const matchSearch = announcementSearch === '' ||
      item.title.toLowerCase().includes(announcementSearch.toLowerCase()) ||
      item.content.toLowerCase().includes(announcementSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  filtered.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return `
    <div>
      <!-- Filter Bar & Search -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
          <button class="btn ${currentCategory === 'all' ? 'btn-secondary' : 'btn-ghost'} btn-sm filter-pill" data-cat="all">Semua</button>
          <button class="btn ${currentCategory === 'penting' ? 'btn-secondary' : 'btn-ghost'} btn-sm filter-pill" data-cat="penting">Penting</button>
          <button class="btn ${currentCategory === 'akademik' ? 'btn-secondary' : 'btn-ghost'} btn-sm filter-pill" data-cat="akademik">Akademik</button>
          <button class="btn ${currentCategory === 'kegiatan' ? 'btn-secondary' : 'btn-ghost'} btn-sm filter-pill" data-cat="kegiatan">Kegiatan</button>
          <button class="btn ${currentCategory === 'keuangan' ? 'btn-secondary' : 'btn-ghost'} btn-sm filter-pill" data-cat="keuangan">Keuangan</button>
        </div>

        <input 
          type="text" 
          id="class-ann-search" 
          class="form-input" 
          placeholder="Cari judul atau isi pengumuman..." 
          value="${announcementSearch}" 
          style="width: 250px; padding: 0.4rem 0.75rem; font-size: 0.8125rem;"
        />
      </div>

      <!-- Feed -->
      ${filtered.length === 0 ? `
        <div class="card" style="padding: 2.5rem 1.5rem; text-align: center;">
          <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin: 0;">Tidak ada pengumuman ditemukan</p>
          <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.25rem;">Belum ada warta untuk filter pencarian ini.</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${filtered.map(ann => {
            const dateObj = new Date(ann.createdAt);
            const dateStr = !isNaN(dateObj) ? `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}` : '';

            return `
              <div class="card" style="padding: 1.15rem 1.35rem; ${ann.isPinned ? 'border-left: 3px solid var(--primary);' : ''}">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
                  <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.4rem; flex-wrap: wrap;">
                      ${ann.isPinned ? '<span class="notion-tag notion-tag-orange">📌 Disematkan</span>' : ''}
                      <span class="notion-tag notion-tag-gray" style="text-transform: uppercase;">${ann.category}</span>
                      <span style="font-size: 0.8rem; color: var(--text-muted);">${dateStr}</span>
                    </div>

                    <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; line-height: 1.35;">
                      ${ann.title}
                    </h3>

                    <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.55; white-space: pre-line; margin-bottom: 0.65rem;">
                      ${ann.content}
                    </p>

                    <div style="font-size: 0.78rem; color: var(--text-muted);">
                      Ditulis oleh: <strong style="color: var(--text-primary);">${ann.author}</strong>
                    </div>
                  </div>

                  ${isAdmin ? `
                    <div style="display: flex; align-items: center; gap: 0.25rem; flex-shrink: 0;">
                      <button class="btn btn-ghost btn-sm btn-icon-only pin-ann-btn" data-id="${ann.id}" title="${ann.isPinned ? 'Lepas Pin' : 'Sematkan'}" style="padding: 0.25rem;">
                        <i data-lucide="${ann.isPinned ? 'pin-off' : 'pin'}" style="width: 14px; height: 14px;"></i>
                      </button>
                      <button class="btn btn-ghost btn-sm btn-icon-only delete-ann-btn" data-id="${ann.id}" title="Hapus" style="padding: 0.25rem;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--danger);"></i>
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

// --- MEMBERS CONTENT (NOTION TABLE) ---
function renderMembersContent(members, classInfo, cash, user) {
  const filtered = members.filter(m => {
    return memberSearch === '' ||
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.roleTitle && m.roleTitle.toLowerCase().includes(memberSearch.toLowerCase())) ||
      (m.nisn && m.nisn.includes(memberSearch));
  });

  filtered.sort((a, b) => (a.absentNo || 0) - (b.absentNo || 0));

  return `
    <div>
      <!-- Notion Properties Bar -->
      <div class="notion-properties-bar">
        <div class="notion-prop-item">
          <span style="color: var(--text-muted);">Wali Kelas:</span>
          <strong>${classInfo.homeroomTeacher}</strong>
        </div>
        <div class="notion-prop-item">
          <span style="color: var(--text-muted);">Tahun Ajaran:</span>
          <span>${classInfo.academicYear}</span>
        </div>
        <div class="notion-prop-item">
          <span style="color: var(--text-muted);">Total Siswa:</span>
          <span class="notion-tag notion-tag-gray">${members.length} Siswa Terdaftar</span>
        </div>
      </div>

      <!-- Search Box -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
        <input 
          type="text" 
          id="class-member-search" 
          class="form-input" 
          placeholder="Cari nama siswa, absen, atau peran..." 
          value="${memberSearch}" 
          style="width: 280px; padding: 0.4rem 0.75rem; font-size: 0.8125rem;"
        />
      </div>

      <!-- Notion Database Table for Members -->
      <div class="notion-table-wrapper">
        <table class="notion-table">
          <thead>
            <tr>
              <th style="width: 50px;">Absen</th>
              <th>Nama Lengkap</th>
              <th style="width: 130px;">NISN</th>
              <th style="width: 170px;">Jabatan / Peran</th>
              <th style="width: 90px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                  Tidak ada siswa yang cocok dengan pencarian.
                </td>
              </tr>
            ` : filtered.map(m => {
              const isMe = m.id === user.id;
              const isOfficer = m.roleTitle && m.roleTitle !== 'Anggota' && m.roleTitle !== 'Siswa';

              return `
                <tr ${isMe ? 'style="background-color: var(--card-hover); font-weight: 600;"' : ''}>
                  <td style="color: var(--text-muted); font-weight: 600;">#${m.absentNo}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span>${m.name}</span>
                      ${isMe ? '<span class="notion-tag notion-tag-green">Saya</span>' : ''}
                    </div>
                  </td>
                  <td style="color: var(--text-secondary); font-family: monospace; font-size: 0.8125rem;">
                    ${m.nisn}
                  </td>
                  <td>
                    <span class="notion-tag ${isOfficer ? 'notion-tag-orange' : 'notion-tag-gray'}">
                      ${m.roleTitle || 'Siswa'}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <span style="color: var(--text-muted); font-size: 0.78rem;">Aktif</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;
}

// --- ATTACH EVENTS ---
function attachAnnouncementEvents(container, user, isAdmin) {
  container.querySelectorAll('.filter-pill[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-cat');
      renderClass(container);
    });
  });

  const sInput = container.querySelector('#class-ann-search');
  if (sInput) {
    sInput.addEventListener('input', (e) => {
      announcementSearch = e.target.value;
      renderClass(container);
    });
  }

  if (isAdmin) {
    container.querySelectorAll('.pin-ann-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        store.togglePinAnnouncement(id);
        renderClass(container);
      });
    });

    container.querySelectorAll('.delete-ann-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus pengumuman ini?')) {
          store.deleteAnnouncement(id);
          renderClass(container);
          showToast('Pengumuman dihapus', 'info');
        }
      });
    });

    const addBtn = container.querySelector('#btn-add-ann');
    if (addBtn) {
      addBtn.addEventListener('click', () => openAddAnnouncementModal(container, user));
    }
  }
}

function attachMemberEvents(container) {
  const mInput = container.querySelector('#class-member-search');
  if (mInput) {
    mInput.addEventListener('input', (e) => {
      memberSearch = e.target.value;
      renderClass(container);
    });
  }
}

function openAddAnnouncementModal(container, user) {
  const modalContent = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3 class="modal-title">Buat Pengumuman Baru</h3>
        <button class="modal-close-btn" onclick="closeModal()"><i data-lucide="x"></i></button>
      </div>
      <form id="form-modal-add-ann">
        <div class="form-group">
          <label class="form-label">Kategori Warta</label>
          <select class="form-select" id="modal-ann-cat">
            <option value="penting">Penting (Wajib Baca)</option>
            <option value="akademik" selected>Akademik & Mapel</option>
            <option value="kegiatan">Kegiatan & Acara</option>
            <option value="keuangan">Keuangan & Kas</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Penulis</label>
          <input type="text" class="form-input" id="modal-ann-author" value="${user.name} (${user.roleTitle || 'Pengurus'})" required />
        </div>
        <div class="form-group">
          <label class="form-label">Judul Pengumuman</label>
          <input type="text" class="form-input" id="modal-ann-title" placeholder="Tuliskan judul singkat..." required />
        </div>
        <div class="form-group">
          <label class="form-label">Isi Warta / Pengumuman</label>
          <textarea class="form-input" id="modal-ann-content" placeholder="Tuliskan isi pengumuman kelas secara jelas..." required rows="4"></textarea>
        </div>
        <div class="modal-footer" style="padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Publikasikan</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalContent);

  document.getElementById('form-modal-add-ann').addEventListener('submit', (e) => {
    e.preventDefault();
    const category = document.getElementById('modal-ann-cat').value;
    const author = document.getElementById('modal-ann-author').value.trim();
    const title = document.getElementById('modal-ann-title').value.trim();
    const content = document.getElementById('modal-ann-content').value.trim();

    store.addAnnouncement({ category, author, title, content });
    closeModal();
    renderClass(container);
    showToast('Pengumuman berhasil dipublikasikan!', 'success');
  });
}
