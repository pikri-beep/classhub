import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Calendar,
  Sparkles,
  Edit3,
  Eye,
  RotateCcw,
  Clock,
  BookOpen,
  Users,
  GraduationCap,
  Send,
  Loader2,
  Radio,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';
import { useStore } from '../context/StoreContext';
import { generateWhatsAppBriefText, sendWhatsAppMessage } from '../lib/whatsappService';

export default function WhatsAppShareModal({
  isOpen,
  onClose,
  tasks: propTasks = [],
  classInfo: propClassInfo = {},
  currentUser = {}
}) {
  const { showToast } = useToast();
  const { data, updateClassInfo, logActivity } = useStore();

  const classInfo = propClassInfo?.name ? propClassInfo : (data?.classInfo || {});
  const tasks = propTasks && propTasks.length > 0 ? propTasks : (data?.tasks || []);
  const schedules = data?.schedules || {};
  const exams = data?.exams || [];

  const [isSendingToGroup, setIsSendingToGroup] = useState(false);

  const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  // Default target date: Tomorrow
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const formatDateYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [targetDateStr, setTargetDateStr] = useState(formatDateYMD(tomorrow));
  const [isEditing, setIsEditing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [hasCustomEdits, setHasCustomEdits] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Compute selected Date object
  const targetDate = new Date(`${targetDateStr}T00:00:00`);
  const dayIndex = isNaN(targetDate.getTime()) ? 1 : targetDate.getDay();
  const dayName = daysMap[dayIndex];
  const dateFormatted = !isNaN(targetDate.getTime())
    ? `${dayName}, ${targetDate.getDate()} ${monthsMap[targetDate.getMonth()]} ${targetDate.getFullYear()}`
    : targetDateStr;

  const isTomorrow = targetDateStr === formatDateYMD(tomorrow);
  const isToday = targetDateStr === formatDateYMD(now);

  // Helper: check same calendar day
  const isSameCalendarDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // 1. Jadwal Pelajaran (Tanpa guru atau ruangan)
  const daySchedule = schedules[dayName] || { subjects: [], piket: [] };
  const subjects = daySchedule.subjects || [];

  // 2. Deadline Tugas Besok
  const dueOnTargetTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const d = new Date(task.deadline);
    return !isNaN(d.getTime()) && isSameCalendarDay(d, targetDate);
  });

  // 3. Petugas Piket Besok
  const piketList = daySchedule.piket || [];

  // 4. Ujian Terdekat (fokus 1 ujian paling dekat dalam 7 hari ke depan)
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

  const closestExam = upcomingExams[0] || null;

  // Build clean, dynamic WhatsApp Brief using shared service
  const autoMessage = generateWhatsAppBriefText({
    classInfo,
    tasks,
    schedules,
    exams,
    targetDate
  });

  const currentMessage = hasCustomEdits ? customMessage : autoMessage;

  // Whenever target date changes, refresh auto text unless user has actively edited
  useEffect(() => {
    if (!hasCustomEdits) {
      setCustomMessage(autoMessage);
    }
  }, [targetDateStr, autoMessage, hasCustomEdits]);

  const handleResetToAuto = () => {
    setHasCustomEdits(false);
    setCustomMessage(autoMessage);
    showToast('Teks dikembalikan ke template otomatis.', 'info');
  };

  const handleTextChange = (e) => {
    setCustomMessage(e.target.value);
    setHasCustomEdits(true);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = currentMessage;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      showToast('Pesan WhatsApp Brief berhasil disalin! 📋', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      showToast('Gagal menyalin pesan', 'error');
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(currentMessage);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const handleSendToGroup = async () => {
    const {
      waGatewayEnabled,
      waProvider = 'fonnte',
      waApiToken,
      waTargetGroup,
      waCustomEndpoint
    } = classInfo;

    if (!waGatewayEnabled) {
      showToast('Integrasi WhatsApp Gateway belum diaktifkan. Buka Pengaturan Admin > Format WhatsApp untuk menyalakannya.', 'warning');
      return;
    }

    if (!waTargetGroup) {
      showToast('Target ID Grup WhatsApp belum ditentukan. Atur di Pengaturan Admin > Format WhatsApp.', 'warning');
      return;
    }

    if (waProvider !== 'webhook' && !waApiToken) {
      showToast('API Token WhatsApp belum diisi. Atur di Pengaturan Admin > Format WhatsApp.', 'warning');
      return;
    }

    setIsSendingToGroup(true);
    try {
      const result = await sendWhatsAppMessage({
        provider: waProvider,
        token: waApiToken,
        target: waTargetGroup,
        message: currentMessage,
        customEndpoint: waCustomEndpoint
      });

      if (result.success) {
        showToast('🚀 Pesan WhatsApp Brief berhasil terkirim langsung ke grup kelas!', 'success');
        if (updateClassInfo) {
          updateClassInfo({
            waLastAutoSentDate: targetDateStr,
            waLastAutoSentTime: new Date().toISOString(),
            waLastAutoSentStatus: 'success',
            waLastAutoSentMessage: 'Manual Send via Modal'
          });
        }
        if (logActivity) {
          logActivity({
            action: 'whatsapp_manual_send',
            category: 'system',
            title: 'WhatsApp Brief Terkirim ke Grup',
            details: `Briefing kelas dikirim langsung ke grup (${waTargetGroup}) via ${waProvider.toUpperCase()}.`
          });
        }
      } else {
        showToast(`Gagal mengirim ke grup: ${result.error}`, 'error');
      }
    } catch (err) {
      showToast(`Terjadi kesalahan: ${err.message}`, 'error');
    } finally {
      setIsSendingToGroup(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📲 WhatsApp Brief Kelas" maxWidth="600px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

        {/* Date Selector & Data Signals */}
        <div style={{
          padding: '0.75rem 0.95rem',
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Target Tanggal: <span style={{ color: 'var(--primary)' }}>{dateFormatted}</span>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setTargetDateStr(formatDateYMD(tomorrow));
                  setHasCustomEdits(false);
                }}
                className={`btn btn-xs ${isTomorrow ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.72rem', borderRadius: 'var(--radius-full)' }}
              >
                Besok
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetDateStr(formatDateYMD(now));
                  setHasCustomEdits(false);
                }}
                className={`btn btn-xs ${isToday ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.72rem', borderRadius: 'var(--radius-full)' }}
              >
                Hari Ini
              </button>
              <input
                type="date"
                value={targetDateStr}
                onChange={(e) => {
                  if (e.target.value) {
                    setTargetDateStr(e.target.value);
                    setHasCustomEdits(false);
                  }
                }}
                className="form-input"
                style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem', height: '26px' }}
                title="Pilih tanggal kustom"
              />
            </div>
          </div>

          {/* Data signals used */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>
              Data termuat:
            </span>
            <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
              <BookOpen size={10} style={{ marginRight: '3px' }} />
              {subjects.length} Mapel
            </span>
            {dueOnTargetTasks.length > 0 ? (
              <span className="notion-tag notion-tag-red" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                <Clock size={10} style={{ marginRight: '3px' }} />
                {dueOnTargetTasks.length} Deadline
              </span>
            ) : (
              <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                0 Deadline
              </span>
            )}
            {piketList.length > 0 ? (
              <span className="notion-tag notion-tag-green" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                <Users size={10} style={{ marginRight: '3px' }} />
                {piketList.length} Petugas Piket
              </span>
            ) : (
              <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                0 Piket
              </span>
            )}
            {upcomingExams.length > 0 ? (
              <span className="notion-tag notion-tag-orange" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                <GraduationCap size={10} style={{ marginRight: '3px' }} />
                {upcomingExams.length} Ujian Terdekat
              </span>
            ) : null}
          </div>
        </div>

        {/* View / Edit Mode Tabs & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className={`btn btn-xs ${!isEditing ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ gap: '0.3rem', fontSize: '0.75rem', fontWeight: !isEditing ? 700 : 500 }}
            >
              <Eye size={12} />
              <span>Pratinjau Pesan</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={`btn btn-xs ${isEditing ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ gap: '0.3rem', fontSize: '0.75rem', fontWeight: isEditing ? 700 : 500 }}
            >
              <Edit3 size={12} />
              <span>Edit Teks {hasCustomEdits && '•'}</span>
            </button>
          </div>

          {hasCustomEdits && (
            <button
              type="button"
              onClick={handleResetToAuto}
              className="btn btn-ghost btn-xs"
              style={{ fontSize: '0.72rem', color: 'var(--primary)', gap: '0.25rem' }}
              title="Kembalikan ke susunan otomatis"
            >
              <RotateCcw size={11} />
              <span>Reset Teks Otomatis</span>
            </button>
          )}
        </div>

        {/* Message Container: Preview Box OR Editable Textarea */}
        <div>
          {!isEditing ? (
            <div className="wa-preview-box" style={{ maxHeight: '310px', overflowY: 'auto' }}>
              <pre style={{
                margin: 0,
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'var(--text-primary)'
              }}>
                {currentMessage}
              </pre>
            </div>
          ) : (
            <textarea
              className="form-input"
              value={currentMessage}
              onChange={handleTextChange}
              rows={13}
              style={{
                width: '100%',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                resize: 'vertical',
                backgroundColor: 'var(--bg-surface)'
              }}
              placeholder="Ketik atau sesuaikan pesan WhatsApp di sini..."
            />
          )}
        </div>

        {/* WhatsApp Gateway & Automation Live Status Banner */}
        <div style={{
          padding: '0.65rem 0.85rem',
          backgroundColor: classInfo?.waGatewayEnabled ? 'var(--bg-surface)' : 'var(--hover-bg)',
          borderRadius: 'var(--radius-sm)',
          border: classInfo?.waGatewayEnabled ? '1px solid var(--success-border, rgba(34,197,94,0.3))' : '1px dashed var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem' }}>
            {classInfo?.waGatewayEnabled ? (
              <>
                <Radio size={14} style={{ color: 'var(--success, #22c55e)' }} />
                <span>
                  <strong>Gateway Aktif ({classInfo?.waProvider ? classInfo.waProvider.toUpperCase() : 'FONNTE'}):</strong> Target: <code style={{ fontSize: '0.72rem', padding: '0.1rem 0.3rem', background: 'var(--bg)', borderRadius: '4px' }}>{classInfo?.waTargetGroup || 'Belum diisi'}</code>
                  {classInfo?.waAutoSendSchedule && (
                    <span style={{ marginLeft: '0.4rem', color: 'var(--text-muted)' }}>
                      • Otomatis jam {classInfo?.waAutoSendTime || '19:00'} WIB
                    </span>
                  )}
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={14} style={{ color: 'var(--warning, #f59e0b)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong>Gateway Otomatisasi:</strong> Belum dikonfigurasi. Atur di menu Pengaturan Admin &rarr; Format WhatsApp.
                </span>
              </>
            )}
          </div>
          {classInfo?.waGatewayEnabled && classInfo?.waLastAutoSentDate ? (
            <span className="notion-tag notion-tag-green" style={{ fontSize: '0.65rem', padding: '0.05rem 0.4rem' }}>
              Terakhir: {classInfo.waLastAutoSentDate}
            </span>
          ) : (
            <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.65rem', padding: '0.05rem 0.4rem' }}>
              {classInfo?.waGatewayEnabled ? 'Siap Kirim' : 'Manual Mode'}
            </span>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.55rem',
          flexWrap: 'wrap',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border)'
        }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Tutup
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleCopy}
            style={{ gap: '0.35rem' }}
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{isCopied ? 'Tersalin!' : 'Copy Message'}</span>
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleOpenWhatsApp}
            title="Buka WhatsApp Web / App untuk memilih kontak/grup manual"
            style={{
              gap: '0.35rem',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              borderColor: '#25D366',
              fontWeight: 600
            }}
          >
            <MessageCircle size={14} />
            <span>Buka WhatsApp</span>
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleSendToGroup}
            disabled={isSendingToGroup}
            title="Kirim pesan langsung ke grup kelas via Gateway WhatsApp"
            style={{
              gap: '0.35rem',
              backgroundColor: '#128C7E',
              color: '#FFFFFF',
              borderColor: '#128C7E',
              fontWeight: 700
            }}
          >
            {isSendingToGroup ? (
              <>
                <Loader2 size={14} className="spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Kirim ke Grup WA</span>
              </>
            )}
          </button>
        </div>

      </div>
    </Modal>
  );
}
