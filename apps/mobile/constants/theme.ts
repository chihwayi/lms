
import { Platform } from 'react-native';

const tintColorLight = '#6366F1'; // Indigo 500
const tintColorDark = '#818CF8'; // Indigo 400

export const Colors = {
  light: {
    text: '#0F172A', // Slate 900
    textSecondary: '#475569', // Slate 600
    textMuted: '#94A3B8', // Slate 400
    background: '#F8FAFC', // Slate 50
    card: '#FFFFFF',
    border: '#E2E8F0', // Slate 200
    tint: tintColorLight,
    primary: '#6366F1', // Indigo 500
    primaryForeground: '#FFFFFF',
    secondary: '#F1F5F9', // Slate 100
    secondaryForeground: '#1E293B', // Slate 800
    destructive: '#EF4444', // Red 500
    destructiveForeground: '#FFFFFF',
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    icon: '#64748B', // Slate 500
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    gradientStart: '#4F46E5', // Indigo 600
    gradientEnd: '#818CF8', // Indigo 400
  },
  dark: {
    text: '#F8FAFC', // Slate 50
    textSecondary: '#CBD5E1', // Slate 300
    textMuted: '#64748B', // Slate 500
    background: '#0F172A', // Slate 900
    card: '#1E293B', // Slate 800
    border: '#334155', // Slate 700
    tint: tintColorDark,
    primary: '#818CF8', // Indigo 400
    primaryForeground: '#0F172A',
    secondary: '#334155', // Slate 700
    secondaryForeground: '#F8FAFC',
    destructive: '#EF4444', // Red 500
    destructiveForeground: '#FFFFFF',
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    icon: '#94A3B8', // Slate 400
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    gradientStart: '#4338CA', // Indigo 700
    gradientEnd: '#6366F1', // Indigo 500
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  },
};

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};
