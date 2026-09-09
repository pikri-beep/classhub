/**
 * CASH & DUES VIEW - NOTION ULTRA-SIMPLE WORKSPACE
 * ClassHub - Kas Kelas, Matrix Iuran & Buku Transaksi (Clean & Minimalist)
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { showToast, openModal, closeModal } from '../app.js';

let activeCashTab = 'matrix';
let showOnlyMyDues = false;

export function renderCash(container) {
  const user = auth.getCurrentUser();
  const isAdmin = auth.isAdmin();
  const { members, cash } = store.data;
  const cashStats = store.getTotalCashBalance();

  const studentsToDisplay = showOnlyMyDues 
    ? members.filter(m => m.id === user.id) 
    : members;

  container.innerHTML = `
    <div>
      <!-- 1. NOTION PAGE HEADER -->
      <div class="notion-page-header">
        <span class="notion-page-icon">💳</span>
        <h1 class="notion-page-title">Kas & Iuran</h1>
        <p class="notion-page-desc">Transparansi keuangan kas kelas, buku arus transaksi & matriks iuran siswa</p>
      </div>

      <!-- 2. INLINE PROPERTIES STRIP -->
      <div class="notion-properties-bar">
        <div class="notion-prop-item">
          <span style="color: var(--text-muted);">Saldo Kas:</span>
          <strong style="font-size: 1.15rem; color: var(--text-primary);">Rp ${cashStats.balance.toLocaleString('id-ID')}</strong>
        </div>
        <div class="notion-prop-item">
          <span style="color: var(--text-muted);">Pemasukan:</span>
          <span class="notion-tag notion-tag-green">+ Rp ${cashStats.income.toLocaleString('id-ID')}</span>
        </div>
        <div class="notion-prop-item">
          <span style="color: var(--text-muted);">Pengeluaran:</span>
          <span class="notion-tag notion-tag-red">- Rp ${cashStats.expense.toLocaleString('id-ID')}</span>
        </div>
        <div class="notion-prop-item">
          <span style="color: var(--text-muted);">Iuran Wajib:</span>
          <span>Rp ${Number(cash.duesAmount || 10000).toLocaleString('id-ID')} / pekan</span>
        </div>
      </div>

      <!-- 3. SUB-TAB SWITCHER & ACTIONS -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.65rem;">
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <button class="btn ${activeCashTab === 'matrix' ? 'btn-secondary' : 'btn-ghost'} btn-sm view-tab-btn" data-tab="matrix" style="font-weight: ${activeCashTab === 'matrix' ? '700' : '500'};">
            <i data-lucide="table"></i>
            <span>Matriks Iuran Siswa</span>
          </button>
          <button class="btn ${activeCashTab === 'transactions' ? 'btn-secondary' : 'btn-ghost'} btn-sm view-tab-btn" data-tab="transactions" style="font-weight: ${activeCashTab === 'transactions' ? '700' : '500'};">
            <i data-lucide="receipt"></i>
            <span>Buku Kas Transaksi (${(cash.transactions || []).length})</span>
          </button>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem;">
          ${activeCashTab === 'matrix' ? `
            <button class="btn btn-ghost btn-sm" id="btn-toggle-my-dues" style="font-size: 0.8125rem;">
              <i data-lucide="${showOnlyMyDues ? 'users' : 'user'}" style="width: 14px; height: 14px;"></i>
              <span>${showOnlyMyDues ? 'Tampilkan Semua' : 'Tagihan Saya Saja'}</span>
            </button>
          ` : ''}

          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" id="btn-add-tx" style="font-size: 0.8125rem;">
              <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
              <span>+ Catat Transaksi</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- 4. TAB CONTENT -->
      <div id="cash-tab-content">
        ${activeCashTab === 'matrix' 
          ? renderMatrixTab(studentsToDisplay, cash.duesPeriods || [], user, isAdmin)
          : renderTransactionsTab(cash.transactions || [], isAdmin)
        }
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Tab switching
  container.querySelectorAll('.view-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCashTab = btn.getAttribute('data-tab');
      renderCash(container);
    });
  });

  // Toggle my dues
  const toggleBtn = container.querySelector('#btn-toggle-my-dues');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      showOnlyMyDues = !showOnlyMyDues;
      renderCash(container);
    });
  }

  // Matrix status toggles (admin)
  if (isAdmin) {
    container.querySelectorAll('.dues-notion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const periodId = btn.getAttribute('data-period-id');
        const studentId = btn.getAttribute('data-student-id');
        store.toggleDuesPaid(periodId, studentId);
        renderCash(container);
        showToast('Status pembayaran diperbarui!', 'success');
      });
    });
  }

  // Add transaction (admin)
  const addTxBtn = container.querySelector('#btn-add-tx');
  if (addTxBtn) {
    addTxBtn.addEventListener('click', () => openAddTransactionModal(container));
  }

  // Delete transaction (admin)
  if (isAdmin) {
    container.querySelectorAll('.delete-tx-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus pencatatan transaksi ini?')) {
          store.deleteTransaction(id);
          renderCash(container);
          showToast('Transaksi dihapus', 'info');
        }
      });
    });
  }
}

// --- MATRIX TAB (NOTION TABLE) ---
function renderMatrixTab(students, duesPeriods, currentUser, isAdmin) {
  return `
    <div>
      <div class="notion-section-desc">
        ${isAdmin ? 'Klik label tag pada tabel di bawah untuk menandai status Lunas / Belum.' : 'Transparansi rekapitulasi pembayaran kas per minggu untuk seluruh siswa.'}
      </div>

      <div class="notion-table-wrapper">
        <table class="notion-table">
          <thead>
            <tr>
              <th style="width: 45px;">No</th>
              <th>Nama Siswa</th>
              ${duesPeriods.map(p => `
                <th style="text-align: center; min-width: 100px;">
                  <div>${p.name}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">Rp ${Number(p.amount).toLocaleString('id-ID')}</div>
                </th>
              `).join('')}
              <th style="text-align: center; width: 100px;">Total Lunas</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, idx) => {
              let paidCount = 0;
              return `
                <tr ${student.id === currentUser.id ? 'style="background-color: var(--card-hover); font-weight: 600;"' : ''}>
                  <td style="color: var(--text-muted); font-weight: 600;">${student.absentNo || idx + 1}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.45rem;">
                      <span>${student.name}</span>
                      ${student.id === currentUser.id ? '<span class="notion-tag notion-tag-green">Saya</span>' : ''}
                    </div>
                  </td>
                  ${duesPeriods.map(p => {
                    const isPaid = (p.paidStudentIds || []).includes(student.id);
                    if (isPaid) paidCount++;
                    return `
                      <td style="text-align: center;">
                        <button 
                          class="notion-tag ${isPaid ? 'notion-tag-green' : 'notion-tag-red'} dues-notion-btn" 
                          ${!isAdmin ? 'disabled' : ''}
                          data-period-id="${p.id}"
                          data-student-id="${student.id}"
                          title="${isAdmin ? 'Klik untuk toggle status lunas/belum' : ''}"
                          style="border: none; cursor: ${isAdmin ? 'pointer' : 'default'};"
                        >
                          ${isPaid ? '✓ Lunas' : '○ Belum'}
                        </button>
                      </td>
                    `;
                  }).join('')}
                  <td style="text-align: center; font-weight: 600; color: ${paidCount === duesPeriods.length ? 'var(--success)' : 'var(--text-primary)'};">
                    ${paidCount} / ${duesPeriods.length}
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

// --- TRANSACTIONS TAB (NOTION TABLE) ---
function renderTransactionsTab(transactions, isAdmin) {
  return `
    <div>
      <div class="notion-section-desc">
        Buku catatan keluar-masuk dana kas kelas yang dicatat bendahara secara transparan.
      </div>

      <div class="notion-table-wrapper">
        <table class="notion-table">
          <thead>
            <tr>
              <th style="width: 100px;">Tanggal</th>
              <th style="width: 110px;">Jenis</th>
              <th style="width: 130px;">Kategori</th>
              <th>Keterangan</th>
              <th style="width: 130px; text-align: right;">Nominal</th>
              <th style="width: 130px;">Pencatat</th>
              ${isAdmin ? '<th style="text-align: center; width: 50px;">Aksi</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${transactions.length === 0 ? `
              <tr>
                <td colspan="${isAdmin ? 7 : 6}" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">Belum ada riwayat transaksi kas.</td>
              </tr>
            ` : transactions.map(tx => {
              const isIncome = tx.type === 'income';
              return `
                <tr>
                  <td style="white-space: nowrap; font-size: 0.8125rem; color: var(--text-secondary);">${tx.date}</td>
                  <td>
                    <span class="notion-tag ${isIncome ? 'notion-tag-green' : 'notion-tag-red'}">
                      ${isIncome ? '↓ Pemasukan' : '↑ Pengeluaran'}
                    </span>
                  </td>
                  <td><span class="notion-tag notion-tag-gray">${tx.category}</span></td>
                  <td style="color: var(--text-primary); line-height: 1.4;">${tx.description}</td>
                  <td style="text-align: right; font-weight: 700; color: ${isIncome ? 'var(--success)' : 'var(--danger)'}; white-space: nowrap;">
                    ${isIncome ? '+ ' : '- '}Rp ${Number(tx.amount).toLocaleString('id-ID')}
                  </td>
                  <td style="font-size: 0.8125rem; color: var(--text-muted);">${tx.recordedBy}</td>
                  ${isAdmin ? `
                    <td style="text-align: center;">
                      <button class="btn btn-ghost btn-sm btn-icon-only delete-tx-btn" data-id="${tx.id}" title="Hapus Transaksi" style="padding: 0.25rem;">
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
    </div>
  `;
}

// --- ADD TRANSACTION MODAL ---
function openAddTransactionModal(container) {
  const user = auth.getCurrentUser();
  const html = `
    <div class="modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <h3 class="modal-title">Catat Transaksi Kas Baru</h3>
        <button class="modal-close-btn" onclick="closeModal()"><i data-lucide="x"></i></button>
      </div>
      <form id="form-add-tx">
        <div class="form-group">
          <label class="form-label">Jenis Transaksi</label>
          <select class="form-select" id="tx-type" required>
            <option value="income">Pemasukan (+)</option>
            <option value="expense">Pengeluaran (-)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nominal (Rp)</label>
          <input type="number" class="form-input" id="tx-amount" placeholder="Contoh: 50000" min="1000" step="500" required />
        </div>
        <div class="form-group">
          <label class="form-label">Kategori</label>
          <input type="text" class="form-input" id="tx-category" placeholder="Contoh: Alat Kebersihan / Iuran / Fotokopi" required />
        </div>
        <div class="form-group">
          <label class="form-label">Keterangan Lengkap</label>
          <textarea class="form-input" id="tx-desc" rows="3" placeholder="Contoh: Beli sapu, pel lantai, dan spidol whiteboard..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Tanggal Transaksi</label>
          <input type="date" class="form-input" id="tx-date" value="${new Date().toISOString().split('T')[0]}" required />
        </div>
        <div class="modal-footer" style="padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Transaksi</button>
        </div>
      </form>
    </div>
  `;

  openModal(html);

  const form = document.getElementById('form-add-tx');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('tx-type').value;
      const amount = Number(document.getElementById('tx-amount').value);
      const category = document.getElementById('tx-category').value.trim();
      const description = document.getElementById('tx-desc').value.trim();
      const date = document.getElementById('tx-date').value;

      store.addTransaction({
        type,
        amount,
        category,
        description,
        date,
        recordedBy: user.name
      });

      closeModal();
      renderCash(container);
      showToast('Transaksi berhasil dicatat!', 'success');
    });
  }
}
