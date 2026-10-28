import { useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { generateWhatsAppBriefText, sendWhatsAppMessage } from '../lib/whatsappService';

const DAYS_MAP = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function useWhatsAppAutoScheduler() {
  const { data, updateClassInfo, logActivity } = useStore();
  const { showToast } = useToast();
  const isExecutingRef = useRef(false);

  useEffect(() => {
    const classInfo = data?.classInfo || {};
    const {
      waGatewayEnabled,
      waAutoSendSchedule,
      waProvider = 'fonnte',
      waApiToken,
      waTargetGroup,
      waCustomEndpoint,
      waAutoSendTime = '19:00',
      waAutoSendDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis'],
      waLastAutoSentDate
    } = classInfo;

    // Hanya berjalan jika gateway dan jadwal otomatis diaktifkan, serta token & target ada
    if (!waGatewayEnabled || !waAutoSendSchedule || !waTargetGroup || (waProvider !== 'webhook' && !waApiToken)) {
      return;
    }

    const checkAndDispatchDailyBrief = async () => {
      if (isExecutingRef.current) return;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentDayNum = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${currentYear}-${currentMonth}-${currentDayNum}`;

      // Jangan kirim ulang jika hari ini sudah pernah terkirim
      if (waLastAutoSentDate === todayDateStr) {
        return;
      }

      // Cek apakah hari ini termasuk hari pengiriman terjadwal
      const currentDayName = DAYS_MAP[now.getDay()];
      const activeDays = Array.isArray(waAutoSendDays) ? waAutoSendDays : ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis'];
      if (!activeDays.includes(currentDayName)) {
        return;
      }

      // Cek apakah jam saat ini sudah mencapai atau melewati jadwal pengiriman (misal "19:00")
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMin = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHour}:${currentMin}`;

      if (currentTimeStr < waAutoSendTime) {
        return;
      }

      // Semua kondisi terpenuhi, eksekusi pengiriman otomatis!
      isExecutingRef.current = true;
      try {
        // Target briefing adalah besok
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        const autoBriefText = generateWhatsAppBriefText({
          classInfo,
          tasks: data?.tasks || [],
          schedules: data?.schedules || {},
          exams: data?.exams || [],
          targetDate: tomorrow
        });

        const result = await sendWhatsAppMessage({
          provider: waProvider,
          token: waApiToken,
          target: waTargetGroup,
          message: autoBriefText,
          customEndpoint: waCustomEndpoint
        });

        const timestampIso = new Date().toISOString();

        if (result.success) {
          updateClassInfo({
            waLastAutoSentDate: todayDateStr,
            waLastAutoSentTime: timestampIso,
            waLastAutoSentStatus: 'success',
            waLastAutoSentMessage: 'Berhasil dikirim otomatis'
          });

          if (logActivity) {
            logActivity({
              action: 'whatsapp_auto_send',
              category: 'system',
              title: 'WhatsApp Brief Otomatis Terkirim',
              details: `Briefing harian berhasil dikirim ke grup (${waTargetGroup}) via ${waProvider.toUpperCase()}.`
            });
          }

          if (showToast) {
            showToast('📲 Daily WhatsApp Brief otomatis berhasil dikirim ke grup kelas!', 'success');
          }
        } else {
          // Tandai tanggal agar tidak mencoba kirim berulang-ulang setiap menit jika ada error API
          updateClassInfo({
            waLastAutoSentDate: todayDateStr,
            waLastAutoSentTime: timestampIso,
            waLastAutoSentStatus: 'failed',
            waLastAutoSentMessage: result.error || 'Gagal mengirim'
          });

          if (logActivity) {
            logActivity({
              action: 'whatsapp_auto_fail',
              category: 'system',
              title: 'Gagal Mengirim WhatsApp Brief Otomatis',
              details: `Error: ${result.error || 'Gagal mengirim'}`
            });
          }

          console.warn('[WhatsAppAutoScheduler] Send error:', result.error);
        }
      } catch (err) {
        console.error('[WhatsAppAutoScheduler] Execution error:', err);
      } finally {
        isExecutingRef.current = false;
      }
    };

    // Jalankan pengecekan langsung saat mount
    checkAndDispatchDailyBrief();

    // Jalankan timer polling berkala setiap 45 detik
    const timer = setInterval(checkAndDispatchDailyBrief, 45000);

    return () => clearInterval(timer);
  }, [data, updateClassInfo, logActivity, showToast]);
}
