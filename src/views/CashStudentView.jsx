import React, { useMemo, useState, useEffect } from 'react';
import { Check, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getPeriodMonth, formatMonthLabel, getAvailableMonths, getCurrentMonthKey } from '../lib/duesUtils';
import MonthNavigator from '../components/MonthNavigator';

export default function CashStudentView() {
  const { data, getTotalCashBalance } = useStore();

  const members = useMemo(() => {
    return [...(data?.members || [])].sort((a, b) => (a.absentNo || 0) - (b.absentNo || 0));
  }, [data?.members]);

  const duesPeriods = data?.cash?.duesPeriods || [];
  const transactions = data?.cash?.transactions || [];
  const cashStats = getTotalCashBalance ? getTotalCashBalance() : {
    balance: data?.cash?.balance || 0,
    income: 0,
    expense: 0
  };

  const availableMonths = useMemo(() => {
    return getAvailableMonths(duesPeriods);
  }, [duesPeriods]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = getAvailableMonths(duesPeriods);
    return months[months.length - 1] || getCurrentMonthKey();
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Pastikan selectedMonth selalu valid jika daftar periode berubah
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  const monthlyPeriods = useMemo(() => {
    return duesPeriods.filter(p => getPeriodMonth(p) === selectedMonth);
  }, [duesPeriods, selectedMonth]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase().trim();
    return members.filter(m => (m.name || '').toLowerCase().includes(q));
  }, [members, searchQuery]);

  const formatTxDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${monthsMap[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. TABEL PEMBAYARAN KAS */}
      <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
        {/* Header Bar: Judul, Saldo Badge, MonthNavigator */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Daftar Pembayaran Kas
            </h3>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 500 }}>
              Total Saldo Kas: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Rp {Number(cashStats.balance || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Month Navigator */}
          <MonthNavigator
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* Toolbar: Search input */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '0.85rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={14} style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '2.1rem',
                paddingTop: '0.35rem',
                paddingBottom: '0.35rem',
                fontSize: '0.8125rem',
                height: '34px',
                borderRadius: 'var(--radius-sm)'
              }}
            />
          </div>
        </div>

        {/* Matrix Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', WebkitOverflowScrolling: 'touch' }}>
          <table className="notion-table" style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ width: '48px', textAlign: 'center', padding: '0.65rem 0.5rem' }}>#</th>
                <th style={{ textAlign: 'left', padding: '0.65rem 0.95rem' }}>Nama Siswa</th>
                {monthlyPeriods.map(p => (
                  <th key={p.id} style={{ textAlign: 'center', minWidth: '100px', padding: '0.65rem 0.65rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Rp {Number(p.amount || 0).toLocaleString('id-ID')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyPeriods.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Belum ada data iuran di bulan {formatMonthLabel(selectedMonth)}.
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={2 + monthlyPeriods.length} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Tidak ada siswa dengan nama "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.82rem', padding: '0.75rem 0.5rem' }}>
                      {m.absentNo}
                    </td>
                    <td style={{ padding: '0.75rem 0.95rem', fontSize: '0.88rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                    </td>
                    {monthlyPeriods.map(p => {
                      const isPaid = (p.paidStudentIds || []).includes(m.id);
                      return (
                        <td key={p.id} style={{ textAlign: 'center', padding: '0.75rem 0.65rem' }}>
                          {isPaid ? (
                            <div
                              style={{
                                width: '25px',
                                height: '25px',
                                borderRadius: '5px',
                                border: '1.5px solid var(--tag-green-text)',
                                backgroundColor: 'var(--tag-green-bg)',
                                color: 'var(--tag-green-text)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto'
                              }}
                              title="Lunas"
                            >
                              <Check size={15} strokeWidth={3} />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: '25px',
                                height: '25px',
                                borderRadius: '5px',
                                border: '1.5px solid var(--border)',
                                backgroundColor: 'var(--bg)',
                                margin: '0 auto'
                              }}
                              title="Belum Bayar"
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. RIWAYAT KAS */}
      <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
        <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 0.85rem 0', color: 'var(--text-primary)' }}>
          Riwayat Kas
        </h3>

        {transactions.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Belum ada riwayat transaksi.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {transactions.map(tx => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--bg)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    gap: '0.75rem',
                    transition: 'border-color var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isIncome ? 'var(--tag-green-bg)' : 'var(--tag-red-bg)',
                      color: isIncome ? 'var(--tag-green-text)' : 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isIncome ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {tx.description}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {formatTxDate(tx.date)}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    color: isIncome ? 'var(--tag-green-text)' : 'var(--danger)',
                    whiteSpace: 'nowrap'
                  }}>
                    {isIncome ? '+' : '-'}Rp {Number(tx.amount || 0).toLocaleString('id-ID')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
