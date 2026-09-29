import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStore } from './StoreContext';

const ADMIN_AUTH_KEY = 'classhub_admin_auth_v1';

const AuthContext = createContext();

export const PUBLIC_CLASS_USER = {
  id: 'public-student',
  name: 'Siswa',
  role: 'student',
  roleTitle: 'Siswa',
  avatarText: 'CH',
  authRole: 'student',
  isMasterAdmin: false
};

export const ADMIN_USER = {
  id: 'master-admin',
  name: 'Administrator Kelas',
  role: 'admin',
  roleTitle: 'Pengurus / Wali Kelas',
  avatarText: 'AD',
  authRole: 'admin',
  isMasterAdmin: true
};

const generateAdminToken = (pin) => {
  if (!pin) return '';
  let hash = 0;
  const str = `classhub_auth_v2_salt_${pin.trim()}_secure`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `adm_${Math.abs(hash).toString(36)}`;
};

export function AuthProvider({ children }) {
  const { data } = useStore();
  const currentAdminPin = (data?.classInfo?.adminPin || 'admin123').trim();
  
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      const storedToken = localStorage.getItem(ADMIN_AUTH_KEY);
      const expectedToken = generateAdminToken(currentAdminPin);
      return Boolean(storedToken && storedToken === expectedToken);
    } catch (e) {
      return false;
    }
  });

  const [previewAsStudent, setPreviewAsStudent] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);

  // Validate session when admin PIN changes or on sync
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(ADMIN_AUTH_KEY);
      const expectedToken = generateAdminToken(currentAdminPin);
      if (isAdminLoggedIn) {
        localStorage.setItem(ADMIN_AUTH_KEY, expectedToken);
      } else if (storedToken && storedToken !== expectedToken) {
        // Invalidate stale or forged tokens
        localStorage.removeItem(ADMIN_AUTH_KEY);
      }
    } catch (e) {
      console.error('Failed to sync admin auth', e);
    }
  }, [isAdminLoggedIn, currentAdminPin]);

  const loginAsAdmin = (pin) => {
    // Check brute force lockout
    if (Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      return { 
        success: false, 
        message: `Terlalu banyak percobaan PIN salah. Coba lagi dalam ${remainingSeconds} detik.` 
      };
    }

    const inputPin = (pin || '').trim();
    const validPin = currentAdminPin;
    
    if (inputPin !== validPin) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        const lockTime = Date.now() + 30000; // 30 seconds lockout
        setLockoutUntil(lockTime);
        setFailedAttempts(0);
        return { 
          success: false, 
          message: 'PIN salah 5 kali berturut-turut! Form dibekukan selama 30 detik demi keamanan.' 
        };
      }
      return { 
        success: false, 
        message: `PIN Pengurus salah! Sisa kesempatan: ${5 - nextAttempts}x` 
      };
    }

    // Success: reset rate limit & issue verified token
    setFailedAttempts(0);
    setLockoutUntil(0);
    const token = generateAdminToken(validPin);
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, token);
    } catch (e) {}

    setIsAdminLoggedIn(true);
    setPreviewAsStudent(false);
    return { success: true, user: ADMIN_USER };
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
    setPreviewAsStudent(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      if (window.location.hash && window.location.hash.toLowerCase().includes('admin')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (e) {}
  };

  const currentUser = isAdminLoggedIn ? ADMIN_USER : PUBLIC_CLASS_USER;
  const isAuthenticated = true;
  const isAdmin = isAdminLoggedIn;

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      isAdmin,
      previewAsStudent,
      setPreviewAsStudent,
      loginAsAdmin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
