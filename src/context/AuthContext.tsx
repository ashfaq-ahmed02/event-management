'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthSession, UserRole } from '@/lib/types';

interface AuthContextType {
  user: AuthSession | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    department?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage and verify with backend
  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = localStorage.getItem('campusevent_token');
        const storedUser = localStorage.getItem('campusevent_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }

        // Verify with server
        const res = await fetch('/api/auth/me', {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data.user) {
            const verifiedUser: AuthSession = {
              userId: data.data.user.id,
              name: data.data.user.name,
              email: data.data.user.email,
              role: data.data.user.role,
              department: data.data.user.department,
            };
            setUser(verifiedUser);
            localStorage.setItem('campusevent_user', JSON.stringify(verifiedUser));
          }
        } else if (res.status === 401) {
          // Token expired or invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('campusevent_token');
          localStorage.removeItem('campusevent_user');
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('campusevent_token', data.data.token);
      localStorage.setItem('campusevent_user', JSON.stringify(data.data.user));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    department?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('campusevent_token', data.data.token);
      localStorage.setItem('campusevent_user', JSON.stringify(data.data.user));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('campusevent_token');
      localStorage.removeItem('campusevent_user');
    }
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('campusevent_token');
    if (!storedToken) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data.user) {
          const refreshed: AuthSession = {
            userId: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            role: data.data.user.role,
            department: data.data.user.department,
          };
          setUser(refreshed);
          localStorage.setItem('campusevent_user', JSON.stringify(refreshed));
        }
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
