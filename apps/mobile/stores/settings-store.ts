import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  notificationsEnabled: boolean;
  darkMode: boolean;
  downloadOverWifi: boolean;
  
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setDownloadOverWifi: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      darkMode: false,
      downloadOverWifi: true,

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      setDownloadOverWifi: (enabled) => set({ downloadOverWifi: enabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
