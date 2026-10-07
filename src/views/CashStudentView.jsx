import React, { useMemo, useState, useEffect } from 'react';
import {
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  User,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getPeriodMonth, formatMonthLabel, getAvailableMonths, getCurrentMonthKey } from '../lib/duesUtils';
import MonthNavigator from '../components/MonthNavigator';

const MY_STUDENT_STORAGE_KEY = 'classhub_my_student_id_v1';

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
  }, [duesPeriods]);

  // View Mode: 'cards' (mobile friendly default) or 'table' (matrix with sticky frozen columns)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'

  // Card view pagination (10 per page)
  const CARDS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Personal student highlight (saved in localStorage)
  const [myStudentId, setMyStudentId] = useState(() => {
    try {
      return localStorage.getItem(MY_STUDENT_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const handleSelectMyStudent = (studentId) => {
    setMyStudentId(studentId);
    try {
      if (studentId) {
        localStorage.setItem(MY_STUDENT_STORAGE_KEY, studentId);
      } else {
        localStorage.removeItem(MY_STUDENT_STORAGE_KEY);
      }
    } catch { }
  };

  // Pastikan selectedMonth selalu valid jika daftar periode berubah
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  const monthlyPeriods = useMemo(() => {
    return duesPeriods.filter(p => getPeriodMonth(p) === selectedMonth);
  }, [duesPeriods, selectedMonth]);

  // Statistics for selected month
  const monthComplianceStats = useMemo(() => {
    if (monthlyPeriods.length === 0 || members.length === 0) {
      return { fullyPaidCount: 0, unpaidCount: 0, percent: 100 };
    }

    let fullyPaid = 0;
    members.forEach(m => {
      const isAllPaid = monthlyPeriods.every(p => (p.paidStudentIds || []).includes(m.id));
      if (isAllPaid) fullyPaid++;
    });

    const unpaid = members.length - fullyPaid;
    const percent = Math.round((fullyPaid / members.length) * 100);
    return { fullyPaidCount: fullyPaid, unpaidCount: unpaid, percent };
  }, [monthlyPeriods, members]);

  // Student specific data for personal banner
  const myStudentData = useMemo(() => {
    if (!myStudentId) return null;
    const student = members.find(m => m.id === myStudentId);
    if (!student) return null;

    const totalWeeks = monthlyPeriods.length;
    const paidWeeks = monthlyPeriods.filter(p => (p.paidStudentIds || []).includes(student.id)).length;
    const unpaidWeeks = totalWeeks - paidWeeks;
    const isAllPaid = totalWeeks > 0 && unpaidWeeks === 0;

    const unpaidAmount = monthlyPeriods
      .filter(p => !(p.paidStudentIds || []).includes(student.id))
      .reduce((sum, p) => sum + (Number(p.amount) || Number(data?.cash?.duesAmount || 5000)), 0);

    return {
      student,
      totalWeeks,
      paidWeeks,
      unpaidWeeks,
      isAllPaid,
      unpaidAmount
    };
  }, [myStudentId, members, monthlyPeriods, data?.cash?.duesAmount]);

  // Filtered members by search and status
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (m.name || '').toLowerCase().includes(q);
        const matchesAbsent = String(m.absentNo || '').includes(q);
        if (!matchesName && !matchesAbsent) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && monthlyPeriods.length > 0) {
        const isAllPaid = monthlyPeriods.every(p => (p.paidStudentIds || []).includes(m.id));
        if (statusFilter === 'paid' && !isAllPaid) return false;
        if (statusFilter === 'unpaid' && isAllPaid) return false;
      }

      return true;
    });
  }, [members, searchQuery, statusFilter, monthlyPeriods]);

  // Card pagination helpers
  const totalPages = Math.ceil(filteredMembers.length / CARDS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedMonth]);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    return filteredMembers.slice(start, start + CARDS_PER_PAGE);
  }, [filteredMembers, currentPage]);

  const formatTxDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${monthsMap[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="kas-container">
      {/* 1. PERSONAL-FIRST STATUS BANNER */}
      {myStudentData ? (
        <div className={`kas-personal-banner ${myStudentData.isAllPaid ? '' : 'is-highlighted'}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: myStudentData.isAllPaid ? 'var(--tag-green-bg)' : 'var(--primary-soft)',
                color: myStudentData.isAllPaid ? 'var(--tag-green-text)' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {myStudentData.isAllPaid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Kas Saya: {myStudentData.student.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Bulan {formatMonthLabel(selectedMonth)}: {myStudentData.paidWeeks} dari {myStudentData.totalWeeks} minggu lunas
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {myStudentData.isAllPaid ? (
                <span className="notion-tag notion-tag-green" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  Lunas Semua Minggu 🎉
                </span>
              ) : (
                <span className="notion-tag notion-tag-red" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  Kurang Rp {myStudentData.unpaidAmount.toLocaleString('id-ID')}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSelectMyStudent('')}
                className="btn btn-ghost btn-xs"
                style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
                title="Ganti atau batalkan penandaan nama saya"
              >
                Ganti Siswa
              </button>
            </div>
          </div>

          {/* Mini week status strip */}
          {monthlyPeriods.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {monthlyPeriods.map((p, idx) => {
                const isPaid = (p.paidStudentIds || []).includes(myStudentData.student.id);
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      backgroundColor: isPaid ? 'var(--tag-green-bg)' : 'var(--bg)',
                      color: isPaid ? 'var(--tag-green-text)' : 'var(--danger)',
                      border: `1px solid ${isPaid ? 'rgba(46, 124, 87, 0.25)' : 'var(--border)'}`
                    }}
                  >
                    <span>{p.name || `Mg ${idx + 1}`}</span>
                    {isPaid ? <Check size={12} strokeWidth={2.5} /> : <span style={{ opacity: 0.6 }}>-</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Prompt to select student name */
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <User size={15} color="var(--primary)" />
            <span>Pilih nama kamu untuk cek status kas.</span>
          </div>
          <select
            className="form-select"
            value=""
            onChange={(e) => handleSelectMyStudent(e.target.value)}
            style={{ width: 'auto', minWidth: '180px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
          >
            <option value="">Pilih Nama Siswa...</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. KPI SUMMARY METRIC CARDS */}
      <div className="kas-kpi-grid">
        <div className="kas-kpi-card">
          <span className="kas-kpi-label">Total Saldo Kas Kelas</span>
          <span className="kas-kpi-val" style={{ color: 'var(--primary)' }}>
            Rp {Number(cashStats.balance || 0).toLocaleString('id-ID')}
          </span>
        </div>

        <div className="kas-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kas-kpi-label">Kelunasan {formatMonthLabel(selectedMonth)}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: monthComplianceStats.percent === 100 ? 'var(--success)' : 'var(--text-secondary)' }}>
              {monthComplianceStats.percent}% Lunas
            </span>
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {monthComplianceStats.fullyPaidCount} dari {members.length} Siswa
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-full)', marginTop: '0.35rem', overflow: 'hidden' }}>
            <div
              style={{
                width: `${monthComplianceStats.percent}%`,
                height: '100%',
                backgroundColor: monthComplianceStats.percent === 100 ? 'var(--success)' : 'var(--primary)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION: DAFTAR PEMBAYARAN KAS */}
      <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
        {/* Header Bar: Month Navigator & View Switcher */}
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Pembayaran Kas {formatMonthLabel(selectedMonth)}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* View Switcher (Cards vs Matrix Table) */}
            <div className="kas-view-switch" role="group" aria-label="Mode Tampilan">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`kas-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                title="Tampilan Kartu (Optimal untuk HP)"
              >
                <LayoutGrid size={13} />
                <span>Kartu</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`kas-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Tampilan Tabel Matrix (Sticky Frozen Columns)"
              >
                <TableIcon size={13} />
                <span>Tabel</span>
              </button>
            </div>

            {/* Month Navigator */}
            <MonthNavigator
              availableMonths={availableMonths}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          </div>
        </div>

        {/* Toolbar: Live Search & Status Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginBottom: '1rem'
        }}>
          {/* Search box */}
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
              placeholder="Cari siswa atau no absen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '2.1rem',
                paddingRight: searchQuery ? '1.8rem' : '0.65rem',
                fontSize: '0.82rem',
                height: '34px',
                borderRadius: 'var(--radius-sm)'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Status Pills */}
          <div className="academic-filter-chips">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`academic-chip-btn ${statusFilter === 'all' ? 'active' : ''}`}
            >
              <span>Semua</span>
              <span style={{ opacity: 0.75 }}>({members.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unpaid')}
              className={`academic-chip-btn ${statusFilter === 'unpaid' ? 'active' : ''}`}
            >
              <AlertCircle size={12} color="var(--danger)" />
              <span>Belum Lunas</span>
              <span style={{ opacity: 0.75 }}>({monthComplianceStats.unpaidCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('paid')}
              className={`academic-chip-btn ${statusFilter === 'paid' ? 'active' : ''}`}
            >
              <Check size={12} color="var(--success)" />
              <span>Lunas</span>
              <span style={{ opacity: 0.75 }}>({monthComplianceStats.fullyPaidCount})</span>
            </button>
          </div>
        </div>

        {/* 4. VIEW CONTENT: CARDS vs STICKY MATRIX TABLE */}
        {monthlyPeriods.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <Sparkles size={24} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Belum ada periode iuran kas di bulan {formatMonthLabel(selectedMonth)}.</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Tidak ada siswa yang sesuai filter atau pencarian "{searchQuery}".</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <RotateCcw size={12} />
              <span>Reset Filter</span>
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* =================================================================
             MODE KARTU SISWA (100% RESPONSIVE FOR MOBILE PHONES - 10 PER HALAMAN)
             ================================================================= */
          <div>
            <div className="kas-cards-grid">
              {paginatedMembers.map(m => {
                const paidCount = monthlyPeriods.filter(p => (p.paidStudentIds || []).includes(m.id)).length;
                const isAllPaid = paidCount === monthlyPeriods.length;
                const isMe = m.id === myStudentId;

                return (
                  <div
                    key={m.id}
                    className={`kas-student-card ${isMe ? 'is-me' : ''}`}
                  >
                    <div className="kas-student-card-header">
                      <div className="kas-student-card-info">
                        <div className="kas-absent-badge">
                          #{m.absentNo}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="kas-student-card-name" title={m.name}>
                            {m.name}
                          </div>
                          {isMe && (
                            <span className="notion-tag notion-tag-orange" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem', fontWeight: 700 }}>
                              Kamu
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        {isAllPaid ? (
                          <span className="notion-tag notion-tag-green" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                            Lunas ({paidCount}/{monthlyPeriods.length})
                          </span>
                        ) : (
                          <span className="notion-tag notion-tag-orange" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                            {paidCount}/{monthlyPeriods.length} Minggu
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Week Chips Strip */}
                    <div className="kas-weeks-strip">
                      {monthlyPeriods.map((p, pIdx) => {
                        const isPaid = (p.paidStudentIds || []).includes(m.id);
                        return (
                          <div
                            key={p.id}
                            className={`kas-week-chip ${isPaid ? 'paid' : 'unpaid'}`}
                          >
                            <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>
                              {p.name || `Mg ${pIdx + 1}`}
                            </span>
                            <span style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              {isPaid ? <Check size={12} strokeWidth={2.5} /> : <span style={{ opacity: 0.5 }}>-</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {filteredMembers.length > CARDS_PER_PAGE && (
              <div className="kas-pagination">
                <div className="kas-pagination-info">
                  Menampilkan {((currentPage - 1) * CARDS_PER_PAGE) + 1}–{Math.min(currentPage * CARDS_PER_PAGE, filteredMembers.length)} dari {filteredMembers.length} siswa
                </div>
                <div className="kas-pagination-controls">
                  <button
                    type="button"
                    className="kas-page-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    title="Halaman sebelumnya"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`kas-page-btn ${pageNum === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="kas-page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    title="Halaman berikutnya"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =================================================================
             MODE TABEL MATRIX (WITH FROZEN STICKY NAME & ABSENT COLUMNS)
             ================================================================= */
          <div>

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
                  width: `${Math.max(480, 46 + 145 + monthlyPeriods.length * 85)}px`,
                  minWidth: '100%',
                  tableLayout: 'fixed',
                  borderCollapse: 'separate',
                  borderSpacing: 0
                }}
              >
                <thead>
                  <tr>
                    {/* Sticky Column 1: No Absen */}
                    <th className="sticky-kas-no">#</th>

                    {/* Sticky Column 2: Nama Siswa */}
                    <th className="sticky-kas-name" style={{ textAlign: 'left', padding: '0.85rem 0.95rem' }}>
                      Nama Siswa
                    </th>

                    {/* Week Columns */}
                    {monthlyPeriods.map((p, idx) => (
                      <th
                        key={p.id}
                        style={{
                          width: '85px',
                          minWidth: '85px',
                          maxWidth: '85px',
                          textAlign: 'center',
                          padding: '0.85rem 0.5rem',
                          position: 'sticky',
                          top: 0,
                          zIndex: 25,
                          backgroundColor: 'var(--bg)'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name || `Mg ${idx + 1}`}
                        </div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)', marginTop: '0.15rem', whiteSpace: 'nowrap' }}>
                          Rp {Number(p.amount || 0).toLocaleString('id-ID')}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredMembers.map((m, idx) => {
                    const isOdd = idx % 2 === 1;
                    const isMe = m.id === myStudentId;

                    return (
                      <tr
                        key={m.id}
                        className={`${isOdd ? 'zebra-kas-row-odd' : 'zebra-kas-row-even'} ${isMe ? 'is-me-row' : ''}`}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)'
                        }}
                      >
                        {/* Sticky Column 1: No Absen */}
                        <td className="sticky-kas-no" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
                          {m.absentNo}
                        </td>

                        {/* Sticky Column 2: Nama Siswa */}
                        <td className="sticky-kas-name" style={{ padding: '0.85rem 0.95rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', width: '100%' }}>
                            <span
                              className="kas-student-name"
                              title={m.name}
                              style={{
                                fontWeight: isMe ? 700 : 600,
                                color: isMe ? 'var(--primary)' : 'var(--text-primary)',
                                fontSize: '0.86rem'
                              }}
                            >
                              {m.name}
                            </span>
                            {isMe && (
                              <span className="notion-tag notion-tag-orange" style={{ fontSize: '0.6rem', padding: '0.02rem 0.25rem', flexShrink: 0 }}>
                                Kamu
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Week Status Cells */}
                        {monthlyPeriods.map(p => {
                          const isPaid = (p.paidStudentIds || []).includes(m.id);
                          return (
                            <td
                              key={p.id}
                              style={{
                                width: '85px',
                                minWidth: '85px',
                                maxWidth: '85px',
                                textAlign: 'center',
                                padding: '0.75rem 0.4rem'
                              }}
                            >
                              {isPaid ? (
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
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
                                  <Check size={14} strokeWidth={2.5} />
                                </div>
                              ) : (
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
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
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. RIWAYAT KAS (TRANSAKSI KELUAR & MASUK) */}
      <div className="card" style={{ padding: '1.25rem 1.4rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.85rem 0', color: 'var(--text-primary)' }}>
          Riwayat Kas
        </h3>

        {transactions.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            Belum ada riwayat transaksi kas kelas.
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
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {tx.description}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {formatTxDate(tx.date)}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontWeight: 700,
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
