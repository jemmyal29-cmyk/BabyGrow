/**
 * App.tsx - BabyGrow Unicorn 2026
 * COMPLETE INTEGRATION with new navigation system
 * 
 * To activate: Replace existing App.tsx with this file
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigatorUnicorn from './src/navigation/AppNavigatorUnicorn';

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppNavigatorUnicorn />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
