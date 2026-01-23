import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ConfigState {
  instanceUrl: string | null;
  setInstanceUrl: (url: string) => void;
  reset: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      instanceUrl: null,
      setInstanceUrl: (url) => set({ instanceUrl: url }),
      reset: () => set({ instanceUrl: null }),
    }),
    {
      name: 'eduflow-mobile-config',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
