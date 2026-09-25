export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Mendapatkan key bulan (format: YYYY-MM) dari objek periode.
 * Jika belum ada field month, mengekstrak dari nama periode atau fallback ke 2026-09.
 */
export const getPeriodMonth = (period) => {
  if (period?.month) return period.month;
  
  const name = (period?.name || '').toLowerCase();
  if (name.includes('sep')) return '2026-09';
  if (name.includes('okt') || name.includes('oct')) return '2026-10';
  if (name.includes('nov')) return '2026-11';
  if (name.includes('des') || name.includes('dec')) return '2026-12';
  if (name.includes('jan')) return '2026-01';
  if (name.includes('feb')) return '2026-02';
  if (name.includes('mar')) return '2026-03';
  if (name.includes('apr')) return '2026-04';
  if (name.includes('mei') || name.includes('may')) return '2026-05';
  if (name.includes('jun')) return '2026-06';
  if (name.includes('jul')) return '2026-07';
  if (name.includes('agu') || name.includes('aug')) return '2026-08';

  return '2026-09';
};

/**
 * Format string YYYY-MM menjadi label bulan Indonesia (contoh: "September 2026")
 */
export const formatMonthLabel = (monthKey) => {
  if (!monthKey) return '';
  const parts = monthKey.split('-');
  if (parts.length < 2) return monthKey;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const monthName = MONTH_NAMES_ID[monthIdx] || parts[1];
  return `${monthName} ${year}`;
};

/**
 * Mendapatkan daftar bulan unik yang memiliki periode kas, diurutkan kronologis.
 */
export const getAvailableMonths = (duesPeriods = []) => {
  const monthSet = new Set();
  
  (duesPeriods || []).forEach(p => {
    monthSet.add(getPeriodMonth(p));
  });

  // Jika belum ada periode sama sekali, default ke bulan ini / September 2026
  if (monthSet.size === 0) {
    const now = new Date();
    const currKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(currKey);
  }

  return Array.from(monthSet).sort();
};

/**
 * Mendapatkan bulan saat ini dalam format YYYY-MM
 */
export const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
