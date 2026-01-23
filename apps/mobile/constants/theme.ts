
import { Platform } from 'react-native';

const tintColorLight = '#4F46E5'; // Indigo 600
const tintColorDark = '#818CF8'; // Indigo 400

export const Colors = {
  light: {
    text: '#111827', // Gray 900
    textSecondary: '#4B5563', // Gray 600
    textMuted: '#9CA3AF', // Gray 400
    background: '#F9FAFB', // Gray 50
    card: '#FFFFFF',
    border: '#E5E7EB', // Gray 200
    tint: tintColorLight,
    primary: '#4F46E5', // Indigo 600
    primaryForeground: '#FFFFFF',
    secondary: '#F3F4F6', // Gray 100
    secondaryForeground: '#1F2937', // Gray 800
    destructive: '#EF4444', // Red 500
    destructiveForeground: '#FFFFFF',
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    icon: '#6B7280', // Gray 500
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F9FAFB', // Gray 50
    textSecondary: '#D1D5DB', // Gray 300
    textMuted: '#6B7280', // Gray 500
    background: '#111827', // Gray 900
    card: '#1F2937', // Gray 800
    border: '#374151', // Gray 700
    tint: tintColorDark,
    primary: '#818CF8', // Indigo 400
    primaryForeground: '#111827',
    secondary: '#374151', // Gray 700
    secondaryForeground: '#F9FAFB',
    destructive: '#EF4444', // Red 500
    destructiveForeground: '#FFFFFF',
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    icon: '#9CA3AF', // Gray 400
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
  },
};
