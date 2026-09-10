import React, { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function InstallBanner() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('classhub_install_banner_dismissed') === 'true';
  });

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('classhub_install_banner_dismissed', 'true');
  };

  const handleInstall = async () => {
    const res = await promptInstall();
    if (res.outcome === 'accepted') {
      setDismissed(true);
    }
  };

  return (
    <div className="install-banner-wrapper" role="alert">
      <div className="install-banner">
        <div className="install-banner-left">
          <div className="install-banner-icon">
            <Smartphone size={18} />
          </div>
          <div className="install-banner-text">
            <div className="install-banner-title">Pasang ClassHub di Layar Utama</div>
            <div className="install-banner-desc">Buka cepat, hemat kuota, dan akses jadwal secara offline.</div>
          </div>
        </div>
        <div className="install-banner-actions">
          <button 
            onClick={handleInstall} 
            className="btn btn-primary btn-sm install-btn"
            id="btn-pwa-install-mobile"
          >
            <Download size={14} />
            <span>Install</span>
          </button>
          <button 
            onClick={handleDismiss} 
            className="btn btn-ghost btn-sm btn-icon"
            aria-label="Tutup pemberitahuan install"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
