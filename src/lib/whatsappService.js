/**
 * WhatsApp Gateway & Briefing Service
 * Mendukung Fonnte, Wablas, dan Custom Webhook / REST API
 */

const DAYS_MAP = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_MAP = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Helper untuk format tanggal Indonesia (contoh: "Senin, 28 Oktober 2026")
 */
export const formatDateIndo = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  const dayName = DAYS_MAP[dateObj.getDay()];
  const day = dateObj.getDate();
  const monthName = MONTHS_MAP[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
};

/**
 * Cek apakah dua objek tanggal berada di hari kalender yang sama
 */
export const isSameCalendarDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Menyusun teks pesan WhatsApp Daily Brief secara otomatis
 */
export const generateWhatsAppBriefText = ({
  classInfo = {},
  tasks = [],
  schedules = {},
  exams = [],
  targetDate = new Date(Date.now() + 86400000) // Default besok
}) => {
  const lines = [];

  const greeting = classInfo?.waGreeting !== undefined
    ? classInfo.waGreeting
    : "Assalamu'alaikum & selamat malam rekan-rekan! 👋";

  const bannerTitle = classInfo?.waBannerTitle || 'PERSIAPAN KELAS';
  const footerNote = classInfo?.waFooterNote !== undefined
    ? classInfo.waFooterNote
    : `🌐 *Buka ${classInfo?.appName || 'ClassHub'} untuk detail lengkap.*`;

  const closing = classInfo?.waClosing !== undefined
    ? classInfo.waClosing
    : 'Selamat istirahat dan jangan lupa persiapkan kebutuhan untuk besok! ✨';

  const includeSchedule = classInfo?.waIncludeSchedule !== false;
  const includeTasks = classInfo?.waIncludeTasks !== false;
  const includePiket = classInfo?.waIncludePiket !== false;
  const includeExams = classInfo?.waIncludeExams !== false;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const isTomorrow = isSameCalendarDay(targetDate, tomorrow);
  const isToday = isSameCalendarDay(targetDate, now);
  const dayIndex = targetDate.getDay();
  const dayName = DAYS_MAP[dayIndex];
  const dateFormatted = formatDateIndo(targetDate);

  // 1. Greeting
  if (greeting && greeting.trim()) {
    lines.push(greeting.trim());
    lines.push('');
  }

  // 2. Title Banner
  const targetLabel = isTomorrow ? 'BESOK' : (isToday ? 'HARI INI' : dayName.toUpperCase());
  lines.push(`📚 *${bannerTitle} — ${targetLabel}*`);
  lines.push(`🗓️ ${dateFormatted}`);
  lines.push(`━━━━━━━━━━━━━━━━━━`);

  let hasAnyContent = false;

  // 3. Jadwal Pelajaran
  const daySchedule = schedules[dayName] || { subjects: [], piket: [] };
  const subjects = daySchedule.subjects || [];

  if (includeSchedule && subjects.length > 0) {
    hasAnyContent = true;
    lines.push('');
    lines.push(`📅 *JADWAL ${targetLabel}*`);
    subjects.forEach((sub, idx) => {
      lines.push(`${idx + 1}. ${sub.subject}`);
    });
  }

  // 4. Deadline Tugas
  const dueOnTargetTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    return isSameCalendarDay(task.deadline, targetDate);
  });

  if (includeTasks && dueOnTargetTasks.length > 0) {
    hasAnyContent = true;
    lines.push('');
    lines.push(`📝 *DEADLINE ${targetLabel}*`);
    dueOnTargetTasks.forEach((task, idx) => {
      lines.push(`${idx + 1}. ${task.subject ? `${task.subject} — ` : ''}${task.title}`);
    });
  }

  // 5. Petugas Piket
  const piketList = daySchedule.piket || [];
  if (includePiket && piketList.length > 0) {
    hasAnyContent = true;
    lines.push('');
    lines.push(`🧹 *PIKET ${targetLabel}*`);
    piketList.forEach((person, idx) => {
      lines.push(`${idx + 1}. ${person}`);
    });
  }

  // 6. Ujian Terdekat (dalam rentang 7 hari ke depan)
  const targetTs = targetDate.getTime();
  const upcomingExams = exams
    .filter(ex => {
      if (!ex.examDate) return false;
      const d = new Date(ex.examDate);
      if (isNaN(d.getTime())) return false;
      const diffTime = d.getTime() - targetTs;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  if (includeExams && upcomingExams.length > 0) {
    hasAnyContent = true;
    lines.push('');
    lines.push(`🎯 *UJIAN TERDEKAT*`);
    upcomingExams.slice(0, 2).forEach((ex, idx) => {
      const exDate = new Date(ex.examDate);
      const exDayName = DAYS_MAP[exDate.getDay()];
      const exFormatted = `${exDayName}, ${exDate.getDate()} ${MONTHS_MAP[exDate.getMonth()]}`;
      lines.push(`${idx + 1}. ${ex.subject} (${exFormatted})`);
    });
  }

  // Fallback jika tidak ada KBM sama sekali (misal libur akhir pekan)
  if (!hasAnyContent) {
    lines.push('');
    lines.push(`🏖️ *AGENDA ${targetLabel}*`);
    lines.push('Hari libur / tidak ada KBM atau tugas esok hari. Selamat beristirahat!');
  }

  // 7. Footer
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━');
  if (footerNote && footerNote.trim()) {
    lines.push(footerNote.trim());
    lines.push('');
  }
  if (closing && closing.trim()) {
    lines.push(closing.trim());
  }

  return lines.join('\n');
};

/**
 * Mengirim pesan WhatsApp melalui Provider Gateway (Fonnte, Wablas, atau Webhook)
 */
export const sendWhatsAppMessage = async ({
  provider = 'fonnte',
  token = '',
  target = '',
  message = '',
  customEndpoint = ''
}) => {
  const cleanToken = (token || '').trim();
  const cleanTarget = (target || '').trim();
  const cleanMessage = (message || '').trim();

  if (!cleanTarget) {
    return {
      success: false,
      error: 'Target ID Grup WhatsApp atau nomor tujuan belum diisi.'
    };
  }

  if (!cleanMessage) {
    return {
      success: false,
      error: 'Isi pesan WhatsApp tidak boleh kosong.'
    };
  }

  if (provider !== 'webhook' && !cleanToken) {
    return {
      success: false,
      error: 'API Token belum diisi di Pengaturan WhatsApp.'
    };
  }

  try {
    // 1. Fonnte Gateway (https://api.fonnte.com/send)
    if (provider === 'fonnte') {
      const formData = new FormData();
      formData.append('target', cleanTarget);
      formData.append('message', cleanMessage);
      formData.append('countryCode', '62');

      const endpoint = customEndpoint?.trim() || 'https://api.fonnte.com/send';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': cleanToken
        },
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (data.status === true || data.status === 'true' || response.ok) {
        return {
          success: true,
          data,
          message: 'Pesan berhasil terkirim via Fonnte.'
        };
      }

      return {
        success: false,
        error: data.reason || data.message || `Fonnte Error (${response.status})`
      };
    }

    // 2. Wablas Gateway (https://phone.wablas.com/api/send-message)
    if (provider === 'wablas') {
      const endpoint = customEndpoint?.trim() || 'https://phone.wablas.com/api/send-message';
      const formData = new URLSearchParams();
      formData.append('phone', cleanTarget);
      formData.append('message', cleanMessage);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': cleanToken
        },
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (data.status === true || response.ok) {
        return {
          success: true,
          data,
          message: 'Pesan berhasil terkirim via Wablas.'
        };
      }

      return {
        success: false,
        error: data.message || `Wablas Error (${response.status})`
      };
    }

    // 3. Custom Webhook / Bot API (Generic REST endpoint)
    if (provider === 'webhook') {
      const endpoint = customEndpoint?.trim();
      if (!endpoint) {
        return {
          success: false,
          error: 'URL Webhook / API belum ditentukan.'
        };
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      if (cleanToken) {
        headers['Authorization'] = cleanToken.startsWith('Bearer ')
          ? cleanToken
          : `Bearer ${cleanToken}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          target: cleanTarget,
          message: cleanMessage,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        return {
          success: false,
          error: `Webhook Error (${response.status}): ${errText || response.statusText}`
        };
      }

      const data = await response.json().catch(() => ({ status: 'ok' }));
      return {
        success: true,
        data,
        message: 'Pesan berhasil dikirim ke Webhook endpoint.'
      };
    }

    return {
      success: false,
      error: `Penyedia gateway "${provider}" tidak didukung.`
    };
  } catch (err) {
    console.error('[WhatsAppService] Send error:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan jaringan saat menghubungi gateway WhatsApp.'
    };
  }
};

/**
 * Mengirim pesan uji coba untuk memvalidasi konfigurasi gateway & target grup
 */
export const sendTestWhatsAppMessage = async ({
  provider = 'fonnte',
  token = '',
  target = '',
  customEndpoint = '',
  className = 'XI PPLG'
}) => {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  const dateStr = formatDateIndo(now);

  const testMessage = [
    `🔔 *[UJI COBA KONEKSI WHATSAPP]*`,
    `━━━━━━━━━━━━━━━━━━`,
    `Halo rekan-rekan kelas *${className}*! 👋`,
    `Ini adalah pesan pengujian otomatis dari integrasi WhatsApp Gateway portal kelas.`,
    ``,
    `📅 *Tanggal:* ${dateStr}`,
    `⏰ *Waktu:* ${timeStr}`,
    `📡 *Provider:* ${provider.toUpperCase()}`,
    `🎯 *Status:* Terhubung & Siap Mengirim Briefing Harian! ✨`,
    `━━━━━━━━━━━━━━━━━━`,
    `_Pesan ini dikirim secara otomatis via sistem ClassHub._`
  ].join('\n');

  return sendWhatsAppMessage({
    provider,
    token,
    target,
    message: testMessage,
    customEndpoint
  });
};
