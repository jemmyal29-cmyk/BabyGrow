/**
 * BabyGrow — Main App Entry
 * Splash → Auth init (Supabase) → QueryClient → AppNavigatorRBAC
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './src/theme/ThemeContext';
import SplashScreen from './src/screens/SplashScreen';
import AppNavigator from './src/navigation/AppNavigatorRBAC';
import { useAuthStore } from './src/store/authStore';
import { queryClient } from './src/services/queryClient';
import { colors } from './src/theme';

export default function App() {
  const [appState, setAppState] = useState<'splash' | 'main'>('splash');
  const initialize = useAuthStore((s) => s.initialize);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
          {appState === 'splash' && (
            <SplashScreen onFinish={() => setAppState('main')} />
          )}
          {appState === 'main' && !isInitialized && (
            <View style={styles.boot}>
              <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
          )}
          {appState === 'main' && isInitialized && <AppNavigator />}
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.lighter,
  },
});
