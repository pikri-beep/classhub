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
  GraduationCap
} from 'lucide-react';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';
import { useStore } from '../context/StoreContext';

export default function WhatsAppShareModal({ 
  isOpen, 
  onClose, 
  tasks: propTasks = [], 
  classInfo: propClassInfo = {}, 
  currentUser = {} 
}) {
  const { showToast } = useToast();
  const { data } = useStore();

  const classInfo = propClassInfo?.name ? propClassInfo : (data?.classInfo || {});
  const tasks = propTasks && propTasks.length > 0 ? propTasks : (data?.tasks || []);
  const schedules = data?.schedules || {};
  const exams = data?.exams || [];

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

  // Build clean, dynamic WhatsApp Brief
  const generateAutoBrief = () => {
    const lines = [];

    // Greeting
    lines.push(`Assalamu'alaikum & selamat malam rekan-rekan! 👋`);
    lines.push(``);

    // Title banner
    const targetLabel = isTomorrow ? 'BESOK' : (isToday ? 'HARI INI' : dayName.toUpperCase());
    lines.push(`📚 *PERSIAPAN KELAS — ${targetLabel}*`);
    lines.push(`🗓️ ${dateFormatted}`);
    lines.push(`━━━━━━━━━━━━━━━━━━`);

    let hasAnyContent = false;

    // 1. Jadwal Pelajaran (Tanpa jam, tanpa guru / ruangan)
    if (subjects.length > 0) {
      hasAnyContent = true;
      lines.push(``);
      lines.push(`📅 *JADWAL ${targetLabel}*`);
      subjects.forEach((sub, idx) => {
        lines.push(`${idx + 1}. ${sub.subject}`);
      });
    }

    // 2. Deadline Besok (Nomor, tanpa jam)
    if (dueOnTargetTasks.length > 0) {
      hasAnyContent = true;
      lines.push(``);
      lines.push(`📝 *DEADLINE ${targetLabel}*`);
      dueOnTargetTasks.forEach((task, idx) => {
        lines.push(`${idx + 1}. ${task.subject} — ${task.title}`);
      });
    }

    // 3. Piket Besok (Nomor, tanpa note hadir awal)
    if (piketList.length > 0) {
      hasAnyContent = true;
      lines.push(``);
      lines.push(`🧹 *PIKET ${targetLabel}*`);
      piketList.forEach((person, idx) => {
        lines.push(`${idx + 1}. ${person}`);
      });
    }

    // 4. Ujian Terdekat (Ringkas nama ujian dan tanggal)
    if (upcomingExams.length > 0) {
      hasAnyContent = true;
      lines.push(``);
      lines.push(`🎯 *UJIAN TERDEKAT*`);
      upcomingExams.slice(0, 2).forEach((ex, idx) => {
        const exDate = new Date(ex.examDate);
        const exDayName = daysMap[exDate.getDay()];
        const exFormatted = `${exDayName}, ${exDate.getDate()} ${monthsMap[exDate.getMonth()]}`;
        lines.push(`${idx + 1}. ${ex.subject} (${exFormatted})`);
      });
    }

    // Fallback jika tidak ada konten sama sekali (misal akhir pekan)
    if (!hasAnyContent) {
      lines.push(``);
      lines.push(`🏖️ *AGENDA ${targetLabel}*`);
      lines.push(`Hari libur / tidak ada jam pembelajaran atau tugas esok hari. Selamat beristirahat!`);
    }

    // Footer
    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`🌐 *Buka ClassHub untuk detail lengkap.*`);
    lines.push(``);
    lines.push(`Selamat istirahat dan jangan lupa persiapkan kebutuhan untuk besok! ✨`);

    return lines.join('\n');
  };

  const autoMessage = generateAutoBrief();
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
            <span className="notion-tag notion-tag-blue" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
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

        {/* Automatic WhatsApp Brief Roadmap Hook */}
        <div style={{
          padding: '0.55rem 0.8rem',
          backgroundColor: 'var(--hover-bg)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
            <Sparkles size={13} style={{ color: 'var(--primary)' }} />
            <span><strong>Automatic WhatsApp Brief:</strong> Status ON • 19.00 WIB (Senin–Jumat)</span>
          </div>
          <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.62rem', padding: '0.05rem 0.35rem' }}>
            Rencana Lanjutan
          </span>
        </div>

        {/* Modal Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.6rem',
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
            <span>{isCopied ? 'Tersalin ke Clipboard!' : 'Copy Message'}</span>
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleOpenWhatsApp}
            style={{
              gap: '0.35rem',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              borderColor: '#25D366',
              fontWeight: 700
            }}
          >
            <MessageCircle size={14} />
            <span>Share WhatsApp</span>
          </button>
        </div>

      </div>
    </Modal>
  );
}
