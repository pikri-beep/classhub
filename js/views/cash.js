/**
 * CASH & DUES VIEW
 * ClassHub - Kas Kelas, Matrix Iuran & Buku Transaksi
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
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon success">
            <i data-lucide="wallet"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">Rp ${cashStats.balance.toLocaleString('id-ID')}</span>
            <span class="stat-label">Total Saldo Kas Tersedia</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon primary">
            <i data-lucide="arrow-down-left"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">Rp ${cashStats.income.toLocaleString('id-ID')}</span>
            <span class="stat-label">Total Pemasukan Kas</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon danger">
            <i data-lucide="arrow-up-right"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">Rp ${cashStats.expense.toLocaleString('id-ID')}</span>
            <span class="stat-label">Total Pengeluaran Kas</span>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div class="filter-bar">
          <button class="filter-pill ${activeCashTab === 'matrix' ? 'active' : ''}" data-tab="matrix">
            <i data-lucide="table" style="width: 14px; height: 14px; display: inline;"></i> Matrix Iuran Siswa
          </button>
          <button class="filter-pill ${activeCashTab === 'transactions' ? 'active' : ''}" data-tab="transactions">
            <i data-lucide="receipt" style="width: 14px; height: 14px; display: inline;"></i> Riwayat & Buku Kas
          </button>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          ${activeCashTab === 'matrix' ? `
            <button class="btn btn-secondary btn-sm" id="btn-toggle-my-dues">
              <i data-lucide="${showOnlyMyDues ? 'users' : 'user'}"></i>
              ${showOnlyMyDues ? 'Tampilkan Semua Siswa' : 'Hanya Tagihan Saya'}
            </button>
          ` : ''}

          ${isAdmin ? `
            <button class="btn btn-primary" id="btn-add-tx">
              <i data-lucide="plus-circle"></i> Catat Transaksi Baru
            </button>
          ` : ''}
        </div>
      </div>

      ${activeCashTab === 'matrix' ? renderMatrixTab(studentsToDisplay, cash.duesPeriods, user, isAdmin) : renderTransactionsTab(cash.transactions, isAdmin)}
    </div>
  `;

  container.querySelectorAll('.filter-pill[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCashTab = btn.getAttribute('data-tab');
      renderCash(container);
    });
  });

  const toggleMyDuesBtn = container.querySelector('#btn-toggle-my-dues');
  if (toggleMyDuesBtn) {
    toggleMyDuesBtn.addEventListener('click', () => {
      showOnlyMyDues = !showOnlyMyDues;
      renderCash(container);
    });
  }

  if (isAdmin) {
    container.querySelectorAll('.dues-checkbox-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-period-id');
        const sId = btn.getAttribute('data-student-id');
        store.toggleDuesPayment(pId, sId);
        showToast('Status iuran siswa diperbarui!', 'success');
      });
    });

    const addTxBtn = container.querySelector('#btn-add-tx');
    if (addTxBtn) {
      addTxBtn.addEventListener('click', () => {
        openAddTransactionModal();
      });
    }

    container.querySelectorAll('.delete-tx-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Yakin ingin menghapus catatan transaksi ini?')) {
          store.deleteCashTransaction(id);
          showToast('Transaksi dihapus', 'success');
        }
      });
    });
  }
}

function renderMatrixTab(students, duesPeriods, currentUser, isAdmin) {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-title">
            <i data-lucide="layout-grid" style="color: var(--primary); width: 18px; height: 18px;"></i>
            Status Iuran Kas Per Anggota
          </div>
          <div class="card-subtitle">
            ${isAdmin ? 'Klik tombol status untuk mengubah status bayar (Lunas/Belum)' : 'Daftar transparansi pembayaran kas seluruh siswa'}
          </div>
        </div>
      </div>
      <div class="cash-matrix-table-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th style="width: 50px;">No</th>
              <th>Nama Siswa</th>
              ${duesPeriods.map(p => `
                <th style="text-align: center;">
                  <div>${p.name}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">Rp ${p.amount.toLocaleString('id-ID')}</div>
                </th>
              `).join('')}
              <th style="text-align: center;">Total Lunas</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, idx) => {
              let paidCount = 0;
              return `
                <tr ${student.id === currentUser.id ? 'style="background-color: var(--primary-soft); font-weight: 600;"' : ''}>
                  <td>${student.absentNo || idx + 1}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span>${student.name}</span>
                      ${student.id === currentUser.id ? '<span class="badge badge-primary">Saya</span>' : ''}
                    </div>
                  </td>
                  ${duesPeriods.map(p => {
                    const isPaid = p.paidStudentIds.includes(student.id);
                    if (isPaid) paidCount++;
                    return `
                      <td style="text-align: center;">
                        <button 
                          class="dues-checkbox-btn ${isPaid ? 'paid' : ''}" 
                          ${!isAdmin ? 'disabled' : ''}
                          data-period-id="${p.id}"
                          data-student-id="${student.id}"
                          title="${isAdmin ? 'Klik untuk toggle status' : ''}"
                        >
                          ${isPaid ? '✓ Lunas' : 'Belum'}
                        </button>
                      </td>
                    `;
                  }).join('')}
                  <td style="text-align: center; font-weight: 700; color: ${paidCount === duesPeriods.length ? 'var(--success)' : 'var(--text-primary)'};">
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

function renderTransactionsTab(transactions, isAdmin) {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-title">
            <i data-lucide="book-open-check" style="color: var(--primary); width: 18px; height: 18px;"></i>
            Buku Catatan Arus Kas Kelas
          </div>
          <div class="card-subtitle">Semua riwayat pemasukan dan pengeluaran secara transparan</div>
        </div>
      </div>
      <div class="cash-matrix-table-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th>Kategori</th>
              <th>Keterangan</th>
              <th>Nominal</th>
              <th>Dicatat Oleh</th>
              ${isAdmin ? '<th style="text-align: center;">Aksi</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${transactions.length === 0 ? `
              <tr>
                <td colspan="${isAdmin ? 7 : 6}" style="text-align: center; padding: 2rem;">Belum ada riwayat transaksi.</td>
              </tr>
            ` : transactions.map(tx => {
              const isIncome = tx.type === 'income';
              return `
                <tr>
                  <td style="white-space: nowrap; font-size: 0.8rem; color: var(--text-muted);">${tx.date}</td>
                  <td>
                    <span class="badge ${isIncome ? 'badge-success' : 'badge-danger'}">
                      ${isIncome ? '↓ Pemasukan' : '↑ Pengeluaran'}
                    </span>
                  </td>
                  <td style="font-weight: 600;">${tx.category}</td>
                  <td>${tx.description}</td>
                  <td style="font-weight: 700; color: ${isIncome ? 'var(--success)' : 'var(--danger)'}; white-space: nowrap;">
                    ${isIncome ? '+ ' : '- '}Rp ${Number(tx.amount).toLocaleString('id-ID')}
                  </td>
                  <td style="font-size: 0.8rem; color: var(--text-muted);">${tx.recordedBy}</td>
                  ${isAdmin ? `
                    <td style="text-align: center;">
                      <button class="btn btn-soft-danger btn-sm btn-icon-only delete-tx-btn" data-id="${tx.id}" title="Hapus Transaksi">
                        <i data-lucide="trash-2"></i>
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

function openAddTransactionModal() {
  const user = auth.getCurrentUser();
  const modalContent = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Catat Transaksi Kas Baru</h3>
        <button class="btn btn-secondary btn-sm btn-icon-only" onclick="window.closeModal()">✕</button>
      </div>
      <form id="form-add-tx">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Jenis Transaksi</label>
              <select class="form-select" id="tx-type" required>
                <option value="income">↓ Pemasukan Kas</option>
                <option value="expense" selected>↑ Pengeluaran Kas</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Nominal (Rupiah)</label>
              <input type="number" class="form-input" id="tx-amount" placeholder="Contoh: 25000" min="1000" step="500" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Kategori</label>
              <input type="text" class="form-input" id="tx-cat" placeholder="Contoh: Alat Kebersihan / Iuran / Fotokopi" required />
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Transaksi</label>
              <input type="date" class="form-input" id="tx-date" value="${new Date().toISOString().split('T')[0]}" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Keterangan Lengkap</label>
            <textarea class="form-textarea" id="tx-desc" placeholder="Rincian pembelian barang atau penerimaan dana..." required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Transaksi</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalContent);

  const form = document.getElementById('form-add-tx');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('tx-type').value;
    const amount = Number(document.getElementById('tx-amount').value);
    const category = document.getElementById('tx-cat').value.trim();
    const date = document.getElementById('tx-date').value;
    const description = document.getElementById('tx-desc').value.trim();

    if (!amount || !category || !description) return;

    store.addCashTransaction({
      type,
      amount,
      category,
      date,
      description,
      recordedBy: user ? user.name : 'Bendahara'
    });

    closeModal();
    showToast('Transaksi berhasil dicatat ke buku kas!', 'success');
  });
}
