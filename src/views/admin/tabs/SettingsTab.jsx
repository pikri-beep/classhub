import React, { useState, useEffect, useMemo } from 'react';
import {
  Camera,
  Upload,
  RotateCcw,
  Wrench,
  ShieldAlert,
  MessageCircle,
  AlertCircle,
  Wallet,
  BookOpen,
  CalendarDays,
  Calendar,
  Megaphone
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import { processImageFile } from '../../../lib/imageUtils';
import { StatusBadge } from '../../../components/admin';
import { formatDateIndo } from '../../../lib/dateUtils';
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

  // Class Info state
  const [settingsAppName, setSettingsAppName] = useState(data.classInfo?.appName || 'ClassHub');
  const [settingsName, setSettingsName] = useState(data.classInfo?.name || 'XI PPLG');
  const [settingsSchool, setSettingsSchool] = useState(data.classInfo?.school || '');
  const [settingsAcademicYear, setSettingsAcademicYear] = useState(data.classInfo?.academicYear || '2026/2027');
  const [settingsHomeroomTeacher, setSettingsHomeroomTeacher] = useState(data.classInfo?.homeroomTeacher || '');
  const [settingsAdminPin, setSettingsAdminPin] = useState(data.classInfo?.adminPin || 'admin123');
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
      setSettingsAdminPin(data.classInfo.adminPin || 'admin123');
      setSettingsLogoUrl(data.classInfo.logoUrl || '');

      setWaGreeting(data.classInfo.waGreeting !== undefined ? data.classInfo.waGreeting : DEFAULT_WA_GREETING);
      setWaBannerTitle(data.classInfo.waBannerTitle || DEFAULT_WA_BANNER_TITLE);
      setWaFooterNote(data.classInfo.waFooterNote !== undefined ? data.classInfo.waFooterNote : DEFAULT_WA_FOOTER_NOTE);
      setWaClosing(data.classInfo.waClosing !== undefined ? data.classInfo.waClosing : DEFAULT_WA_CLOSING);
      setWaIncludeSchedule(data.classInfo.waIncludeSchedule !== false);
      setWaIncludeTasks(data.classInfo.waIncludeTasks !== false);
      setWaIncludePiket(data.classInfo.waIncludePiket !== false);
      setWaIncludeExams(data.classInfo.waIncludeExams !== false);
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

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateClassInfo({
      appName: settingsAppName.trim() || 'ClassHub',
      name: settingsName.trim() || 'Kelas',
      school: settingsSchool.trim(),
      academicYear: settingsAcademicYear.trim(),
      homeroomTeacher: settingsHomeroomTeacher.trim(),
      adminPin: settingsAdminPin.trim() || 'admin123',
      logoUrl: settingsLogoUrl.trim()
    });
    showToast('Identitas kelas berhasil diperbarui!', 'success');
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

  const handleSaveWaBriefSettings = (e) => {
    e.preventDefault();
    updateClassInfo({
      waGreeting: waGreeting.trim(),
      waBannerTitle: waBannerTitle.trim() || DEFAULT_WA_BANNER_TITLE,
      waFooterNote: waFooterNote.trim(),
      waClosing: waClosing.trim(),
      waIncludeSchedule,
      waIncludeTasks,
      waIncludePiket,
      waIncludeExams
    });
    showToast('Format default WhatsApp Brief berhasil disimpan! 📲', 'success');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Class Identity & Logo Form Card */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Identitas & Branding Kelas</h3>
        </div>

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
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
              fontSize: '1.4rem',
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
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
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
                    style={{ color: 'var(--danger)', fontSize: '0.78rem' }}
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* URL alternatif */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Atau URL Gambar Eksternal
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://contoh.com/logo.png"
              value={settingsLogoUrl.startsWith('data:') ? '' : settingsLogoUrl}
              onChange={(e) => setSettingsLogoUrl(e.target.value)}
              style={{ fontSize: '0.85rem' }}
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

          {/* Master PIN Pengurus */}
          <div className="form-group" style={{ marginBottom: 0, paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Master PIN Pengurus</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masukkan PIN"
              value={settingsAdminPin}
              onChange={(e) => setSettingsAdminPin(e.target.value)}
              style={{ maxWidth: '280px', fontFamily: 'monospace', letterSpacing: '0.05em' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 600, padding: '0.55rem 1.25rem' }}>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      {/* CARD 2: KONTROL STATUS & MAINTENANCE HALAMAN SISWA */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Kontrol Akses & Pemeliharaan Modul</h3>
          </div>
          <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
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
                    backgroundColor: isEnabled ? 'var(--bg-surface)' : 'rgba(239, 68, 68, 0.03)',
                    borderRadius: 'var(--radius-sm)',
                    border: isEnabled ? '1px solid var(--border-subtle)' : '1px solid rgba(239, 68, 68, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '200px', flex: 1 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: isEnabled ? 'var(--bg-hover)' : 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isEnabled ? 'var(--text-secondary)' : 'var(--danger)',
                        flexShrink: 0
                      }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
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
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px dashed rgba(239, 68, 68, 0.2)' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                        <ShieldAlert size={12} />
                        <span>Pesan untuk Siswa:</span>
                      </label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        placeholder={mod.defaultReason}
                        value={modStatus.reason || ''}
                        onChange={(e) => handleReasonPageAccessChange(mod.key, e.target.value)}
                        style={{ fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 600, padding: '0.5rem 1.25rem' }}
            >
              Simpan Status Modul
            </button>
          </div>
        </form>
      </div>

      {/* CARD 3: PENGATURAN DEFAULT WHATSAPP BRIEF */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Template WhatsApp Brief</h3>
          <button
            type="button"
            onClick={onOpenWhatsApp}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', gap: '0.35rem', color: '#16A34A', fontWeight: 600 }}
          >
            <MessageCircle size={14} />
            <span>Pratinjau WA</span>
          </button>
        </div>

        <form onSubmit={handleSaveWaBriefSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Salam Pembuka</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Assalamu'alaikum & selamat malam rekan-rekan! 👋"
              value={waGreeting}
              onChange={(e) => setWaGreeting(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Judul Banner</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: PERSIAPAN KELAS"
                value={waBannerTitle}
                onChange={(e) => setWaBannerTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Catatan / Tautan Portal</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: 🌐 *Buka ClassHub untuk detail lengkap.*"
                value={waFooterNote}
                onChange={(e) => setWaFooterNote(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Pesan Penutup</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Contoh: Selamat istirahat dan jangan lupa persiapkan kebutuhan untuk besok! ✨"
              value={waClosing}
              onChange={(e) => setWaClosing(e.target.value)}
            />
          </div>

          {/* Opsi Toggle Seksi Default */}
          <div style={{ backgroundColor: 'var(--bg)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Seksi yang Disertakan Secara Default:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={waIncludeSchedule}
                  onChange={(e) => setWaIncludeSchedule(e.target.checked)}
                  style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                />
                <span>📅 Jadwal Pembelajaran</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={waIncludeTasks}
                  onChange={(e) => setWaIncludeTasks(e.target.checked)}
                  style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                />
                <span>📝 Deadline Tugas</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={waIncludePiket}
                  onChange={(e) => setWaIncludePiket(e.target.checked)}
                  style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                />
                <span>🧹 Petugas Piket Harian</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={waIncludeExams}
                  onChange={(e) => setWaIncludeExams(e.target.checked)}
                  style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                />
                <span>🎯 Pengingat Ujian</span>
              </label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Pratinjau Hasil Format:
              </span>
              <span className="notion-tag notion-tag-gray" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                Preview
              </span>
            </div>
            <div style={{
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              maxHeight: '180px',
              overflowY: 'auto'
            }}>
              <pre style={{
                margin: 0,
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.75rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'var(--text-primary)'
              }}>
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
              style={{ color: 'var(--text-muted)', fontSize: '0.78rem', gap: '0.3rem' }}
            >
              <RotateCcw size={12} />
              <span>Reset ke Bawaan</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 600, padding: '0.5rem 1.25rem' }}
            >
              Simpan Format
            </button>
          </div>
        </form>
      </div>

      {/* DANGER ZONE: RESET DATA CARD */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--danger-border, #FCA5A5)', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--tag-red-bg)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--danger)', margin: 0 }}>
              Zona Berbahaya: Reset Data Kelas
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem 0', lineHeight: 1.4 }}>
              Tindakan ini akan mengembalikan seluruh jadwal, tugas, pengumuman, dan kas ke data bawaan demo awal.
            </p>

            <button
              type="button"
              onClick={() => {
                if (confirm('PERINGATAN: Apakah Anda benar-benar yakin ingin mereset seluruh data kelas ke kondisi awal? Tindakan ini tidak dapat dibatalkan.')) {
                  resetToDefault();
                  showToast('Seluruh data berhasil di-reset ke bawaan demo awal.', 'info');
                }
              }}
              className="btn btn-sm"
              style={{
                backgroundColor: 'var(--tag-red-bg)',
                borderColor: 'var(--danger)',
                color: 'var(--danger)',
                fontWeight: 600,
                gap: '0.35rem',
                padding: '0.4rem 0.8rem',
                fontSize: '0.78rem'
              }}
            >
              <RotateCcw size={13} />
              <span>Reset Seluruh Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
