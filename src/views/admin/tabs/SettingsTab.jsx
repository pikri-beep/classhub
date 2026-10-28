import React, { useState, useEffect, useMemo } from 'react';
import {
  Camera,
  Upload,
  RotateCcw,
  Wrench,
  MessageCircle,
  AlertCircle,
  Wallet,
  BookOpen,
  CalendarDays,
  Calendar,
  Megaphone,
  Palette,
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldAlert,
  History,
  Send,
  Radio,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import { processImageFile } from '../../../lib/imageUtils';
import { StatusBadge, ConfirmDialog, AuditLogWidget } from '../../../components/admin';
import { formatDateIndo } from '../../../lib/dateUtils';
import { sendTestWhatsAppMessage } from '../../../lib/whatsappService';
import {
  DEFAULT_WA_GREETING,
  DEFAULT_WA_BANNER_TITLE,
  DEFAULT_WA_FOOTER_NOTE,
  DEFAULT_WA_CLOSING
} from '../utils/adminHelpers';

export default function SettingsTab({ onOpenWhatsApp }) {
  const {
    data,
    updateClassInfo,
    updateBulkPageAccess,
    resetToDefault
  } = useStore();
  const { showToast } = useToast();

  // Sub-Tab Navigation: 'identity' | 'security' | 'whatsapp'
  const [activeSubTab, setActiveSubTab] = useState('identity');

  // Security Gate State (Re-Authentication for sensitive area)
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [showUnlockPin, setShowUnlockPin] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [unlockAttempts, setUnlockAttempts] = useState(0);

  // Multi-Step Change PIN State
  const [pinTarget, setPinTarget] = useState('admin'); // 'admin' | 'master'
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinChangeError, setPinChangeError] = useState('');

  // Reset Confirmation State
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Class Info state
  const [settingsAppName, setSettingsAppName] = useState(data.classInfo?.appName || 'ClassHub');
  const [settingsName, setSettingsName] = useState(data.classInfo?.name || 'XI PPLG');
  const [settingsSchool, setSettingsSchool] = useState(data.classInfo?.school || '');
  const [settingsAcademicYear, setSettingsAcademicYear] = useState(data.classInfo?.academicYear || '2026/2027');
  const [settingsHomeroomTeacher, setSettingsHomeroomTeacher] = useState(data.classInfo?.homeroomTeacher || '');
  const [settingsLogoUrl, setSettingsLogoUrl] = useState(data.classInfo?.logoUrl || '');
  const [isProcessingSettingsImg, setIsProcessingSettingsImg] = useState(false);

  // WhatsApp Brief state
  const [waGreeting, setWaGreeting] = useState(data.classInfo?.waGreeting !== undefined ? data.classInfo.waGreeting : DEFAULT_WA_GREETING);
  const [waBannerTitle, setWaBannerTitle] = useState(data.classInfo?.waBannerTitle || DEFAULT_WA_BANNER_TITLE);
  const [waFooterNote, setWaFooterNote] = useState(data.classInfo?.waFooterNote !== undefined ? data.classInfo.waFooterNote : DEFAULT_WA_FOOTER_NOTE);
  const [waClosing, setWaClosing] = useState(data.classInfo?.waClosing !== undefined ? data.classInfo.waClosing : DEFAULT_WA_CLOSING);
  const [waIncludeSchedule, setWaIncludeSchedule] = useState(data.classInfo?.waIncludeSchedule !== false);
  const [waIncludeTasks, setWaIncludeTasks] = useState(data.classInfo?.waIncludeTasks !== false);
  const [waIncludePiket, setWaIncludePiket] = useState(data.classInfo?.waIncludePiket !== false);
  const [waIncludeExams, setWaIncludeExams] = useState(data.classInfo?.waIncludeExams !== false);

  // WhatsApp Gateway & Automation state
  const [waGatewayEnabled, setWaGatewayEnabled] = useState(Boolean(data.classInfo?.waGatewayEnabled));
  const [waProvider, setWaProvider] = useState(data.classInfo?.waProvider || 'fonnte');
  const [waApiToken, setWaApiToken] = useState(data.classInfo?.waApiToken || '');
  const [waTargetGroup, setWaTargetGroup] = useState(data.classInfo?.waTargetGroup || '');
  const [waCustomEndpoint, setWaCustomEndpoint] = useState(data.classInfo?.waCustomEndpoint || '');
  const [waAutoSendSchedule, setWaAutoSendSchedule] = useState(Boolean(data.classInfo?.waAutoSendSchedule));
  const [waAutoSendTime, setWaAutoSendTime] = useState(data.classInfo?.waAutoSendTime || '19:00');
  const [waAutoSendDays, setWaAutoSendDays] = useState(data.classInfo?.waAutoSendDays || ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis']);
  const [showApiToken, setShowApiToken] = useState(false);
  const [isTestingWa, setIsTestingWa] = useState(false);

  // Page Access (Maintenance Mode)
  const defaultPageAccess = useMemo(() => ({
    cash: { isEnabled: true, reason: '' },
    tasks: { isEnabled: true, reason: '' },
    exams: { isEnabled: true, reason: '' },
    schedules: { isEnabled: true, reason: '' },
    announcements: { isEnabled: true, reason: '' }
  }), []);

  const [pageAccessDraft, setPageAccessDraft] = useState(() => ({
    ...defaultPageAccess,
    ...(data?.pageAccess || {})
  }));

  useEffect(() => {
    if (data?.pageAccess) {
      setPageAccessDraft({
        ...defaultPageAccess,
        ...data.pageAccess
      });
    }
  }, [data?.pageAccess, defaultPageAccess]);

  useEffect(() => {
    if (data.classInfo) {
      setSettingsAppName(data.classInfo.appName || 'ClassHub');
      setSettingsName(data.classInfo.name || 'XI PPLG');
      setSettingsSchool(data.classInfo.school || '');
      setSettingsAcademicYear(data.classInfo.academicYear || '2026/2027');
      setSettingsHomeroomTeacher(data.classInfo.homeroomTeacher || '');
      setSettingsLogoUrl(data.classInfo.logoUrl || '');

      setWaGreeting(data.classInfo.waGreeting !== undefined ? data.classInfo.waGreeting : DEFAULT_WA_GREETING);
      setWaBannerTitle(data.classInfo.waBannerTitle || DEFAULT_WA_BANNER_TITLE);
      setWaFooterNote(data.classInfo.waFooterNote !== undefined ? data.classInfo.waFooterNote : DEFAULT_WA_FOOTER_NOTE);
      setWaClosing(data.classInfo.waClosing !== undefined ? data.classInfo.waClosing : DEFAULT_WA_CLOSING);
      setWaIncludeSchedule(data.classInfo.waIncludeSchedule !== false);
      setWaIncludeTasks(data.classInfo.waIncludeTasks !== false);
      setWaIncludePiket(data.classInfo.waIncludePiket !== false);
      setWaIncludeExams(data.classInfo.waIncludeExams !== false);

      setWaGatewayEnabled(Boolean(data.classInfo.waGatewayEnabled));
      setWaProvider(data.classInfo.waProvider || 'fonnte');
      setWaApiToken(data.classInfo.waApiToken || '');
      setWaTargetGroup(data.classInfo.waTargetGroup || '');
      setWaCustomEndpoint(data.classInfo.waCustomEndpoint || '');
      setWaAutoSendSchedule(Boolean(data.classInfo.waAutoSendSchedule));
      setWaAutoSendTime(data.classInfo.waAutoSendTime || '19:00');
      setWaAutoSendDays(data.classInfo.waAutoSendDays || ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis']);
    }
  }, [data.classInfo]);

  const handleSettingsLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingSettingsImg(true);
      const dataUrl = await processImageFile(file, 320, 0.85);
      setSettingsLogoUrl(dataUrl);
      showToast('Gambar berhasil dimuat dan dikompresi!', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal memproses gambar', 'error');
    } finally {
      setIsProcessingSettingsImg(false);
    }
  };

  const handleSaveIdentity = (e) => {
    e.preventDefault();
    updateClassInfo({
      appName: settingsAppName.trim() || 'ClassHub',
      name: settingsName.trim() || 'Kelas',
      school: settingsSchool.trim(),
      academicYear: settingsAcademicYear.trim(),
      homeroomTeacher: settingsHomeroomTeacher.trim(),
      logoUrl: settingsLogoUrl.trim()
    });
    showToast('Identitas & profil kelas berhasil diperbarui! 🎉', 'success');
  };

  // Security Gate Authentication Handler
  const handleUnlockSecurity = (e) => {
    e.preventDefault();
    setUnlockError('');
    const expectedMasterPin = (data.classInfo?.masterPin || 'master123').trim();
    if (unlockPinInput.trim() === expectedMasterPin) {
      setIsSecurityUnlocked(true);
      setUnlockPinInput('');
      setUnlockAttempts(0);
      showToast('Akses Area Terlindungi berhasil dibuka! 🔓', 'success');
    } else {
      const nextAttempts = unlockAttempts + 1;
      setUnlockAttempts(nextAttempts);
      setUnlockError('Master PIN Keamanan salah. Akses ditolak.');
      showToast('Master PIN Keamanan salah!', 'error');
    }
  };

  const handleLockSecurity = () => {
    setIsSecurityUnlocked(false);
    setUnlockPinInput('');
    setUnlockError('');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmNewPinInput('');
    setPinChangeError('');
    showToast('Akses area sensitif telah dikunci kembali. 🔒', 'info');
  };

  // Multi-Step Change PIN Handler (Admin PIN vs Master PIN)
  const handleChangePin = (e) => {
    e.preventDefault();
    setPinChangeError('');

    const isMaster = pinTarget === 'master';
    const expectedPin = isMaster
      ? (data.classInfo?.masterPin || 'master123').trim()
      : (data.classInfo?.adminPin || 'admin123').trim();

    if (currentPinInput.trim() !== expectedPin) {
      const errMsg = isMaster ? 'Master PIN Saat Ini salah.' : 'PIN Pengurus Saat Ini tidak sesuai.';
      setPinChangeError(errMsg);
      showToast(errMsg, 'error');
      return;
    }

    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      setPinChangeError('PIN Baru minimal 4 karakter demi keamanan.');
      showToast('PIN Baru minimal 4 karakter!', 'warning');
      return;
    }

    if (newPinInput.trim() !== confirmNewPinInput.trim()) {
      setPinChangeError('Konfirmasi PIN Baru tidak cocok dengan PIN Baru.');
      showToast('Konfirmasi PIN tidak cocok!', 'error');
      return;
    }

    if (isMaster) {
      updateClassInfo({
        masterPin: newPinInput.trim()
      });
      showToast('Master PIN Keamanan berhasil diperbarui! 🛡️', 'success');
    } else {
      updateClassInfo({
        adminPin: newPinInput.trim()
      });
      showToast('PIN Pengurus Harian berhasil diperbarui! 🔑', 'success');
    }

    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmNewPinInput('');
    setPinChangeError('');
  };

  const handleTogglePageAccess = (pageKey) => {
    setPageAccessDraft(prev => {
      const current = prev[pageKey] || { isEnabled: true, reason: '' };
      return {
        ...prev,
        [pageKey]: {
          ...current,
          isEnabled: !current.isEnabled
        }
      };
    });
  };

  const handleReasonPageAccessChange = (pageKey, reason) => {
    setPageAccessDraft(prev => {
      const current = prev[pageKey] || { isEnabled: true, reason: '' };
      return {
        ...prev,
        [pageKey]: {
          ...current,
          reason
        }
      };
    });
  };

  const handleSavePageAccess = (e) => {
    e.preventDefault();
    if (updateBulkPageAccess) {
      updateBulkPageAccess(pageAccessDraft);
    }
    showToast('Status akses halaman siswa berhasil disimpan!', 'success');
  };

  const handleConfirmResetData = async () => {
    try {
      setIsResetting(true);
      resetToDefault();
      setIsResetConfirmOpen(false);
      setIsSecurityUnlocked(false);
      showToast('Seluruh data berhasil di-reset ke kondisi demo awal.', 'info');
    } catch (err) {
      showToast('Gagal mereset data.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveWaBriefSettings = (e) => {
    if (e) e.preventDefault();
    updateClassInfo({
      waGreeting: waGreeting.trim(),
      waBannerTitle: waBannerTitle.trim() || DEFAULT_WA_BANNER_TITLE,
      waFooterNote: waFooterNote.trim(),
      waClosing: waClosing.trim(),
      waIncludeSchedule,
      waIncludeTasks,
      waIncludePiket,
      waIncludeExams,
      waGatewayEnabled,
      waProvider,
      waApiToken: waApiToken.trim(),
      waTargetGroup: waTargetGroup.trim(),
      waCustomEndpoint: waCustomEndpoint.trim(),
      waAutoSendSchedule,
      waAutoSendTime,
      waAutoSendDays
    });
    showToast('Pengaturan WhatsApp & Otomasi Grup berhasil disimpan! 📲', 'success');
  };

  const handleTestWhatsAppConnection = async () => {
    if (!waTargetGroup) {
      showToast('Target ID Grup WhatsApp belum diisi! Masukkan ID grup terlebih dahulu.', 'warning');
      return;
    }
    if (waProvider !== 'webhook' && !waApiToken) {
      showToast('API Token WhatsApp belum diisi!', 'warning');
      return;
    }

    setIsTestingWa(true);
    try {
      const result = await sendTestWhatsAppMessage({
        provider: waProvider,
        token: waApiToken,
        target: waTargetGroup,
        customEndpoint: waCustomEndpoint,
        className: settingsName || 'XI PPLG'
      });

      if (result.success) {
        showToast('✅ Pesan uji coba berhasil terkirim ke grup WhatsApp!', 'success');
      } else {
        showToast(`❌ Uji coba gagal: ${result.error}`, 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsTestingWa(false);
    }
  };

  const handleResetWaBriefSettings = () => {
    setWaGreeting(DEFAULT_WA_GREETING);
    setWaBannerTitle(DEFAULT_WA_BANNER_TITLE);
    setWaFooterNote(DEFAULT_WA_FOOTER_NOTE);
    setWaClosing(DEFAULT_WA_CLOSING);
    setWaIncludeSchedule(true);
    setWaIncludeTasks(true);
    setWaIncludePiket(true);
    setWaIncludeExams(true);

    updateClassInfo({
      waGreeting: DEFAULT_WA_GREETING,
      waBannerTitle: DEFAULT_WA_BANNER_TITLE,
      waFooterNote: DEFAULT_WA_FOOTER_NOTE,
      waClosing: DEFAULT_WA_CLOSING,
      waIncludeSchedule: true,
      waIncludeTasks: true,
      waIncludePiket: true,
      waIncludeExams: true
    });
    showToast('Format WhatsApp Brief dikembalikan ke bawaan.', 'info');
  };

  const previewBriefText = useMemo(() => {
    const lines = [];
    if (waGreeting.trim()) {
      lines.push(waGreeting.trim());
      lines.push('');
    }
    lines.push(`📚 *${(waBannerTitle.trim() || DEFAULT_WA_BANNER_TITLE)} — BESOK*`);
    lines.push(`🗓️ ${formatDateIndo(new Date(Date.now() + 86400000).toISOString().split('T')[0])}`);
    lines.push(`━━━━━━━━━━━━━━━━━━`);

    if (waIncludeSchedule) {
      lines.push('');
      lines.push(`📅 *JADWAL BESOK*`);
      lines.push(`1. Bahasa Indonesia`);
      lines.push(`2. Pemrograman Web`);
    }

    if (waIncludeTasks) {
      lines.push('');
      lines.push(`📝 *DEADLINE BESOK*`);
      lines.push(`1. Pemrograman Web — Praktikum REST API`);
    }

    if (waIncludePiket) {
      lines.push('');
      lines.push(`🧹 *PIKET BESOK*`);
      lines.push(`1. Ahmad Fikry Al Khair`);
      lines.push(`2. Ardyansyah`);
    }

    if (waIncludeExams) {
      lines.push('');
      lines.push(`🎯 *UJIAN TERDEKAT*`);
      lines.push(`1. Basis Data (Jumat, 2 Okt)`);
    }

    lines.push('');
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    if (waFooterNote.trim()) {
      lines.push(waFooterNote.trim());
      lines.push('');
    }
    if (waClosing.trim()) {
      lines.push(waClosing.trim());
    }
    return lines.join('\n');
  }, [waGreeting, waBannerTitle, waFooterNote, waClosing, waIncludeSchedule, waIncludeTasks, waIncludePiket, waIncludeExams]);

  const renderSecurityLockCard = (description) => (
    <div className="admin-security-lock-card">
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--primary-soft)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--primary-border)'
      }}>
        <Lock size={28} strokeWidth={2.2} />
      </div>

      <div>
        <h3 className="admin-settings-title">
          Area Terlindungi (Master PIN Required)
        </h3>
        <p className="admin-settings-desc" style={{ maxWidth: '440px', margin: '0.35rem auto 0 auto' }}>
          {description || 'Bagian ini dilindungi oleh Master PIN Keamanan khusus (terpisah dari PIN login harian). Masukkan Master PIN untuk membuka kunci.'}
        </p>
      </div>

      <form onSubmit={handleUnlockSecurity} style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type={showUnlockPin ? 'text' : 'password'}
            className="form-input"
            placeholder="Masukkan Master PIN Keamanan..."
            value={unlockPinInput}
            onChange={(e) => { setUnlockPinInput(e.target.value); setUnlockError(''); }}
            style={{
              textAlign: 'center',
              letterSpacing: showUnlockPin ? '0.05em' : '0.25em',
              fontSize: '0.9375rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              paddingRight: '2.75rem'
            }}
            autoFocus
            required
          />
          <button
            type="button"
            onClick={() => setShowUnlockPin(!showUnlockPin)}
            style={{
              position: 'absolute',
              right: '0.65rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
            title={showUnlockPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
          >
            {showUnlockPin ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {unlockError && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--danger)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}>
            <AlertCircle size={14} />
            <span>{unlockError}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, width: '100%', justifyContent: 'center', padding: '0.65rem 1rem' }}>
          <Unlock size={16} />
          <span>Buka Kunci Akses Keamanan</span>
        </button>
      </form>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Sub-Tabs Navigation */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{
            fontSize: '1.375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Identitas & Pengaturan
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Kelola profil kelas, kontrol keamanan sistem, dan format pengingat WhatsApp
          </p>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="admin-subtabs-nav">
          <button
            type="button"
            onClick={() => setActiveSubTab('identity')}
            className={`admin-subtab-btn ${activeSubTab === 'identity' ? 'active' : ''}`}
          >
            <Palette size={15} />
            <span>Identitas & Profil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('security')}
            className={`admin-subtab-btn ${activeSubTab === 'security' ? 'active' : ''}`}
          >
            <ShieldCheck size={15} />
            <span>Keamanan & Akses Modul</span>
            {!isSecurityUnlocked && (
              <Lock size={12} style={{ color: 'var(--text-muted)', marginLeft: '-0.15rem' }} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('whatsapp')}
            className={`admin-subtab-btn ${activeSubTab === 'whatsapp' ? 'active' : ''}`}
          >
            <MessageCircle size={15} />
            <span>WhatsApp & Otomasi</span>
            {waGatewayEnabled && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--success, #22c55e)',
                display: 'inline-block',
                marginLeft: '0.15rem'
              }} title="Gateway Aktif" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit')}
            className={`admin-subtab-btn ${activeSubTab === 'audit' ? 'active' : ''}`}
          >
            <History size={15} />
            <span>Riwayat & Audit Log</span>
            {!isSecurityUnlocked && (
              <Lock size={12} style={{ color: 'var(--text-muted)', marginLeft: '-0.15rem' }} />
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB 1: IDENTITAS & BRANDING PROFIL KELAS
          ========================================================================= */}
      {activeSubTab === 'identity' && (
        <div className="admin-settings-card">
          <div className="admin-settings-card-header">
            <div>
              <h3 className="admin-settings-title">
                Identitas & Profil Kelas
              </h3>
              <p className="admin-settings-desc">
                Nama dan foto ini akan ditampilkan pada seluruh header, kartu pengenal, dan portal publik siswa.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveIdentity} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Logo / Foto Kelas Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-soft)',
                border: '1px solid var(--primary-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '1.375rem',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {settingsLogoUrl ? (
                  <img src={settingsLogoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Camera size={26} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Logo / Foto Kelas
                </label>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', gap: '0.35rem', fontWeight: 600 }}>
                    <Upload size={14} />
                    <span>{isProcessingSettingsImg ? 'Memproses...' : 'Pilih Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSettingsLogoFileChange}
                      style={{ display: 'none' }}
                      disabled={isProcessingSettingsImg}
                    />
                  </label>

                  {settingsLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setSettingsLogoUrl('')}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* URL alternatif */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Atau URL Gambar Eksternal
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://contoh.com/logo.png"
                value={settingsLogoUrl.startsWith('data:') ? '' : settingsLogoUrl}
                onChange={(e) => setSettingsLogoUrl(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Nama Web / Aplikasi</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ClassHub"
                  value={settingsAppName}
                  onChange={(e) => setSettingsAppName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Nama Kelas</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: XII PPLG 1"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Nama Sekolah</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: SMK Negeri 1 Cibinong"
                value={settingsSchool}
                onChange={(e) => setSettingsSchool(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Tahun Ajaran</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="2026/2027"
                  value={settingsAcademicYear}
                  onChange={(e) => setSettingsAcademicYear(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Wali Kelas</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nama Guru Pengampu"
                  value={settingsHomeroomTeacher}
                  onChange={(e) => setSettingsHomeroomTeacher(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: 600, padding: '0.55rem 1.35rem' }}>
                Simpan Identitas Kelas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: KEAMANAN & AKSES SISTEM (MODUL & PIN)
          ========================================================================= */}
      {activeSubTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 1. JIKA TERKUNCI: TAMPILKAN SECURITY GATE UNLOCK CARD */}
          {!isSecurityUnlocked ? (
            renderSecurityLockCard(
              'Bagian ini berisi pengelolaan Master PIN, pemeliharaan modul publik siswa, dan reset database. Masukkan Master PIN pengurus kelas untuk membuka kunci.'
            )
          ) : (
            /* 2. JIKA SUDAH TERBUKA: TAMPILKAN KONTROL LENGKAP */
            <>
              {/* CARD 1: FORM PENGGANTIAN PIN BERTINGKAT (MASKED & MULTI-STEP) */}
              <div className="admin-settings-card">
                <div className="admin-settings-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <KeyRound size={18} color="var(--primary)" />
                    <div>
                      <h3 className="admin-settings-title">
                        Pengelolaan PIN Akses & Keamanan
                      </h3>
                      <p className="admin-settings-desc">
                        Kelola PIN Pengurus Harian untuk login biasa dan Master PIN untuk proteksi area sensitif.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLockSecurity}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border-subtle)',
                      flexShrink: 0
                    }}
                    title="Kunci kembali area terlindungi"
                  >
                    <Lock size={13} color="var(--primary)" />
                    <span>Kunci Kembali</span>
                  </button>
                </div>

                {/* Switcher Target PIN */}
                <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPinTarget('admin');
                      setPinChangeError('');
                      setCurrentPinInput('');
                      setNewPinInput('');
                      setConfirmNewPinInput('');
                    }}
                    className={`clean-filter-chip ${pinTarget === 'admin' ? 'active' : ''}`}
                    style={{ fontWeight: 600, fontSize: '0.8rem', padding: '0.35rem 0.85rem', cursor: 'pointer' }}
                  >
                    🔑 PIN Pengurus Harian
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPinTarget('master');
                      setPinChangeError('');
                      setCurrentPinInput('');
                      setNewPinInput('');
                      setConfirmNewPinInput('');
                    }}
                    className={`clean-filter-chip ${pinTarget === 'master' ? 'active' : ''}`}
                    style={{ fontWeight: 600, fontSize: '0.8rem', padding: '0.35rem 0.85rem', cursor: 'pointer' }}
                  >
                    🛡️ Master PIN Keamanan
                  </button>
                </div>

                <form onSubmit={handleChangePin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '520px' }}>
                  {/* Field 1: PIN Saat Ini */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      PIN Saat Ini
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPin ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Masukkan PIN saat ini..."
                        value={currentPinInput}
                        onChange={(e) => { setCurrentPinInput(e.target.value); setPinChangeError(''); }}
                        style={{ fontFamily: 'monospace', letterSpacing: showCurrentPin ? '0.05em' : '0.2em', paddingRight: '2.5rem' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPin(!showCurrentPin)}
                        style={{
                          position: 'absolute',
                          right: '0.65rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.25rem'
                        }}
                      >
                        {showCurrentPin ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                    {/* Field 2: PIN Baru */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>PIN Baru (Min. 4 Karakter)</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPin ? 'text' : 'password'}
                          className="form-input"
                          placeholder="PIN baru..."
                          value={newPinInput}
                          onChange={(e) => { setNewPinInput(e.target.value); setPinChangeError(''); }}
                          style={{ fontFamily: 'monospace', letterSpacing: showNewPin ? '0.05em' : '0.2em', paddingRight: '2.5rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPin(!showNewPin)}
                          style={{
                            position: 'absolute',
                            right: '0.65rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                        >
                          {showNewPin ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Field 3: Konfirmasi PIN Baru */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Ulangi PIN Baru</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPin ? 'text' : 'password'}
                          className="form-input"
                          placeholder="Ketik Ulang PIN..."
                          value={confirmNewPinInput}
                          onChange={(e) => { setConfirmNewPinInput(e.target.value); setPinChangeError(''); }}
                          style={{ fontFamily: 'monospace', letterSpacing: showConfirmPin ? '0.05em' : '0.2em', paddingRight: '2.5rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPin(!showConfirmPin)}
                          style={{
                            position: 'absolute',
                            right: '0.65rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                        >
                          {showConfirmPin ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {pinChangeError && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={14} />
                      <span>{pinChangeError}</span>
                    </div>
                  )}

                  <div>
                    <button type="submit" className="btn btn-primary" style={{ fontWeight: 600, padding: '0.55rem 1.25rem' }}>
                      {pinTarget === 'admin' ? 'Perbarui PIN Pengurus' : 'Perbarui Master PIN'}
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD 2: KONTROL AKSES & PEMELIHARAAN MODUL SISWA */}
              <div className="admin-settings-card">
                <div className="admin-settings-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wrench size={18} color="var(--primary)" />
                    <div>
                      <h3 className="admin-settings-title">
                        Kontrol Akses & Pemeliharaan Modul Siswa
                      </h3>
                      <p className="admin-settings-desc">
                        Nonaktifkan modul tertentu jika sedang dalam perbaikan atau audit data.
                      </p>
                    </div>
                  </div>
                  <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Akses Siswa
                  </span>
                </div>

                <form onSubmit={handleSavePageAccess} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      {
                        key: 'cash',
                        name: 'Kas & Keuangan Kelas',
                        icon: Wallet,
                        defaultReason: 'Bendahara sedang melakukan audit dan rekonsiliasi buku kas.'
                      },
                      {
                        key: 'tasks',
                        name: 'Daftar Tugas Kelas',
                        icon: BookOpen,
                        defaultReason: 'Pengurus kelas sedang memperbarui tenggat waktu dan daftar tugas.'
                      },
                      {
                        key: 'exams',
                        name: 'Jadwal Ujian',
                        icon: CalendarDays,
                        defaultReason: 'Jadwal ujian sedang direvisi oleh kurikulum sekolah.'
                      },
                      {
                        key: 'schedules',
                        name: 'Jadwal Pelajaran & Piket',
                        icon: Calendar,
                        defaultReason: 'Jadwal pelajaran sedang disesuaikan untuk semester berjalan.'
                      },
                      {
                        key: 'announcements',
                        name: 'Pengumuman Kelas',
                        icon: Megaphone,
                        defaultReason: 'Pengumuman kelas sedang dipersiapkan oleh wali kelas.'
                      }
                    ].map(mod => {
                      const Icon = mod.icon;
                      const modStatus = pageAccessDraft[mod.key] || { isEnabled: true, reason: '' };
                      const isEnabled = modStatus.isEnabled !== false;

                      return (
                        <div
                          key={mod.key}
                          style={{
                            padding: '0.85rem 1rem',
                            backgroundColor: isEnabled ? 'var(--bg-surface)' : 'var(--tag-red-bg)',
                            borderRadius: 'var(--radius-sm)',
                            border: isEnabled ? '1px solid var(--border-subtle)' : '1px solid var(--danger)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '200px', flex: 1 }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-xs)',
                                backgroundColor: isEnabled ? 'var(--bg-hover)' : 'var(--tag-red-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isEnabled ? 'var(--text-secondary)' : 'var(--danger)',
                                flexShrink: 0
                              }}>
                                <Icon size={16} />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                                  {mod.name}
                                </h4>
                                {isEnabled ? (
                                  <StatusBadge variant="success" size="sm">Aktif</StatusBadge>
                                ) : (
                                  <StatusBadge variant="danger" size="sm">Pemeliharaan</StatusBadge>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleTogglePageAccess(mod.key)}
                              className={`btn ${isEnabled ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                padding: '0.3rem 0.75rem',
                                backgroundColor: isEnabled ? 'transparent' : 'var(--danger)',
                                borderColor: isEnabled ? 'var(--border-subtle)' : 'var(--danger)',
                                color: isEnabled ? 'var(--text-secondary)' : '#FFFFFF'
                              }}
                            >
                              {isEnabled ? 'Matikan Akses' : 'Aktifkan'}
                            </button>
                          </div>

                          {!isEnabled && (
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px dashed var(--danger)' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                                <AlertCircle size={12} />
                                Alasan Pemeliharaan (Dilihat oleh siswa saat membuka halaman):
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                value={modStatus.reason || ''}
                                placeholder={mod.defaultReason}
                                onChange={(e) => handleReasonPageAccessChange(mod.key, e.target.value)}
                                style={{ fontSize: '0.875rem' }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ fontWeight: 600, padding: '0.5rem 1.25rem' }}>
                      Simpan Status Akses
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD 3: ZONA BERBAHAYA: RESET DATA KELAS */}
              <div className="admin-settings-card" style={{ borderColor: 'var(--danger)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--tag-red-bg)',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ShieldAlert size={20} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--danger)', margin: 0 }}>
                      Zona Berbahaya: Reset Data Kelas
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.85rem 0', lineHeight: 1.45 }}>
                      Tindakan ini akan mengembalikan seluruh jadwal, tugas, pengumuman, dan kas ke data bawaan demo awal. Seluruh data baru akan hilang.
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsResetConfirmOpen(true)}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: 'var(--tag-red-bg)',
                        borderColor: 'var(--danger)',
                        color: 'var(--danger)',
                        fontWeight: 600,
                        gap: '0.35rem',
                        padding: '0.45rem 0.95rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <RotateCcw size={13} />
                      <span>Reset Seluruh Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: FORMAT PESAN WHATSAPP PINTAR
          ========================================================================= */}
      {activeSubTab === 'whatsapp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* KARTU 1: FORMAT TEMPLATE PESAN WHATSAPP BRIEF */}
          <div className="admin-settings-card">
            <div className="admin-settings-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={18} color="var(--success)" />
                <div>
                  <h3 className="admin-settings-title">
                    Format Pesan WhatsApp Pintar (Daily Brief)
                  </h3>
                  <p className="admin-settings-desc">
                    Atur template susunan briefing harian yang akan otomatis dirangkum saat menekan tombol WhatsApp Brief.
                  </p>
                </div>
              </div>
              <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Template Brief
              </span>
            </div>

            <form onSubmit={handleSaveWaBriefSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Kalimat Pembuka / Salam</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Assalamu'alaikum wr. wb. & Selamat malam teman-teman..."
                    value={waGreeting}
                    onChange={(e) => setWaGreeting(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Judul Pengingat</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="BRIEFING KELAS"
                    value={waBannerTitle}
                    onChange={(e) => setWaBannerTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Catatan Kaki / Pengingat Khusus</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="📌 Harap rapikan tugas sebelum jam pelajaran pertama dimulai."
                  value={waFooterNote}
                  onChange={(e) => setWaFooterNote(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Kalimat Penutup / Signature</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Semangat belajarnya, Pengurus Kelas XI PPLG"
                  value={waClosing}
                  onChange={(e) => setWaClosing(e.target.value)}
                />
              </div>

              {/* Pilihan Modul yang Disertakan */}
              <div>
                <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.45rem', display: 'block' }}>
                  Pilihan Konten Pengingat:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={waIncludeSchedule}
                      onChange={(e) => setWaIncludeSchedule(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span>📅 Jadwal Pelajaran</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={waIncludeTasks}
                      onChange={(e) => setWaIncludeTasks(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span>📝 Deadline Tugas</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={waIncludePiket}
                      onChange={(e) => setWaIncludePiket(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span>🧹 Petugas Piket</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={waIncludeExams}
                      onChange={(e) => setWaIncludeExams(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span>🎯 Pengingat Ujian</span>
                  </label>
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Pratinjau Hasil Format:
                  </span>
                  <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem' }}>
                    Preview
                  </span>
                </div>
                <div className="admin-wa-preview-box">
                  <pre className="admin-wa-preview-text">
                    {previewBriefText}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={handleResetWaBriefSettings}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--text-muted)', fontSize: '0.75rem', gap: '0.3rem' }}
                >
                  <RotateCcw size={12} />
                  <span>Reset ke Bawaan</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 600, padding: '0.5rem 1.25rem' }}
                >
                  Simpan Format Template
                </button>
              </div>
            </form>
          </div>

          {/* KARTU 2: INTEGRASI WHATSAPP GATEWAY & OTOMASI GRUP KELAS */}
          <div className="admin-settings-card">
            <div className="admin-settings-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Radio size={18} color="var(--primary)" />
                <div>
                  <h3 className="admin-settings-title">
                    Integrasi WhatsApp Gateway & Otomasi Grup Kelas
                  </h3>
                  <p className="admin-settings-desc">
                    Hubungkan API WhatsApp gateway (Fonnte, Wablas, atau Webhook) agar pesan briefing harian otomatis terkirim langsung ke grup kelas XI PPLG.
                  </p>
                </div>
              </div>
              <span className={`notion-tag ${waGatewayEnabled ? 'notion-tag-green' : 'notion-tag-gray'}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {waGatewayEnabled ? 'Gateway Aktif' : 'Nonaktif'}
              </span>
            </div>

            <form onSubmit={handleSaveWaBriefSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Toggle Master Gateway */}
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Aktifkan Pengiriman Otomatis ke Grup WhatsApp
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Izinkan sistem mengirimkan pesan WhatsApp brief langsung ke grup kelas tanpa perlu konfirmasi manual satu per satu.
                  </div>
                </div>

                <label className="toggle-switch" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={waGatewayEnabled}
                    onChange={(e) => setWaGatewayEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.82rem', fontWeight: 600 }}>
                    {waGatewayEnabled ? 'Aktif' : 'Mati'}
                  </span>
                </label>
              </div>

              {waGatewayEnabled && (
                <>
                  {/* Grid Konfigurasi Gateway */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    {/* Provider */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Penyedia WhatsApp Gateway
                      </label>
                      <select
                        className="form-input"
                        value={waProvider}
                        onChange={(e) => setWaProvider(e.target.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="fonnte">Fonnte (Rekomendasi Indonesia — Stabil & Cepat)</option>
                        <option value="wablas">Wablas Gateway</option>
                        <option value="webhook">Custom Webhook / REST Bot API</option>
                      </select>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                        {waProvider === 'fonnte' && 'Menggunakan endpoint resmi https://api.fonnte.com/send'}
                        {waProvider === 'wablas' && 'Menggunakan endpoint resmi https://phone.wablas.com'}
                        {waProvider === 'webhook' && 'Kirim payload JSON ke endpoint server atau n8n/bot kustom Anda.'}
                      </span>
                    </div>

                    {/* Target Group ID */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Target ID Grup WhatsApp</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 400 }}>Format: ...@g.us</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Contoh: 120363012345678901@g.us"
                        value={waTargetGroup}
                        onChange={(e) => setWaTargetGroup(e.target.value)}
                        required={waGatewayEnabled}
                      />
                    </div>
                  </div>

                  {/* API Token Input */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      API Token / Secret Key ({waProvider.toUpperCase()})
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showApiToken ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Masukkan API Token / Authorization Key..."
                        value={waApiToken}
                        onChange={(e) => setWaApiToken(e.target.value)}
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiToken(prev => !prev)}
                        style={{
                          position: 'absolute',
                          right: '0.6rem',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={showApiToken ? 'Sembunyikan Token' : 'Lihat Token'}
                      >
                        {showApiToken ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      Token dapat diperoleh dari menu <strong>Device</strong> di dashboard penyedia Anda (misal: <em>fonnte.com</em>).
                    </span>
                  </div>

                  {/* Custom Webhook URL (jika provider webhook) */}
                  {waProvider === 'webhook' && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        URL Endpoint Webhook / Bot API
                      </label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://api.domain-anda.com/send-message"
                        value={waCustomEndpoint}
                        onChange={(e) => setWaCustomEndpoint(e.target.value)}
                        required={waProvider === 'webhook'}
                      />
                    </div>
                  )}

                  {/* Panduan Mendapatkan ID Grup WhatsApp */}
                  <div style={{
                    padding: '0.75rem 0.95rem',
                    backgroundColor: 'var(--hover-bg)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--border)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <HelpCircle size={14} style={{ color: 'var(--primary)' }} />
                      <span>Cara Mudah Mendapatkan ID Grup WhatsApp:</span>
                    </div>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                      <li>Pastikan nomor WhatsApp bot Anda sudah terdaftar dan terhubung di dashboard Fonnte / Wablas.</li>
                      <li>Undang nomor bot masuk ke dalam grup WhatsApp kelas XI PPLG.</li>
                      <li>Buka menu <strong>Groups</strong> di dashboard Fonnte untuk melihat daftar ID grup yang berakhiran <code>@g.us</code>, lalu salin ke kolom di atas.</li>
                    </ol>
                  </div>

                  {/* Bagian Jadwal Otomatis Harian */}
                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                          <span>Jadwal Pengiriman Otomatis Harian (Daily Auto-Send)</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Sistem akan mengirimkan rangkuman KBM besok secara berkala ke grup WhatsApp saat portal aktif.
                        </div>
                      </div>

                      <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '0.4rem' }}>
                        <input
                          type="checkbox"
                          checked={waAutoSendSchedule}
                          onChange={(e) => setWaAutoSendSchedule(e.target.checked)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Jadwal Aktif</span>
                      </label>
                    </div>

                    {waAutoSendSchedule && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontWeight: 600 }}>Jam Pengiriman (WIB)</label>
                          <input
                            type="time"
                            className="form-input"
                            value={waAutoSendTime}
                            onChange={(e) => setWaAutoSendTime(e.target.value)}
                            required
                          />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                            Waktu rekomendasi: <strong>19:00 WIB</strong> (malam sebelum KBM).
                          </span>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                            Hari Pengiriman Aktif:
                          </label>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => {
                              const isChecked = Array.isArray(waAutoSendDays) && waAutoSendDays.includes(day);
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    if (isChecked) {
                                      setWaAutoSendDays(waAutoSendDays.filter(d => d !== day));
                                    } else {
                                      setWaAutoSendDays([...waAutoSendDays, day]);
                                    }
                                  }}
                                  className={`btn btn-xs ${isChecked ? 'btn-primary' : 'btn-ghost'}`}
                                  style={{ fontSize: '0.72rem', borderRadius: 'var(--radius-full)' }}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                            Rekomendasi: <em>Minggu s/d Kamis</em> untuk briefing jadwal Senin s/d Jumat.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Pengiriman Terakhir */}
                  <div style={{
                    padding: '0.75rem 0.95rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    fontSize: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <CheckCircle2 size={15} style={{ color: data.classInfo?.waLastAutoSentStatus === 'success' ? 'var(--success)' : 'var(--text-muted)' }} />
                      <span>
                        <strong>Status Terakhir:</strong>{' '}
                        {data.classInfo?.waLastAutoSentDate
                          ? `Terkirim pada ${data.classInfo.waLastAutoSentDate} (${data.classInfo?.waLastAutoSentStatus || 'ok'})`
                          : 'Belum pernah dikirim otomatis'}
                      </span>
                    </div>

                    {data.classInfo?.waLastAutoSentTime && (
                      <span style={{ color: 'var(--text-muted)' }}>
                        {new Date(data.classInfo.waLastAutoSentTime).toLocaleTimeString('id-ID')} WIB
                      </span>
                    )}
                  </div>

                  {/* Tombol Aksi Gateway */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border)'
                  }}>
                    <button
                      type="button"
                      onClick={handleTestWhatsAppConnection}
                      disabled={isTestingWa}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.4rem', fontWeight: 600 }}
                      title="Kirim pesan tes ke grup WhatsApp untuk memverifikasi koneksi API dan ID grup"
                    >
                      {isTestingWa ? (
                        <>
                          <Loader2 size={14} className="spin" />
                          <span>Menguji Koneksi...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>🧪 Uji Coba Kirim ke Grup</span>
                        </>
                      )}
                    </button>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {onOpenWhatsApp && (
                        <button
                          type="button"
                          onClick={onOpenWhatsApp}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.8rem' }}
                        >
                          Buka Dialog Briefing
                        </button>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        style={{ fontWeight: 600, padding: '0.5rem 1.25rem' }}
                      >
                        Simpan Konfigurasi Otomasi
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!waGatewayEnabled && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ fontWeight: 600 }}
                  >
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: RIWAYAT & AUDIT LOG AKTIVITAS SISTEM
          ========================================================================= */}
      {activeSubTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isSecurityUnlocked ? (
            renderSecurityLockCard(
              'Riwayat log aktivitas bersifat terlindungi. Masukkan Master PIN pengurus kelas untuk membuka kunci riwayat log.'
            )
          ) : (
            <AuditLogWidget onLockSecurity={handleLockSecurity} />
          )}
        </div>
      )}

      {/* CONFIRM DIALOG UNTUK RESET DATA KELAS */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmResetData}
        title="Reset Seluruh Data Kelas ke Awal?"
        message="PERINGATAN: Seluruh jadwal pelajaran, tugas kelas, agenda ujian, riwayat kas, dan pengumuman akan dikembalikan ke data demo awal. Tindakan ini tidak dapat dibatalkan."
        confirmLabel={isResetting ? "Mereset Data..." : "Ya, Reset Seluruh Data"}
        cancelLabel="Batal"
        variant="danger"
        isLoading={isResetting}
      />
    </div>
  );
}
