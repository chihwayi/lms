import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const secureStorage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};
