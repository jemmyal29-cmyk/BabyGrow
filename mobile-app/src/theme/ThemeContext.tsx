/**
 * BabyGrow 2026 - Theme Context (Dark Mode)
 * Dynamic theme switching with Midnight Pink palette as default
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  card: string;
  
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Borders & Shadows
  border: string;
  shadow: string;
  
  // Special
  gradient: string[];
}

interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    text: '#212121',
    textSecondary: '#666666',
    textTertiary: '#999999',
    
    primary: '#FF69B4',
    primaryLight: '#FFB6C1',
    primaryDark: '#C71585',
    
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    
    border: '#E0E0E0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    gradient: ['#FF69B4', '#FFA07A'],
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
    
    primary: '#FF69B4',
    primaryLight: '#FFB6C1',
    primaryDark: '#FF1493',
    
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#42A5F5',
    
    border: '#3A3A3A',
    shadow: 'rgba(255, 105, 180, 0.3)',
    
    gradient: ['#FF1493', '#FF69B4'],
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
    // Load theme preference from storage
    loadThemePreference();

    // Listen to system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only auto-switch if user hasn't set a preference
      AsyncStorage.getItem('theme_preference').then((pref) => {
        if (!pref) {
          setIsDark(colorScheme === 'dark');
        }
      });
    });

    return () => subscription.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem('theme_preference');
      if (stored !== null) {
        setIsDark(stored === 'dark');
      } else {
        // Default to system preference
        const colorScheme = Appearance.getColorScheme();
        setIsDark(colorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      await AsyncStorage.setItem('theme_preference', newValue ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = async (dark: boolean) => {
    setIsDark(dark);
    try {
      await AsyncStorage.setItem('theme_preference', dark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
