import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStore } from './StoreContext';

const AUTH_SESSION_KEY = 'classhub_session_v2';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data } = useStore();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse session', e);
    }
    return null;
  });

  const [previewAsStudent, setPreviewAsStudent] = useState(false);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }, [currentUser]);

  const loginAsStudent = (studentId, pin) => {
    const student = data.members.find(m => m.id === studentId);
    if (!student) {
      return { success: false, message: 'Siswa tidak ditemukan.' };
    }
    const validPin = student.pin || '1234';
    if (pin && pin !== validPin) {
      return { success: false, message: 'PIN Siswa salah! (Default PIN: 1234)' };
    }

    // Regardless of student's class title (Ketua Kelas, Bendahara, etc.),
    // student login is strictly 'student' authRole with simple daily companion experience.
    const userObj = {
      ...student,
      authRole: 'student',
      isMasterAdmin: false
    };
    setPreviewAsStudent(false);
    setCurrentUser(userObj);
    return { success: true, user: userObj };
  };

  const loginAsAdmin = (pin) => {
    const validPin = data.classInfo.adminPin || 'admin123';
    if (pin !== validPin) {
      return { success: false, message: 'Master PIN Admin salah! (Default: admin123)' };
    }

    const adminUser = {
      id: 'master-admin',
      name: 'Administrator Kelas',
      role: 'admin',
      roleTitle: 'Pengurus / Wali Kelas',
      avatarText: 'AD',
      authRole: 'admin',
      isMasterAdmin: true
    };
    setPreviewAsStudent(false);
    setCurrentUser(adminUser);
    return { success: true, user: adminUser };
  };

  const logout = () => {
    setPreviewAsStudent(false);
    setCurrentUser(null);
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.authRole === 'admin';

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      isAdmin,
      previewAsStudent,
      setPreviewAsStudent,
      loginAsStudent,
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
