import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Check,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';
import MonthNavigator from '../../../components/MonthNavigator';
import {
  SearchInput,
  FilterPills,
  EmptyState,
  ActionMenu,
  ConfirmDialog
} from '../../../components/admin';
import {
  getPeriodMonth,
  formatMonthLabel,
  getAvailableMonths,
  getCurrentMonthKey
} from '../../../lib/duesUtils';
import { formatDateIndo } from '../../../lib/dateUtils';

export default function CashTab() {
  const {
    data,
    addTransaction,
    deleteTransaction,
    toggleDuesPaid,
    markAllDuesPaid,
    addDuesPeriod,
    deleteDuesPeriod,
    getTotalCashBalance
  } = useStore();
  const { showToast } = useToast();

  const members = data?.members || [];
  const totalMembers = members.length;
  const duesPeriods = data?.cash?.duesPeriods || [];
  const transactions = data?.cash?.transactions || [];

  const income = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const expense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const cashStats = useMemo(() => {
    const fromFn = typeof getTotalCashBalance === 'function' ? getTotalCashBalance() : null;
    return {
      balance: fromFn?.balance !== undefined ? fromFn.balance : (data?.cash?.balance ?? 0),
      income: fromFn?.income !== undefined ? fromFn.income : income,
      expense: fromFn?.expense !== undefined ? fromFn.expense : expense
    };
  }, [getTotalCashBalance, data?.cash?.balance, income, expense]);

  // Month navigation
  const [selectedDuesMonth, setSelectedDuesMonth] = useState(() => getCurrentMonthKey());
  const availableDuesMonths = useMemo(() => {
    return getAvailableMonths(duesPeriods);
  }, [duesPeriods]);

  useEffect(() => {
    if (availableDuesMonths.length > 0 && !availableDuesMonths.includes(selectedDuesMonth)) {
      setSelectedDuesMonth(availableDuesMonths[availableDuesMonths.length - 1]);
    }
  }, [availableDuesMonths, selectedDuesMonth]);

  const monthlyDuesPeriods = useMemo(() => {
    return duesPeriods.filter(p => getPeriodMonth(p) === selectedDuesMonth);
  }, [duesPeriods, selectedDuesMonth]);

  // Search & Filter
  const [duesSearchQuery, setDuesSearchQuery] = useState('');
  const [duesStatusFilter, setDuesStatusFilter] = useState('all');

  const filteredDuesMembers = useMemo(() => {
    return members.filter(m => {
      const q = duesSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        String(m.absentNo || '').includes(q);

      if (!matchesSearch) return false;

      if (duesStatusFilter === 'all' || monthlyDuesPeriods.length === 0) {
        return true;
      }

      const isPaidAllPeriods = monthlyDuesPeriods.length > 0 &&
        monthlyDuesPeriods.every(p => (p.paidStudentIds || []).includes(m.id));

      if (duesStatusFilter === 'paid') {
        return isPaidAllPeriods;
      } else if (duesStatusFilter === 'unpaid') {
        return !isPaidAllPeriods;
      }

      return true;
    });
  }, [members, duesSearchQuery, duesStatusFilter, monthlyDuesPeriods]);

  const selectedMonthPaidAllCount = useMemo(() => {
    if (monthlyDuesPeriods.length === 0 || totalMembers === 0) return 0;
    return members.filter(m => monthlyDuesPeriods.every(p => (p.paidStudentIds || []).includes(m.id))).length;
  }, [members, monthlyDuesPeriods, totalMembers]);

  const selectedMonthUnpaidCount = totalMembers - selectedMonthPaidAllCount;

  // Modals & Dialogs state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);
  const [periodToMarkAllPaid, setPeriodToMarkAllPaid] = useState(null);
  const [periodToDelete, setPeriodToDelete] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);

  // Form state - Add Transaction
  const [txType, setTxType] = useState('income');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Form state - Add Period
  const [periodMonth, setPeriodMonth] = useState(() => getCurrentMonthKey());
  const [periodName, setPeriodName] = useState('Minggu 1');
  const [periodAmount, setPeriodAmount] = useState(5000);

  const handleCreateTx = (e) => {
    e.preventDefault();
    addTransaction({
      type: txType,
      amount: Number(txAmount),
      category: txCategory.trim(),
      description: txDesc.trim(),
      date: txDate,
      recordedBy: 'Administrator Kelas'
    });
    setIsAddTxOpen(false);
    setTxAmount('');
    setTxCategory('');
    setTxDesc('');
    showToast('Transaksi kas berhasil dicatat!', 'success');
  };

  const handleCreatePeriod = (e) => {
    e.preventDefault();
    const finalMonth = periodMonth || selectedDuesMonth || getCurrentMonthKey();
    addDuesPeriod(periodName.trim(), Number(periodAmount), finalMonth);
    setSelectedDuesMonth(finalMonth);
    setIsAddPeriodOpen(false);
    setPeriodName('Minggu 1');
    showToast(`Periode ${periodName} (${formatMonthLabel(finalMonth)}) berhasil dibuat!`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Cash Balance Info */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Saldo Kas</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.15rem 0', letterSpacing: '-0.02em' }}>
            Rp {Number(cashStats.balance).toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Pemasukan <strong style={{ color: 'var(--tag-green-text)' }}>+Rp {Number(cashStats.income).toLocaleString('id-ID')}</strong> &nbsp;·&nbsp; Pengeluaran <strong style={{ color: 'var(--danger)' }}>-Rp {Number(cashStats.expense).toLocaleString('id-ID')}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setPeriodMonth(selectedDuesMonth || getCurrentMonthKey());
              setIsAddPeriodOpen(true);
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem', whiteSpace: 'nowrap' }}
          >
            <Plus size={14} />
            <span>Periode Iuran</span>
          </button>
          <button onClick={() => setIsAddTxOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '0.35rem', whiteSpace: 'nowrap' }}>
            <Plus size={14} />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Dues Matrix Table */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Matriks Iuran Kas
            </h3>
            {/* Mini Recap */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'var(--bg-hover)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontWeight: 600, color: 'var(--tag-green-text)' }}>
                {selectedMonthPaidAllCount} Lunas
              </span>
              <span>·</span>
              <span style={{ fontWeight: 600, color: selectedMonthUnpaidCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {selectedMonthUnpaidCount} Belum Lunas
              </span>
            </div>
          </div>

          {/* Month Navigator */}
          <MonthNavigator
            availableMonths={availableDuesMonths}
            selectedMonth={selectedDuesMonth}
            onMonthChange={setSelectedDuesMonth}
          />
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <SearchInput
            value={duesSearchQuery}
            onChange={(e) => setDuesSearchQuery(e.target.value)}
            onClear={() => setDuesSearchQuery('')}
            placeholder="Cari siswa di matriks..."
            style={{ maxWidth: '280px', height: '36px' }}
          />
          <FilterPills
            options={[
              { value: 'all', label: 'Semua' },
              { value: 'unpaid', label: 'Belum Lunas' },
              { value: 'paid', label: 'Sudah Lunas' }
            ]}
            activeValue={duesStatusFilter}
            onChange={setDuesStatusFilter}
          />
        </div>

        {/* Matrix Table with Zebra Striping & Sticky Weeks Header */}
        <div style={{
          overflowX: 'auto',
          overflowY: 'auto',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          maxHeight: 'min(560px, 70vh)',
          position: 'relative',
          WebkitOverflowScrolling: 'touch'
        }}>
          <table
            className="notion-table zebra-kas-table"
            style={{
              width: `${Math.max(700, 56 + 190 + monthlyDuesPeriods.length * 130)}px`,
              minWidth: '100%',
              tableLayout: 'fixed',
              borderCollapse: 'separate',
              borderSpacing: 0
            }}
          >
            <thead style={{ position: 'sticky', top: 0, zIndex: 25 }}>
              <tr style={{ backgroundColor: 'var(--bg-surface)' }}>
                <th style={{ width: '56px', minWidth: '56px', maxWidth: '56px', textAlign: 'center', padding: '0.85rem 0.65rem', position: 'sticky', top: 0, zIndex: 25, backgroundColor: 'var(--bg-surface)' }}>#</th>
                <th style={{ width: '190px', minWidth: '190px', maxWidth: '190px', textAlign: 'left', padding: '0.85rem 1rem', position: 'sticky', top: 0, zIndex: 25, backgroundColor: 'var(--bg-surface)' }}>Nama Siswa</th>
                {monthlyDuesPeriods.map(p => {
                  const periodPaidCount = (p.paidStudentIds || []).length;
                  const isAllPaid = totalMembers > 0 && periodPaidCount === totalMembers;

                  return (
                    <th key={p.id} style={{ width: '130px', minWidth: '130px', maxWidth: '130px', textAlign: 'center', padding: '0.85rem 0.75rem', position: 'sticky', top: 0, zIndex: 25, backgroundColor: 'var(--bg-surface)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                        <button
                          type="button"
                          onClick={() => setPeriodToDelete(p)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '2px',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            opacity: 0.5
                          }}
                          title={`Hapus periode ${p.name}`}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--danger)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0.3rem 0', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Rp {Number(p.amount || 0).toLocaleString('id-ID')}
                      </div>
                      <button
                        type="button"
                        disabled={isAllPaid}
                        onClick={() => setPeriodToMarkAllPaid(p)}
                        style={{
                          background: isAllPaid ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg-hover)',
                          border: `1px solid ${isAllPaid ? 'rgba(22, 163, 74, 0.2)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-xs)',
                          padding: '0.18rem 0.45rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: isAllPaid ? '#16A34A' : 'var(--text-secondary)',
                          cursor: isAllPaid ? 'default' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          whiteSpace: 'nowrap'
                        }}
                        title={isAllPaid ? 'Seluruh siswa telah lunas' : `Tandai seluruh siswa lunas pada ${p.name}`}
                      >
                        <CheckCircle2 size={11} />
                        <span>{isAllPaid ? 'Lunas Semua' : 'Tandai Semua'}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {monthlyDuesPeriods.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <EmptyState
                      title="Belum Ada Periode Kas"
                    />
                  </td>
                </tr>
              ) : filteredDuesMembers.length === 0 ? (
                <tr>
                  <td colSpan={2 + monthlyDuesPeriods.length} style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <EmptyState
                      title="Siswa Tidak Ditemukan"
                    />
                  </td>
                </tr>
              ) : (
                filteredDuesMembers.map((m, idx) => {
                  const isOdd = idx % 2 === 1;
                  return (
                    <tr
                      key={m.id}
                      className={isOdd ? 'zebra-kas-row-odd' : 'zebra-kas-row-even'}
                      style={{
                        backgroundColor: isOdd ? 'var(--zebra-kas-odd)' : 'var(--zebra-kas-even)',
                        borderBottom: '1px solid var(--border-subtle)'
                      }}
                    >
                      <td style={{ width: '56px', minWidth: '56px', maxWidth: '56px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem', textAlign: 'center', padding: '0.85rem 0.65rem' }}>
                        {String(m.absentNo || 0).padStart(2, '0')}
                      </td>
                      <td style={{ width: '190px', minWidth: '190px', maxWidth: '190px', padding: '0.85rem 1rem' }}>
                        <strong
                          className="kas-student-name"
                          title={m.name}
                          style={{
                            display: 'block',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'var(--text-primary)',
                            fontSize: '0.88rem',
                            fontWeight: 600
                          }}
                        >
                          {m.name}
                        </strong>
                      </td>
                      {monthlyDuesPeriods.map(p => {
                        const isPaid = (p.paidStudentIds || []).includes(m.id);
                        return (
                          <td key={p.id} style={{ width: '130px', minWidth: '130px', maxWidth: '130px', textAlign: 'center', padding: '0.85rem 0.75rem' }}>
                            <button
                              type="button"
                              onClick={() => {
                                toggleDuesPaid(p.id, m.id);
                                showToast(`${m.name} di ${p.name} diperbarui!`, 'success');
                              }}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '4px',
                                border: isPaid ? '1px solid var(--tag-green-text)' : '1px solid var(--border)',
                                backgroundColor: isPaid ? 'var(--tag-green-bg)' : 'transparent',
                                color: isPaid ? 'var(--tag-green-text)' : 'transparent',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              title={`Klik untuk ganti status ${m.name} (${isPaid ? 'Lunas' : 'Belum'})`}
                            >
                              <Check size={14} strokeWidth={2.2} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.85rem 0', color: 'var(--text-primary)' }}>
          Buku Kas & Riwayat Transaksi
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {transactions.length === 0 ? (
            <EmptyState
              title="Belum Ada Transaksi"
            />
          ) : (
            transactions.map(tx => (
              <div key={tx.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                gap: '0.75rem'
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {tx.description}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {formatDateIndo(tx.date)} &nbsp;·&nbsp; {tx.category} &nbsp;·&nbsp; {tx.recordedBy}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: tx.type === 'income' ? 'var(--tag-green-text)' : 'var(--danger)' }}>
                    {tx.type === 'income' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                  </span>
                  <ActionMenu
                    align="right"
                    items={[
                      {
                        label: 'Hapus Transaksi',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        onClick: () => setTxToDelete(tx)
                      }
                    ]}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: CATAT TRANSAKSI KAS */}
      <Modal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} title="Catat Transaksi Kas">
        <form onSubmit={handleCreateTx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Jenis Transaksi</label>
            <select
              className="form-select"
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
            >
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
              placeholder="Contoh: Iuran Kas, Kebersihan, Fotokopi"
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Keterangan / Rincian</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Beli 2 spidol whiteboard & penghapus"
              value={txDesc}
              onChange={(e) => setTxDesc(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Simpan Transaksi
          </button>
        </form>
      </Modal>

      {/* MODAL: TAMBAH PERIODE IURAN */}
      <Modal isOpen={isAddPeriodOpen} onClose={() => setIsAddPeriodOpen(false)} title="Tambah Periode Iuran">
        <form onSubmit={handleCreatePeriod} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group">
            <label className="form-label">Bulan Periode</label>
            <input
              type="month"
              className="form-input"
              value={periodMonth}
              onChange={(e) => setPeriodMonth(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Bulan terpilih: <strong>{formatMonthLabel(periodMonth)}</strong>
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Periode</label>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              {['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5'].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPeriodName(preset)}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.72rem',
                    borderRadius: 'var(--radius-sm)',
                    border: periodName === preset ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                    backgroundColor: periodName === preset ? 'var(--text-primary)' : 'var(--bg)',
                    color: periodName === preset ? 'var(--bg)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Minggu 1"
              value={periodName}
              onChange={(e) => setPeriodName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nominal Iuran (Rp)</label>
            <input
              type="number"
              className="form-input"
              value={periodAmount}
              onChange={(e) => setPeriodAmount(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Buat Periode Baru
          </button>
        </form>
      </Modal>

      {/* CONFIRM DIALOG: TANDAI SEMUA LUNAS */}
      <ConfirmDialog
        isOpen={Boolean(periodToMarkAllPaid)}
        onClose={() => setPeriodToMarkAllPaid(null)}
        onConfirm={() => {
          if (periodToMarkAllPaid) {
            markAllDuesPaid(periodToMarkAllPaid.id);
            showToast(`Seluruh siswa berhasil ditandai lunas pada ${periodToMarkAllPaid.name}.`, 'success');
            setPeriodToMarkAllPaid(null);
          }
        }}
        title="Tandai Semua Lunas"
        message={`Apakah Anda yakin ingin menandai seluruh ${members.length} siswa lunas untuk periode "${periodToMarkAllPaid?.name}"?`}
        confirmLabel="Tandai Lunas Semua"
        variant="warning"
      />

      {/* CONFIRM DIALOG: HAPUS PERIODE IURAN */}
      <ConfirmDialog
        isOpen={Boolean(periodToDelete)}
        onClose={() => setPeriodToDelete(null)}
        onConfirm={() => {
          if (periodToDelete) {
            deleteDuesPeriod(periodToDelete.id);
            showToast(`Periode "${periodToDelete.name}" telah dihapus.`, 'info');
            setPeriodToDelete(null);
          }
        }}
        title="Hapus Periode Iuran"
        message={`Apakah Anda yakin ingin menghapus periode "${periodToDelete?.name}"? Riwayat centang iuran pada periode ini akan ikut terhapus.`}
        confirmLabel="Hapus Periode"
        variant="danger"
      />

      {/* CONFIRM DIALOG: HAPUS TRANSAKSI KAS */}
      <ConfirmDialog
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete.id);
            showToast(`Transaksi "${txToDelete.description}" telah dihapus.`, 'info');
            setTxToDelete(null);
          }
        }}
        title="Hapus Catatan Transaksi"
        message={`Apakah Anda yakin ingin menghapus catatan transaksi "${txToDelete?.description}" senilai Rp ${Number(txToDelete?.amount || 0).toLocaleString('id-ID')}?`}
        confirmLabel="Hapus Transaksi"
        variant="danger"
      />
    </div>
  );
}
