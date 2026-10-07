import { useHabitStore } from '../store/useHabitStore';

export const lightColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  textPrimary: '#322A5C',
  textSecondary: '#8A8A8E',
  border: '#E5E5E5',
  borderStrong: '#C4C4C4',
  accent: '#14B8A6',
  white: '#FFFFFF',
  destructive: '#EF4444',
  destructiveBg: '#FEE2E2',
  tabBarBg: '#FFFFFF',
  tabBarInactive: '#C4C4C4',
  shadowColor: '#000',
  bottomSheetIndicator: '#E5E5E5',
};

export const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A5',
  border: '#333333',
  borderStrong: '#555555',
  accent: '#14B8A6', // keep it visible in dark mode
  white: '#1E1E1E', // things that are explicitly white in light mode will be surface color in dark
  destructive: '#F87171',
  destructiveBg: '#451a1a',
  tabBarBg: '#1E1E1E',
  tabBarInactive: '#666666',
  shadowColor: '#000',
  bottomSheetIndicator: '#555555',
};

export type ThemeColors = typeof lightColors;

export const useTheme = (): ThemeColors => {
  const isDark = useHabitStore((state) => state.preferences?.darkMode ?? false);
  return isDark ? darkColors : lightColors;
};
