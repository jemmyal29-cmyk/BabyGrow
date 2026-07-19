/**
 * Theme Context — aligned with desainuiux.md light professional palette
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { colors } from './colors';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  shadow: string;
  gradient: string[];
}

interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

const lightTheme: Theme = {
  dark: false,
  colors: {
    background: colors.background.default,
    surface: colors.surface.lowest,
    card: colors.surface.lowest,
    text: colors.text.onSurface,
    textSecondary: colors.text.secondary,
    textTertiary: colors.text.onSurfaceVariant,
    primary: colors.primary.main,
    primaryLight: colors.primary.fixedDim,
    primaryDark: colors.primary.dark,
    success: colors.status.success,
    warning: colors.status.warning,
    error: colors.status.error,
    info: colors.status.info,
    border: colors.border.divider,
    shadow: colors.effects.shadowLight,
    gradient: [...colors.secondary.gradient.vibrantPink],
  },
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textTertiary: '#999999',
    primary: colors.primary.main,
    primaryLight: colors.primary.fixedDim,
    primaryDark: colors.primary.container,
    success: colors.status.success,
    warning: colors.status.warning,
    error: colors.status.error,
    info: colors.status.info,
    border: '#3A3A3A',
    shadow: colors.effects.shadowPink,
    gradient: [colors.primary.dark, colors.primary.main],
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemePreference();
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem('theme_preference').then((pref) => {
        if (!pref) setIsDark(colorScheme === 'dark');
      });
    });
    return () => subscription.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem('theme_preference');
      if (stored !== null) setIsDark(stored === 'dark');
      else setIsDark(false); // design default: light professional
    } catch {
      setIsDark(false);
    }
  };

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem('theme_preference', next ? 'dark' : 'light');
    } catch {
      // ignore
    }
  };

  const setTheme = async (dark: boolean) => {
    setIsDark(dark);
    try {
      await AsyncStorage.setItem('theme_preference', dark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme: isDark ? darkTheme : lightTheme, isDark, toggleTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export default ThemeContext;
