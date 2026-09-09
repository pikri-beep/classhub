/**
 * ANNOUNCEMENTS VIEW
 * ClassHub - Papan Pengumuman & Informasi Terpusat
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast, openModal, closeModal } from '../app.js';

let currentCategory = 'all';
let searchQuery = '';

export function renderAnnouncements(container) {
  const isAdmin = auth.isAdmin();
  const { announcements } = store.data;

  let filtered = announcements.filter(item => {
    const matchCat = currentCategory === 'all' || item.category === currentCategory;
    const matchSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  filtered.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div class="filter-bar">
          <button class="filter-pill ${currentCategory === 'all' ? 'active' : ''}" data-cat="all">Semua</button>
          <button class="filter-pill ${currentCategory === 'penting' ? 'active' : ''}" data-cat="penting">🔴 Penting</button>
          <button class="filter-pill ${currentCategory === 'akademik' ? 'active' : ''}" data-cat="akademik">📘 Akademik</button>
          <button class="filter-pill ${currentCategory === 'kegiatan' ? 'active' : ''}" data-cat="kegiatan">🎯 Kegiatan</button>
          <button class="filter-pill ${currentCategory === 'keuangan' ? 'active' : ''}" data-cat="keuangan">💰 Keuangan</button>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <input 
            type="text" 
            id="ann-search-input" 
            class="form-input" 
            placeholder="Cari pengumuman..." 
            value="${searchQuery}" 
            style="width: 220px; padding: 0.45rem 0.75rem; font-size: 0.85rem;"
          />
          ${isAdmin ? `
            <button class="btn btn-primary" id="btn-add-ann">
              <i data-lucide="plus"></i> Buat Pengumuman
            </button>
          ` : ''}
        </div>
      </div>

      <div id="announcements-list">
        ${filtered.length === 0 ? `
          <div class="empty-state card">
            <div class="empty-icon"><i data-lucide="bell-off"></i></div>
            <h3 class="empty-title">Tidak ada pengumuman ditemukan</h3>
            <p class="empty-desc">Belum ada pengumuman untuk filter ini.</p>
          </div>
        ` : filtered.map(ann => {
          const dateObj = new Date(ann.createdAt);
          const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
          
          let catBadge = 'badge-neutral';
          if (ann.category === 'penting') catBadge = 'badge-danger';
          else if (ann.category === 'akademik') catBadge = 'badge-primary';
          else if (ann.category === 'kegiatan') catBadge = 'badge-warning';
          else if (ann.category === 'keuangan') catBadge = 'badge-success';

          return `
            <div class="card announcement-card ${ann.isPinned ? 'pinned' : ''}">
              <div class="card-header">
                <div class="card-title-group">
                  <div class="card-title">
                    ${ann.isPinned ? '<i data-lucide="pin" style="color: var(--warning); width: 16px; height: 16px;"></i>' : ''}
                    ${ann.title}
                  </div>
                  <div class="announcement-meta">
                    <span>Oleh: <strong>${ann.author}</strong></span>
                    <span>•</span>
                    <span>${dateStr}</span>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge ${catBadge}">${ann.category.toUpperCase()}</span>
                  ${isAdmin ? `
                    <button class="btn btn-secondary btn-sm btn-icon-only pin-ann-btn" data-id="${ann.id}" title="${ann.isPinned ? 'Lepas Pin' : 'Sematkan'}">
                      <i data-lucide="${ann.isPinned ? 'pin-off' : 'pin'}"></i>
                    </button>
                    <button class="btn btn-soft-danger btn-sm btn-icon-only delete-ann-btn" data-id="${ann.id}" title="Hapus Pengumuman">
                      <i data-lucide="trash-2"></i>
                    </button>
                  ` : ''}
                </div>
              </div>
              <div class="card-body">
                <p class="announcement-content">${ann.content}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-cat');
      renderAnnouncements(container);
    });
  });

  const searchInput = container.querySelector('#ann-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderAnnouncements(container);
    });
  }

  if (isAdmin) {
    const addBtn = container.querySelector('#btn-add-ann');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openAddAnnouncementModal();
      });
    }

    container.querySelectorAll('.pin-ann-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        store.togglePinAnnouncement(id);
        showToast('Status sematan pengumuman diperbarui', 'info');
      });
    });

    container.querySelectorAll('.delete-ann-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Yakin ingin menghapus pengumuman ini?')) {
          store.deleteAnnouncement(id);
          showToast('Pengumuman berhasil dihapus', 'success');
        }
      });
    });
  }
}

function openAddAnnouncementModal() {
  const user = auth.getCurrentUser();
  const modalContent = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Buat Pengumuman Baru</h3>
        <button class="btn btn-secondary btn-sm btn-icon-only" onclick="window.closeModal()">✕</button>
      </div>
      <form id="form-add-ann">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Judul Pengumuman</label>
            <input type="text" class="form-input" id="ann-title" placeholder="Contoh: Jadwal Ujian Susulan" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Kategori</label>
              <select class="form-select" id="ann-category">
                <option value="penting">🔴 Penting</option>
                <option value="akademik">📘 Akademik</option>
                <option value="kegiatan" selected>🎯 Kegiatan</option>
                <option value="keuangan">💰 Keuangan</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Penulis</label>
              <input type="text" class="form-input" id="ann-author" value="${user ? user.name : 'Pengurus Kelas'}" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Isi Pengumuman</label>
            <textarea class="form-textarea" id="ann-content" placeholder="Tuliskan pesan lengkap untuk seluruh anggota kelas..." rows="5" required></textarea>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
            <input type="checkbox" id="ann-pin" style="width: 16px; height: 16px; cursor: pointer;" />
            <label for="ann-pin" style="font-size: 0.85rem; font-weight: 600; cursor: pointer; color: var(--text-primary);">Sematkan di bagian paling atas (Pin to Top)</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Publikasikan</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalContent);

  const form = document.getElementById('form-add-ann');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('ann-title').value.trim();
    const category = document.getElementById('ann-category').value;
    const author = document.getElementById('ann-author').value.trim();
    const content = document.getElementById('ann-content').value.trim();
    const isPinned = document.getElementById('ann-pin').checked;

    if (!title || !content) return;

    store.addAnnouncement({
      title,
      category,
      author,
      content,
      isPinned
    });

    closeModal();
    showToast('Pengumuman berhasil dipublikasikan!', 'success');
  });
}
