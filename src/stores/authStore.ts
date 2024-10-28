import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: () => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      isAuthenticated: () => {
        const state = useAuthStore.getState();
        return !!state.token;
      },
      logout: () => set({ token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);