import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { UNAUTHORIZED_EVENT } from '../api/http';
import { tokenStorage } from '../api/tokenStorage';
import type { LoginIn, RegisterIn, TokenOut, UserOut } from '../api/types';
import { AuthContext, type AuthContextValue } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [initializing, setInitializing] = useState<boolean>(() => Boolean(tokenStorage.get()));

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!tokenStorage.get()) return;
    try {
      setUser(await authApi.me());
    } catch {
      logout();
    }
  }, [logout]);

  // Відновлення сесії при старті застосунку.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    refreshUser().finally(() => setInitializing(false));
  }, [refreshUser]);

  // Будь-яка відповідь 401 на запит із токеном означає, що сесія протухла.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const applyToken = useCallback((res: TokenOut) => {
    tokenStorage.set(res.access_token);
    setUser(res.user);
    return res.user;
  }, []);

  const login = useCallback(async (data: LoginIn) => applyToken(await authApi.login(data)), [applyToken]);
  const register = useCallback(
    async (data: RegisterIn) => applyToken(await authApi.register(data)),
    [applyToken],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, initializing, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
