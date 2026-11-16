import { useState, type ReactNode } from 'react';
import {
  authApi,
  clearSession,
  getStoredUser,
  saveSession,
} from '../api/client';
import type { User } from '../types';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());

  const login = async (email: string, password: string) => {
    const { data } = await authApi.post<{ accessToken: string; user: User }>(
      '/auth/login',
      { email, password },
    );
    saveSession(data.accessToken, data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}