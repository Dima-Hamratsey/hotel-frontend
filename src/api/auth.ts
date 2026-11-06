import { http } from './http';
import type { LoginIn, RegisterIn, TokenOut, UserOut } from './types';

export const authApi = {
  login: (data: LoginIn) => http.post<TokenOut>('/api/auth/login', data),
  register: (data: RegisterIn) => http.post<TokenOut>('/api/auth/register', data),
  me: () => http.get<UserOut>('/api/auth/me'),
};
