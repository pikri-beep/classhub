import { formatDateIndo } from '../../../lib/dateUtils';

export const DEFAULT_WA_GREETING = "Assalamu'alaikum & selamat malam rekan-rekan! 👋";
export const DEFAULT_WA_BANNER_TITLE = "PERSIAPAN KELAS";
export const DEFAULT_WA_FOOTER_NOTE = "🌐 *Buka ClassHub untuk detail lengkap.*";
export const DEFAULT_WA_CLOSING = "Selamat istirahat dan jangan lupa persiapkan kebutuhan untuk besok! ✨";

export const formatForDatetimeLocal = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 16);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export const handleCopyLink = (link, showToast) => {
  if (!link) return;
  navigator.clipboard.writeText(link)
    .then(() => showToast?.('Tautan tugas berhasil disalin! 📋', 'success'))
    .catch(() => showToast?.('Gagal menyalin tautan tugas', 'error'));
};

export const handleCopyTaskInfo = (task, showToast) => {
  if (!task) return;
  const deadlineLabel = task.deadline ? formatDateIndo(task.deadline, { withDay: true, monthFormat: 'short' }) : 'Segera';
  const text = `📌 *${task.subject} — ${task.title}*\nTenggat: ${deadlineLabel}${task.description ? `\n\n${task.description}` : ''}`;
  navigator.clipboard.writeText(text)
    .then(() => showToast?.('Informasi tugas berhasil disalin! 📋', 'success'))
    .catch(() => showToast?.('Gagal menyalin informasi tugas', 'error'));
};

export const handleSendTaskToWA = (task, className, showToast) => {
  if (!task) return;
  const deadlineLabel = task.deadline ? formatDateIndo(task.deadline, { withDay: true, monthFormat: 'short' }) : 'Segera';
  const msg = `*📢 TUGAS KELAS — ${className || 'XI PPLG'}*
----------------------------------------
*Mata Pelajaran:* ${task.subject}
*Judul Tugas:* ${task.title}
*Tenggat Waktu:* ${deadlineLabel}
${task.description ? `\n*Petunjuk:*\n${task.description}\n` : ''}${task.link ? `\n*Link Pengumpulan:*\n${task.link}\n` : ''}
Mohon untuk dikerjakan tepat waktu. Semangat rekan-rekan! 🙏`;

  navigator.clipboard.writeText(msg)
    .then(() => {
      showToast?.('Format tugas WA disalin ke clipboard! 📋', 'success');
      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    })
    .catch(() => {
      showToast?.('Gagal menyalin format tugas', 'error');
    });
};
