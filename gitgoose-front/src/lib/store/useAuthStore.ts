import { create } from 'zustand';
import type { User } from '@/lib/types';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null | undefined;
  user: User | null;
  error: string | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? Cookies.get('token') : null,
  user: null,
  error: null,
  setToken: (token) => {
    if (token) {
      Cookies.set('token', token);
      set({ token });
    }
  },
  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
  clearAuth: () => {
    Cookies.remove('token');
    set({ token: null, user: null, error: null });
  },
}));