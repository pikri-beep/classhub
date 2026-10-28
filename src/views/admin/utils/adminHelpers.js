import { formatDateIndo } from '../../../lib/dateUtils';

export const DEFAULT_WA_GREETING = "Assalamu'alaikum & selamat malam rekan-rekan! 👋";
export const DEFAULT_WA_BANNER_TITLE = "PERSIAPAN KELAS";
export const DEFAULT_WA_FOOTER_NOTE = "🌐 *Buka ClassHub untuk detail lengkap.*";
export const DEFAULT_WA_CLOSING = "Selamat istirahat dan jangan lupa persiapkan kebutuhan untuk besok! ✨";

export const formatForDatetimeLocal = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 10);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
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

export const handleCopyExamInfo = (exam, showToast) => {
  if (!exam) return;
  const examDateLabel = exam.examDate ? formatDateIndo(exam.examDate, { withDay: true, monthFormat: 'short' }) : 'Segera';
  const text = `📝 *${exam.subject} — ${exam.title}*\nJadwal: ${examDateLabel}${exam.scope ? `\nKisi-kisi: ${exam.scope}` : ''}`;
  navigator.clipboard.writeText(text)
    .then(() => showToast?.('Informasi ujian berhasil disalin! 📋', 'success'))
    .catch(() => showToast?.('Gagal menyalin informasi ujian', 'error'));
};

export const handleSendExamToWA = (exam, className, showToast) => {
  if (!exam) return;
  const examDateLabel = exam.examDate ? formatDateIndo(exam.examDate, { withDay: true, monthFormat: 'short' }) : 'Segera';
  const msg = `*📢 JADWAL UJIAN/ULANGAN — ${className || 'XI PPLG'}*
----------------------------------------
*Mata Pelajaran:* ${exam.subject}
*Agenda:* ${exam.title}
*Waktu/Tanggal:* ${examDateLabel}
${exam.scope ? `\n*Kisi-kisi/Materi:*\n${exam.scope}\n` : ''}
Persiapkan diri dengan baik rekan-rekan. Semoga sukses! 🌟`;

  navigator.clipboard.writeText(msg)
    .then(() => {
      showToast?.('Format pesan WA ujian disalin ke clipboard! 📋', 'success');
      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    })
    .catch(() => {
      showToast?.('Gagal menyalin pesan ujian', 'error');
    });
};

export const handleSendScheduleToWA = (day, subjects, className, showToast) => {
  if (!subjects || subjects.length === 0) {
    showToast?.(`Belum ada mata pelajaran untuk hari ${day}`, 'warning');
    return;
  }
  const lines = subjects.map((s, i) => `${i + 1}. *${s.subject}* (${s.timeStart} - ${s.timeEnd})`).join('\n');
  const msg = `*📚 JADWAL PELAJARAN — HARI ${day.toUpperCase()}*
Kelas: ${className || 'XI PPLG'}
----------------------------------------
${lines}

Semangat belajar rekan-rekan! ✨`;

  navigator.clipboard.writeText(msg)
    .then(() => {
      showToast?.(`Jadwal hari ${day} disalin ke clipboard! 📋`, 'success');
      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    })
    .catch(() => showToast?.('Gagal menyalin jadwal', 'error'));
};

export const handleSendPiketToWA = (day, piketMembers, mbgDuty, className, showToast) => {
  const piketText = (piketMembers && piketMembers.length > 0)
    ? piketMembers.map((n, i) => `  ${i + 1}. ${n}`).join('\n')
    : '  (Belum ditentukan)';

  let mbgText = '';
  if (mbgDuty) {
    const ambil = (mbgDuty.ambil || []).join(', ') || '-';
    const balikin = (mbgDuty.balikin || []).join(', ') || '-';
    mbgText = `\n*🍱 Piket MBG (Makan Siang):*\n• Pengambil (11.30): ${ambil}\n• Pengembali (12.30): ${balikin}\n`;
  }

  const msg = `*🧹 JADWAL PIKET KELAS — HARI ${day.toUpperCase()}*
Kelas: ${className || 'XI PPLG'}
----------------------------------------
*Petugas Kebersihan:*
${piketText}
${mbgText}
Mohon laksanakan tugas dengan penuh tanggung jawab. Terima kasih! 🙏`;

  navigator.clipboard.writeText(msg)
    .then(() => {
      showToast?.(`Jadwal piket hari ${day} disalin ke clipboard! 📋`, 'success');
      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    })
    .catch(() => showToast?.('Gagal menyalin jadwal piket', 'error'));
};
