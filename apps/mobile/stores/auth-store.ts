import { create } from 'zustand';
import { secureStorage } from '@/lib/secure-storage';

interface AuthState {
  accessToken: string | null;
  user: any | null;
  setAccessToken: (token: string) => Promise<void>;
  setUser: (user: any) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAccessToken: async (token) => {
    await secureStorage.setItem('accessToken', token);
    set({ accessToken: token });
  },
  setUser: (user) => set({ user }),
  logout: async () => {
    await secureStorage.deleteItem('accessToken');
    set({ accessToken: null, user: null });
  },
  initialize: async () => {
    try {
        const token = await secureStorage.getItem('accessToken');
        if (token) {
          set({ accessToken: token });
        }
    } catch (e) {
        console.log('Error initializing auth store', e);
    }
  },
}));
