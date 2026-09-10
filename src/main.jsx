import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Register Service Worker for PWA
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onRegisteredSW(swScriptUrl, registration) {
    console.log('[PWA] Service Worker aktif:', swScriptUrl);
  },
  onRegisterError(error) {
    console.error('[PWA] Gagal mendaftarkan Service Worker:', error);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <StoreProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  </React.StrictMode>
);
