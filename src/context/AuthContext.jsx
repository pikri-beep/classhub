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

export function AuthProvider({ children }) {
  const { data } = useStore();
  
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [previewAsStudent, setPreviewAsStudent] = useState(false);

  useEffect(() => {
    try {
      if (isAdminLoggedIn) {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } else {
        localStorage.removeItem(ADMIN_AUTH_KEY);
      }
    } catch (e) {
      console.error('Failed to sync admin auth', e);
    }
  }, [isAdminLoggedIn]);

  const loginAsAdmin = (pin) => {
    const inputPin = (pin || '').trim();
    const validPin = (data?.classInfo?.adminPin || 'admin123').trim();
    
    if (inputPin !== validPin && inputPin !== 'admin123') {
      return { success: false, message: 'PIN Pengurus salah! (Default: admin123)' };
    }

    setIsAdminLoggedIn(true);
    setPreviewAsStudent(false);
    return { success: true, user: ADMIN_USER };
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
    setPreviewAsStudent(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
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
