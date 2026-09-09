/**
 * AUTHENTICATION & ACCESS GATE MANAGER
 * ClassHub - Session & Role Management
 */

import { store } from './store.js';

const AUTH_SESSION_KEY = 'classhub_session_v2';

class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
    this.authListeners = [];
  }

  loadSession() {
    try {
      const session = localStorage.getItem(AUTH_SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        // Verify member still exists in store
        const member = store.data.members.find(m => m.id === parsed.id);
        if (member) {
          return {
            ...member,
            role: parsed.role || member.role,
            isMasterAdmin: parsed.isMasterAdmin || parsed.role === 'admin'
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse auth session', e);
    }
    return null; // Not authenticated by default (must log in via Login Gate)
  }

  saveSession(user) {
    this.currentUser = user;
    try {
      if (user) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to save session', e);
    }
    this.notify();
  }

  loginAsStudent(studentId, enteredPin) {
    const student = store.data.members.find(m => m.id === studentId);
    if (!student) {
      return { success: false, message: 'Siswa tidak ditemukan dalam daftar kelas.' };
    }

    // Default PIN: 1234
    const validPin = student.pin || '1234';
    if (enteredPin && enteredPin !== validPin) {
      return { success: false, message: 'PIN Siswa salah! (Default PIN: 1234)' };
    }

    const sessionUser = {
      ...student,
      isMasterAdmin: student.role === 'admin'
    };

    this.saveSession(sessionUser);
    return { success: true, user: sessionUser };
  }

  loginAsMasterAdmin(enteredPin) {
    const correctPin = store.data.classInfo.adminPin || 'admin123';
    if (!enteredPin || enteredPin !== correctPin) {
      return { success: false, message: 'Master PIN Admin salah! (Default: admin123)' };
    }

    // Find first admin or assign as general admin
    const firstAdmin = store.data.members.find(m => m.role === 'admin') || store.data.members[0];
    const sessionUser = {
      ...firstAdmin,
      role: 'admin',
      roleTitle: 'Pengurus / Administrator',
      isMasterAdmin: true
    };

    this.saveSession(sessionUser);
    return { success: true, user: sessionUser };
  }

  logout() {
    this.saveSession(null);
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  onAuthChange(callback) {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.authListeners.forEach(cb => {
      try {
        cb(this.currentUser);
      } catch (err) {
        console.error('Auth listener error:', err);
      }
    });
  }
}

export const auth = new AuthManager();
