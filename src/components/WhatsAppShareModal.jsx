import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, MessageCircle, Filter } from 'lucide-react';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';

export default function WhatsAppShareModal({ isOpen, onClose, tasks = [], classInfo = {}, currentUser = {} }) {
  const { showToast } = useToast();
  const [scope, setScope] = useState('all'); // 'all' or 'my'
  const [includeLink, setIncludeLink] = useState(true);
  const [includeGreeting, setIncludeGreeting] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const monthsMap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const now = new Date();
  const todayFormatted = `${daysMap[now.getDay()]}, ${now.getDate()} ${monthsMap[now.getMonth()]} ${now.getFullYear()}`;

  // Filter tasks based on scope
  const targetTasks = tasks.filter(task => {
    if (scope === 'my') {
      return !(task.completedStudentIds || []).includes(currentUser?.id);
    }
    return true; // All tasks
  });

  // Calculate days remaining
  const getRemainingDays = (deadlineStr) => {
    if (!deadlineStr) return null;
    const deadlineDate = new Date(deadlineStr);
    if (isNaN(deadlineDate.getTime())) return null;
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Generate WhatsApp formatted text
  const generateWhatsAppMessage = () => {
    const lines = [];

    if (includeGreeting) {
      lines.push(`Assalamu'alaikum & Semangat Pagi rekan-rekan *${classInfo.name || 'XII PPLG 1'}*! 👋`);
      lines.push(`Berikut adalah rekap tugas dan tenggat waktu akademik kelas kita:`);
      lines.push(``);
    }

    lines.push(`📋 *REKAP TUGAS & DEADLINE — ${classInfo.name || 'XII PPLG 1'}*`);
    lines.push(`📅 _Update: ${todayFormatted}_`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

    if (targetTasks.length === 0) {
      lines.push(``);
      lines.push(`🎉 *Alhamdulillah, belum ada tugas aktif yang menumpuk!*`);
      lines.push(`Tetap jaga semangat dan manfaatkan waktu untuk belajar mandiri.`);
    } else {
      targetTasks.forEach((task, idx) => {
        const dObj = new Date(task.deadline);
        const deadlineText = !isNaN(dObj.getTime())
          ? `${daysMap[dObj.getDay()]}, ${dObj.getDate()} ${monthsMap[dObj.getMonth()]} ${dObj.getFullYear()}`
          : task.deadline;
        
        const remainingDays = getRemainingDays(task.deadline);
        let urgency = '';
        if (remainingDays !== null) {
          if (remainingDays < 0) urgency = '⚠️ _(Sudah lewat tenggat!)_';
          else if (remainingDays === 0) urgency = '⚡ _(Hari ini deadline!)_';
          else if (remainingDays === 1) urgency = '⏳ _(Besok deadline!)_';
          else urgency = `⏳ _(Sisa ${remainingDays} hari)_`;
        }

        const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const numIcon = numberEmojis[idx] || `${idx + 1}.`;

        lines.push(``);
        lines.push(`${numIcon} *${task.subject}*`);
        lines.push(`   📌 *Tugas:* ${task.title}`);
        lines.push(`   ⏰ *Tenggat:* ${deadlineText} ${urgency}`);
        if (task.description) {
          lines.push(`   📝 _Ket: ${task.description}_`);
        }
        if (task.link) {
          lines.push(`   🔗 *Link Tugas:* ${task.link}`);
        }
      });
    }

    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`💡 _"Disiplin tugas hari ini adalah langkah awal sukses esok hari!"_`);
    if (includeLink) {
      lines.push(``);
      lines.push(`🌐 *Pantau status & centang tugasmu di Portal Kelas:*`);
      lines.push(`${window.location.origin || 'https://classhub.id'}`);
    }

    return lines.join('\n');
  };

  const messageText = generateWhatsAppMessage();

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(messageText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = messageText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      showToast('Format teks WhatsApp berhasil disalin! 📋', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      showToast('Gagal menyalin teks', 'error');
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📲 Salin & Bagikan Rekap Tugas ke WhatsApp" maxWidth="580px">
      <div>
        {/* OPTIONS BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 0.9rem',
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          marginBottom: '1rem'
        }}>
          {/* Scope selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cakupan:</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                className={`btn btn-xs ${scope === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setScope('all')}
              >
                Semua Tugas ({tasks.length})
              </button>
              <button
                type="button"
                className={`btn btn-xs ${scope === 'my' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setScope('my')}
              >
                Belum Selesai ({tasks.filter(t => !(t.completedStudentIds || []).includes(currentUser?.id)).length})
              </button>
            </div>
          </div>

          {/* Additional toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeGreeting}
                onChange={(e) => setIncludeGreeting(e.target.checked)}
              />
              <span>Salam</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeLink}
                onChange={(e) => setIncludeLink(e.target.checked)}
              />
              <span>Link Web</span>
            </label>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.4rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-muted)'
          }}>
            <span>PRATINJAU FORMAT PESAN WHATSAPP</span>
            <span>{targetTasks.length} Tugas Dimuat</span>
          </div>

          <div className="wa-preview-box">
            <pre style={{
              margin: 0,
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'var(--text-primary)'
            }}>
              {messageText}
            </pre>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.65rem',
          flexWrap: 'wrap',
          paddingTop: '0.85rem',
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
            {isCopied ? <Check size={15} /> : <Copy size={15} />}
            <span>{isCopied ? 'Tersalin ke Clipboard!' : 'Salin Format Teks'}</span>
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
              fontWeight: 600
            }}
          >
            <MessageCircle size={15} />
            <span>Kirim ke WhatsApp</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
