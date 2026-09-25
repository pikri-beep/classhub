import React, { useMemo, useState, useEffect } from 'react';
import { Check, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

  // Pastikan selectedMonth selalu valid jika daftar periode berubah
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  const monthlyPeriods = useMemo(() => {
    return duesPeriods.filter(p => getPeriodMonth(p) === selectedMonth);
  }, [duesPeriods, selectedMonth]);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. TABEL PEMBAYARAN KAS */}
      <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.65rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Daftar Pembayaran Kas
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Saldo: <strong style={{ color: 'var(--text-primary)' }}>Rp {Number(cashStats.balance || 0).toLocaleString('id-ID')}</strong>
            </span>
          </div>

          {/* Month Navigator Ringkas */}
          <MonthNavigator
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', WebkitOverflowScrolling: 'touch' }}>
          <table className="notion-table" style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ textAlign: 'left' }}>Nama Siswa</th>
                {monthlyPeriods.map(p => (
                  <th key={p.id} style={{ textAlign: 'center', minWidth: '95px' }}>
                    <div>{p.name}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                      Rp {Number(p.amount || 0).toLocaleString('id-ID')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyPeriods.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Belum ada data iuran di bulan {formatMonthLabel(selectedMonth)}.
                  </td>
                </tr>
              ) : (
                members.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                      {m.absentNo}
                    </td>
                    <td>
                      <strong>{m.name}</strong>
                    </td>
                    {monthlyPeriods.map(p => {
                      const isPaid = (p.paidStudentIds || []).includes(m.id);
                      return (
                        <td key={p.id} style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '4px',
                              border: isPaid ? '1px solid var(--tag-green-text)' : '1px solid var(--border)',
                              backgroundColor: isPaid ? 'var(--tag-green-bg)' : 'transparent',
                              color: isPaid ? 'var(--tag-green-text)' : 'transparent',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto'
                            }}
                          >
                            {isPaid && <Check size={14} strokeWidth={3} />}
                          </div>
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
        <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.85rem 0', color: 'var(--text-primary)' }}>
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
                    padding: '0.6rem 0.85rem',
                    backgroundColor: 'var(--bg)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isIncome ? 'var(--tag-green-bg)' : 'var(--tag-red-bg)',
                      color: isIncome ? 'var(--tag-green-text)' : 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {tx.description}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {tx.date}
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
