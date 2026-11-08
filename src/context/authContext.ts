import { createContext } from 'react';
import type { LoginIn, RegisterIn, UserOut } from '../api/types';

export interface AuthContextValue {
  /** Поточний користувач або null, якщо гість. */
  user: UserOut | null;
  /** true, поки відновлюється сесія зі збереженого токена. */
  initializing: boolean;
  isAdmin: boolean;
  login: (data: LoginIn) => Promise<UserOut>;
  register: (data: RegisterIn) => Promise<UserOut>;
  logout: () => void;
  /** Повторно завантажує профіль (наприклад, після зміни балансу бонусів). */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
