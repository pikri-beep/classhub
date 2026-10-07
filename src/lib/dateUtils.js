/**
 * Normalizes and formats date strings into human-friendly Indonesian format.
 * Examples:
 * - formatDateIndo('2026-10-05') -> 'Senin, 5 Okt 2026'
 * - formatDateIndo('2026-10-05', { withDay: true, monthFormat: 'long' }) -> 'Senin, 5 Oktober 2026'
 * - formatDateIndo('2026-10-05', { withDay: false, monthFormat: 'short' }) -> '5 Okt 2026'
 */
export const formatDateIndo = (dateStr, options = {}) => {
  if (!dateStr) return '-';
  const {
    withDay = true,
    monthFormat = 'short' // 'short' (Okt) | 'long' (Oktober)
  } = options;

  let d;
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    // Parse YYYY-MM-DD safely without timezone shifts
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(dateStr);
    }
  } else {
    d = new Date(dateStr);
  }

  if (isNaN(d.getTime())) return typeof dateStr === 'string' ? dateStr : '-';

  const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthsLong = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const dayName = daysMap[d.getDay()];
  const dateNum = d.getDate();
  const monthName = monthFormat === 'long' ? monthsLong[d.getMonth()] : monthsShort[d.getMonth()];
  const year = d.getFullYear();

  if (withDay) {
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  }
  return `${dateNum} ${monthName} ${year}`;
};

/**
 * Formats a date string to Indonesian standard format without clock time.
 * Example:
 * - formatDateTimeIndo('2026-09-28') -> 'Senin, 28 Sep 2026'
 */
export const formatDateTimeIndo = (dateStr) => {
  if (!dateStr) return '-';
  return formatDateIndo(dateStr, { withDay: true, monthFormat: 'short' });
};

/**
 * Compact date format for dense lists, cards, and tables without clock time.
 * Example:
 * - formatCompactDateTime('2026-09-28') -> '28 Sep 2026'
 */
export const formatCompactDateTime = (dateStr) => {
  if (!dateStr) return '-';

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return typeof dateStr === 'string' ? dateStr : '-';
  }

  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dateNum = d.getDate();
  const monthName = monthsShort[d.getMonth()];

  return `${dateNum} ${monthName} ${d.getFullYear()}`;
};

/**
 * Returns a relative urgency label (e.g. 'Hari ini', 'Besok', '3 hari lagi', '2 hari lalu')
 */
export const getRelativeDayLabel = (dateStr) => {
  if (!dateStr) return '';
  let target;
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      target = new Date(dateStr);
    }
  } else {
    target = new Date(dateStr);
  }
  if (isNaN(target.getTime())) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Besok';
  if (diffDays === 2) return 'Lusa';
  if (diffDays > 2) return `${diffDays} hari lagi`;
  if (diffDays === -1) return 'Kemarin';
  return `${Math.abs(diffDays)} hari lalu`;
};

/**
 * Returns deadline status with human-readable label and semantic urgency variant.
 * Output: { label: string, urgency: 'danger' | 'warning' | 'info' | 'neutral' }
 */
export const getDeadlineStatus = (dateStr) => {
  if (!dateStr) {
    return { label: '-', urgency: 'neutral' };
  }

  let target;
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      target = new Date(dateStr);
    }
  } else {
    target = new Date(dateStr);
  }

  if (isNaN(target.getTime())) {
    return { label: typeof dateStr === 'string' ? dateStr : '-', urgency: 'neutral' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Lewat ${Math.abs(diffDays)} hari`,
      urgency: 'danger'
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Hari ini',
      urgency: 'danger'
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Besok',
      urgency: 'warning'
    };
  }

  if (diffDays === 2) {
    return {
      label: 'Lusa (2 hari lagi)',
      urgency: 'warning'
    };
  }

  if (diffDays <= 3) {
    return {
      label: `${diffDays} hari lagi`,
      urgency: 'warning'
    };
  }

  return {
    label: `${diffDays} hari lagi`,
    urgency: 'info'
  };
};

/**
 * Formats an ISO timestamp or date into relative time in Indonesian.
 * Examples: 'Baru saja', '5 menit lalu', '2 jam lalu', 'Kemarin, 14:30', '5 Okt 2026, 09:15'.
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return typeof timestamp === 'string' ? timestamp : '-';

  const now = Date.now();
  const diffSec = Math.floor((now - d.getTime()) / 1000);

  if (diffSec < 45) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;

  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return `Kemarin, ${timeStr}`;
  if (diffDays < 7) return `${diffDays} hari lalu, ${timeStr}`;

  return `${formatCompactDateTime(timestamp)}, ${timeStr}`;
};

/**
 * Detailed Indonesian timestamp with hours and minutes.
 * Example: 'Senin, 5 Okt 2026 · 14:30 WIB'
 */
export const formatFullTimeIndo = (timestamp) => {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '-';
  const dateFormatted = formatDateIndo(timestamp, { withDay: true, monthFormat: 'short' });
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${dateFormatted} · ${timeStr} WIB`;
};
