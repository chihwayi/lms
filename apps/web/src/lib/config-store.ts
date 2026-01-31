import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ConfigState {
  instanceUrl: string | null;
  setInstanceUrl: (url: string) => void;
  clearInstanceUrl: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      instanceUrl: null,
      setInstanceUrl: (url: string) => {
        // Remove trailing slash if present
        const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
        set({ instanceUrl: cleanUrl });
      },
      clearInstanceUrl: () => set({ instanceUrl: null }),
    }),
    {
      name: 'app-config',
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
      onRehydrateStorage: () => (state) => {
        // Sanitize instanceUrl on hydration
        if (state?.instanceUrl) {
           const isLocalhostDomain = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
           const pointsToLocalhost = state.instanceUrl.includes('localhost');
           
           if (pointsToLocalhost && !isLocalhostDomain) {
               console.warn('Detected incorrect instanceUrl in storage. Clearing it.');
               state.setInstanceUrl(process.env.NEXT_PUBLIC_API_URL || '');
           }
        }
      },
    }
  )
);
