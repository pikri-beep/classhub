import React, { useState } from 'react';
import { Table, Receipt, Plus, Trash2, User, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function CashView() {
  const { currentUser, isAdmin } = useAuth();
  const { data, toggleDuesPaid, addTransaction, deleteTransaction, getTotalCashBalance } = useStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('matrix');
  const [showOnlyMyDues, setShowOnlyMyDues] = useState(false);

  // Add transaction modal state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txType, setTxType] = useState('income');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const cashStats = getTotalCashBalance();
  const members = data.members || [];
  const duesPeriods = data.cash.duesPeriods || [];
  const transactions = data.cash.transactions || [];

  const myPaidPeriods = duesPeriods.filter(p => (p.paidStudentIds || []).includes(currentUser.id));
  const myUnpaidPeriods = duesPeriods.filter(p => !(p.paidStudentIds || []).includes(currentUser.id));
  const myUnpaidAmount = myUnpaidPeriods.reduce((sum, p) => sum + (Number(p.amount) || Number(data.cash.duesAmount || 10000)), 0);
  const isAllPaid = myUnpaidPeriods.length === 0 && duesPeriods.length > 0;

  const studentsToDisplay = showOnlyMyDues
    ? members.filter(m => m.id === currentUser.id)
    : members;

  const handleToggleDues = (periodId, studentId) => {
    if (!isAdmin) return;
    toggleDuesPaid(periodId, studentId);
    showToast('Status pembayaran iuran diperbarui!', 'success');
  };

  const handleCreateTx = (e) => {
    e.preventDefault();
    addTransaction({
      type: txType,
      amount: Number(txAmount),
      category: txCategory.trim(),
      description: txDesc.trim(),
      date: txDate,
      recordedBy: currentUser.name
    });
    setIsAddTxOpen(false);
    setTxAmount('');
    setTxCategory('');
    setTxDesc('');
    showToast('Transaksi kas berhasil dicatat!', 'success');
  };

  return (
    <div>

      {/* 2. CASH SUMMARY STATS */}
      <div className="clean-cash-summary">
        <div>
          <span className="clean-cash-label">Total Saldo Kas</span>
          <h2 className="clean-cash-amount">Rp {Number(cashStats.balance).toLocaleString('id-ID')}</h2>
        </div>
        <div className="clean-cash-substats">
          <div className="clean-cash-stat">
            <span className="stat-label">Pemasukan</span>
            <span className="stat-val positive">+Rp {Number(cashStats.income).toLocaleString('id-ID')}</span>
          </div>
          <div className="clean-cash-stat">
            <span className="stat-label">Pengeluaran</span>
            <span className="stat-val negative">-Rp {Number(cashStats.expense).toLocaleString('id-ID')}</span>
          </div>
          <div className="clean-cash-stat">
            <span className="stat-label">Iuran Wajib</span>
            <span className="stat-val">Rp {Number(data.cash.duesAmount || 10000).toLocaleString('id-ID')}/pekan</span>
          </div>
          <div className="clean-cash-stat">
            <span className="stat-label">Tunggakan Saya</span>
            <span className={`stat-val ${myUnpaidAmount > 0 ? 'negative' : 'positive'}`}>
              {myUnpaidAmount > 0 ? `Rp ${Number(myUnpaidAmount).toLocaleString('id-ID')}` : 'Lunas ✓'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. SUB-TABS & ACTIONS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.65rem'
      }}>
        <div className="clean-filter-chips">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`clean-filter-chip ${activeTab === 'matrix' ? 'active' : ''}`}
          >
            <Table size={14} />
            <span>Matriks Iuran</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`clean-filter-chip ${activeTab === 'transactions' ? 'active' : ''}`}
          >
            <Receipt size={14} />
            <span>Buku Kas ({transactions.length})</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeTab === 'matrix' ? (
            <button
              onClick={() => setShowOnlyMyDues(!showOnlyMyDues)}
              className="btn btn-ghost btn-sm"
              style={{ gap: '0.35rem', fontSize: '0.78rem' }}
            >
              {showOnlyMyDues ? <Users size={14} /> : <User size={14} />}
              <span>{showOnlyMyDues ? 'Lihat Seluruh Siswa' : 'Hanya Saya'}</span>
            </button>
          ) : (
            isAdmin && (
              <button onClick={() => setIsAddTxOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={14} />
                <span>+ Catat Transaksi</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* 5. MATRIX TAB */}
      {activeTab === 'matrix' && (
        <div>

          <div className="notion-table-wrapper">
            <table className="notion-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>No</th>
                  <th>Nama Siswa</th>
                  {duesPeriods.map(p => (
                    <th key={p.id} style={{ textAlign: 'center', minWidth: '100px' }}>
                      <div>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                        Rp {Number(p.amount).toLocaleString('id-ID')}
                      </div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', width: '100px' }}>Total Lunas</th>
                </tr>
              </thead>
              <tbody>
                {studentsToDisplay.map((student, idx) => {
                  let paidCount = 0;
                  const isMe = student.id === currentUser.id;

                  return (
                    <tr key={student.id} style={{ backgroundColor: isMe ? 'var(--bg-hover)' : 'transparent' }}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        {student.absentNo || idx + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontWeight: isMe ? 700 : 'normal' }}>{student.name}</span>
                          {isMe && <span className="notion-tag notion-tag-green">Saya</span>}
                        </div>
                      </td>
                      {duesPeriods.map(p => {
                        const isPaid = (p.paidStudentIds || []).includes(student.id);
                        if (isPaid) paidCount++;

                        return (
                          <td key={p.id} style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleToggleDues(p.id, student.id)}
                              disabled={!isAdmin}
                              className={`notion-tag ${isPaid ? 'notion-tag-green' : 'notion-tag-red'}`}
                              style={{ border: 'none', cursor: isAdmin ? 'pointer' : 'default' }}
                              title={isAdmin ? 'Klik untuk toggle lunas/belum' : ''}
                            >
                              {isPaid ? '✓ Lunas' : '○ Belum'}
                            </button>
                          </td>
                        );
                      })}
                      <td style={{
                        textAlign: 'center',
                        fontWeight: 700,
                        color: paidCount === duesPeriods.length ? 'var(--success)' : 'var(--text-primary)'
                      }}>
                        {paidCount} / {duesPeriods.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div>
          <div className="notion-table-wrapper">
            <table className="notion-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Tanggal</th>
                  <th style={{ width: '110px' }}>Jenis</th>
                  <th style={{ width: '130px' }}>Kategori</th>
                  <th>Keterangan</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>Nominal</th>
                  <th style={{ width: '140px' }}>Pencatat</th>
                  {isAdmin && <th style={{ textAlign: 'center', width: '50px' }}>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Belum ada riwayat transaksi kas kelas.
                    </td>
                  </tr>
                ) : (
                  transactions.map(tx => {
                    const isIncome = tx.type === 'income';

                    return (
                      <tr key={tx.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {tx.date}
                        </td>
                        <td>
                          <span className={`notion-tag ${isIncome ? 'notion-tag-green' : 'notion-tag-red'}`}>
                            {isIncome ? '↓ Pemasukan' : '↑ Pengeluaran'}
                          </span>
                        </td>
                        <td>
                          <span className="notion-tag notion-tag-gray">{tx.category}</span>
                        </td>
                        <td style={{ color: 'var(--text-primary)', lineHeight: 1.45 }}>
                          {tx.description}
                        </td>
                        <td style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: isIncome ? 'var(--success)' : 'var(--danger)',
                          whiteSpace: 'nowrap'
                        }}>
                          {isIncome ? '+ ' : '- '}Rp {Number(tx.amount).toLocaleString('id-ID')}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {tx.recordedBy}
                        </td>
                        {isAdmin && (
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                if (confirm('Hapus transaksi ini?')) {
                                  deleteTransaction(tx.id);
                                  showToast('Transaksi dihapus', 'info');
                                }
                              }}
                              className="btn-ghost"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                              title="Hapus Transaksi"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD TRANSACTION */}
      <Modal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} title="Catat Transaksi Kas Baru">
        <form onSubmit={handleCreateTx}>
          <div className="form-group">
            <label className="form-label">Jenis Arus Kas</label>
            <select className="form-select" value={txType} onChange={(e) => setTxType(e.target.value)}>
              <option value="income">Pemasukan (+)</option>
              <option value="expense">Pengeluaran (-)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Nominal (Rp)</label>
            <input
              type="number"
              className="form-input"
              placeholder="Contoh: 50000"
              min="1000"
              step="500"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Alat Kebersihan / Fotokopi Materi"
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Keterangan Transaksi</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Detail rincian pembelian atau sumber dana..."
              value={txDesc}
              onChange={(e) => setTxDesc(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Transaksi</label>
            <input
              type="date"
              className="form-input"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setIsAddTxOpen(false)} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Transaksi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
