'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import type { User } from '@/types/design';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; displayName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  guestLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      apiClient.get<{ data: User }>('/auth/me')
        .then((res) => setUser(res.data || res))
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<{ user: User; accessToken: string }>('/auth/login', { email, password });
    localStorage.setItem('accessToken', res.accessToken);
    setUser(res.user);
  };

  const register = async (data: { username: string; email: string; password: string; displayName?: string }) => {
    const res = await apiClient.post<{ user: User; accessToken: string }>('/auth/register', data);
    localStorage.setItem('accessToken', res.accessToken);
    setUser(res.user);
  };

  const logout = async () => {
    await apiClient.post('/auth/logout').catch(() => {});
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const guestLogin = async () => {
    const res = await apiClient.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/guest', {});
    localStorage.setItem('accessToken', res.accessToken);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, guestLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
