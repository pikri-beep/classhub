/**
 * Utilitas Rotasi Piket MBG (Makan Bergizi Gratis)
 * Sistem Continuous Circular Rolling berdasarkan Nomor Absen Siswa
 */

export const MBG_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

// Referensi awal semester (Senin, 28 September 2026 sebagai Pekan 0 / Baseline Absen 1)
export const BASE_REFERENCE_MONDAY = '2026-09-28';

/**
 * Mendapatkan objek Date untuk hari Senin pada pekan tanggal yang diberikan
 */
export const getMondayOfWeek = (dateInput = new Date()) => {
  const d = new Date(dateInput);
  const day = d.getDay(); // 0: Minggu, 1: Senin, ..., 6: Sabtu
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Penyesuaian ke hari Senin
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * Menghitung selisih pekan kalender dari referensi awal
 */
export const getCalendarWeekOffset = (targetDate = new Date(), baseMondayStr = BASE_REFERENCE_MONDAY) => {
  const targetMonday = getMondayOfWeek(targetDate);
  const baseMonday = new Date(baseMondayStr);
  baseMonday.setHours(0, 0, 0, 0);

  const diffMs = targetMonday.getTime() - baseMonday.getTime();
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks;
};

/**
 * Format rentang tanggal pekan (contoh: "28 Sep – 02 Okt 2026")
 */
export const formatWeekDateRange = (mondayDate) => {
  if (!mondayDate || isNaN(mondayDate.getTime())) return '';

  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const friday = new Date(mondayDate);
  friday.setDate(mondayDate.getDate() + 4);

  const startDay = String(mondayDate.getDate()).padStart(2, '0');
  const startMonth = monthsShort[mondayDate.getMonth()];
  const endDay = String(friday.getDate()).padStart(2, '0');
  const endMonth = monthsShort[friday.getMonth()];
  const year = friday.getFullYear();

  if (mondayDate.getMonth() === friday.getMonth()) {
    return `${startDay} – ${endDay} ${endMonth} ${year}`;
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
};

/**
 * Mendapatkan hari sekolah saat ini (Senin-Jumat).
 * Jika hari Sabtu atau Minggu, otomatis mengembalikan 'Senin'.
 */
export const getCurrentSchoolDay = (date = new Date()) => {
  const dayIndex = date.getDay(); // 0: Minggu, 1: Senin, ...
  const map = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat'
  };
  return map[dayIndex] || 'Senin';
};

/**
 * Menghitung daftar petugas MBG untuk satu pekan penuh (Senin-Jumat)
 * menggunakan mekanisme continuous rolling queue.
 *
 * @param {Object} params
 * @param {Array} params.members - Daftar seluruh siswa
 * @param {number} params.weekOffset - Offset pekan relatif terhadap baseline (0 = Pekan baseline/ini)
 * @param {Object} params.overrides - Data kustom jika ada penyesuaian/override manual
 */
export const calculateMbgWeekSchedule = ({
  members = [],
  weekOffset = 0,
  overrides = {}
}) => {
  if (!members || members.length === 0) {
    return MBG_DAYS.reduce((acc, d) => {
      acc[d] = { ambil: [], balikin: [] };
      return acc;
    }, {});
  }

  // Pastikan urutan berdasarkan nomor absen menaik
  const sortedMembers = [...members].sort((a, b) => (a.absentNo || 999) - (b.absentNo || 999));
  const total = sortedMembers.length;

  const result = {};

  MBG_DAYS.forEach((day, dayIdx) => {
    // 5 hari sekolah per pekan, 6 penugasan per hari (3 ambil, 3 balikin)
    const globalDayIndex = weekOffset * 5 + dayIdx;
    const startIndex = (((globalDayIndex * 6) % total) + total) % total;

    // Ambil 3 siswa untuk regu ambil
    const autoAmbil = [0, 1, 2].map((i) => {
      const student = sortedMembers[(startIndex + i) % total];
      return {
        id: student.id,
        name: student.name,
        absentNo: student.absentNo,
        phone: student.phone || '',
        isOverride: false
      };
    });

    // Ambil 3 siswa berikutnya untuk regu balikin
    const autoBalikin = [3, 4, 5].map((i) => {
      const student = sortedMembers[(startIndex + i) % total];
      return {
        id: student.id,
        name: student.name,
        absentNo: student.absentNo,
        phone: student.phone || '',
        isOverride: false
      };
    });

    // Periksa apakah ada override manual untuk hari dan pekan ini
    const dayOverride = (overrides && (overrides[day] || overrides[weekOffset]?.[day])) || null;
    let finalAmbil = autoAmbil;
    let finalBalikin = autoBalikin;

    // Hanya terapkan jika override benar-benar didefinisikan secara khusus untuk hari/pekan ini
    if (dayOverride && Array.isArray(dayOverride.ambil) && dayOverride.ambil.length > 0 && dayOverride._isExplicitOverride) {
      finalAmbil = dayOverride.ambil.map(item => {
        if (typeof item === 'string') {
          const found = sortedMembers.find(m => m.name.toLowerCase() === item.toLowerCase());
          return {
            id: found?.id || `custom-${item}`,
            name: item,
            absentNo: found?.absentNo || null,
            phone: found?.phone || '',
            isOverride: true
          };
        }
        return { ...item, isOverride: true };
      });
    }

    if (dayOverride && Array.isArray(dayOverride.balikin) && dayOverride.balikin.length > 0 && dayOverride._isExplicitOverride) {
      finalBalikin = dayOverride.balikin.map(item => {
        if (typeof item === 'string') {
          const found = sortedMembers.find(m => m.name.toLowerCase() === item.toLowerCase());
          return {
            id: found?.id || `custom-${item}`,
            name: item,
            absentNo: found?.absentNo || null,
            phone: found?.phone || '',
            isOverride: true
          };
        }
        return { ...item, isOverride: true };
      });
    }

    result[day] = {
      ambil: finalAmbil,
      balikin: finalBalikin
    };
  });

  return result;
};
