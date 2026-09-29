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
    <div style={{ maxWidth: '940px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. TABEL PEMBAYARAN KAS */}
      <div className="card" style={{ padding: '1.5rem 1.6rem' }}>
        {/* Header Bar: Judul, Saldo Badge, MonthNavigator */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.85rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Daftar Pembayaran Kas
            </h3>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
              Total Saldo Kas: <span style={{ fontWeight: 800, color: 'var(--text-primary)', marginLeft: '0.2rem' }}>Rp {Number(cashStats.balance || 0).toLocaleString('id-ID')}</span>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={15} style={{
              position: 'absolute',
              left: '0.85rem',
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
                paddingLeft: '2.3rem',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                fontSize: '0.85rem',
                height: '38px',
                borderRadius: 'var(--radius-sm)'
              }}
            />
          </div>
        </div>

        {/* Matrix Table with Ultra-Soft Zebra, Sticky Weeks Header & Fixed Columns */}
        <div style={{ 
          overflowX: 'auto', 
          overflowY: 'auto', 
          maxHeight: 'min(560px, 70vh)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-sm)', 
          position: 'relative',
          WebkitOverflowScrolling: 'touch' 
        }}>
          <table 
            className="notion-table zebra-kas-table" 
            style={{ 
              width: `${Math.max(640, 56 + 180 + monthlyPeriods.length * 120)}px`, 
              minWidth: '100%', 
              tableLayout: 'fixed', 
              borderCollapse: 'separate', 
              borderSpacing: 0 
            }}
          >
            <thead style={{ position: 'sticky', top: 0, zIndex: 25 }}>
              <tr style={{ backgroundColor: 'var(--bg)' }}>
                <th style={{ width: '56px', minWidth: '56px', maxWidth: '56px', textAlign: 'center', padding: '1rem 0.65rem', position: 'sticky', top: 0, zIndex: 25, backgroundColor: 'var(--bg)' }}>#</th>
                <th style={{ width: '180px', minWidth: '180px', maxWidth: '180px', textAlign: 'left', padding: '1rem 1.15rem', position: 'sticky', top: 0, zIndex: 25, backgroundColor: 'var(--bg)' }}>Nama Siswa</th>
                {monthlyPeriods.map(p => (
                  <th key={p.id} style={{ width: '120px', minWidth: '120px', maxWidth: '120px', textAlign: 'center', padding: '1rem 0.85rem', position: 'sticky', top: 0, zIndex: 25, backgroundColor: 'var(--bg)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap' }}>
                      Rp {Number(p.amount || 0).toLocaleString('id-ID')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyPeriods.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Belum ada data iuran di bulan {formatMonthLabel(selectedMonth)}.
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={2 + monthlyPeriods.length} style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Tidak ada siswa dengan nama "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, idx) => {
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
                    <td style={{ width: '56px', minWidth: '56px', maxWidth: '56px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.84rem', padding: '0.95rem 0.65rem', fontWeight: 600 }}>
                      {m.absentNo}
                    </td>
                    <td style={{ width: '180px', minWidth: '180px', maxWidth: '180px', padding: '0.95rem 1.15rem' }}>
                      <span
                        className="kas-student-name"
                        title={m.name}
                        style={{
                          display: 'block',
                          width: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {m.name}
                      </span>
                    </td>
                    {monthlyPeriods.map(p => {
                      const isPaid = (p.paidStudentIds || []).includes(m.id);
                      return (
                        <td key={p.id} style={{ width: '120px', minWidth: '120px', maxWidth: '120px', textAlign: 'center', padding: '0.95rem 0.85rem' }}>
                          {isPaid ? (
                            <div
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '5px',
                                border: '1px solid var(--tag-green-text)',
                                backgroundColor: 'var(--tag-green-bg)',
                                color: 'var(--tag-green-text)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto'
                              }}
                              title="Lunas"
                            >
                              <Check size={15} strokeWidth={2.2} />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '5px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'transparent',
                                margin: '0 auto'
                              }}
                              title="Belum Bayar"
                            />
                          )}
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

      {/* 2. RIWAYAT KAS */}
      <div className="card" style={{ padding: '1.5rem 1.6rem' }}>
        <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
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
