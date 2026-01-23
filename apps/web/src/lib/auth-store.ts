import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from './api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles?: { id: string; name: string; description?: string }[];
  emailVerified: boolean;
  avatar?: string;
  bio?: string;
  interests?: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await apiClient('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          skipAuth: true,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        
        // Store token in localStorage for immediate use
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.accessToken);
        }
        
        set({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
        });
      },

      register: async (registerData: RegisterData) => {
        const response = await apiClient('/auth/register', {
          method: 'POST',
          body: JSON.stringify(registerData),
          skipAuth: true,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Registration failed');
        }

        return response.json();
      },

      logout: () => {
        const token = get().accessToken;
        if (token) {
          apiClient('/auth/logout', {
            method: 'POST',
          }).catch(() => {});
        }
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      setAuth: (user: User, accessToken: string) => {
        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', accessToken);
        }
        
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);