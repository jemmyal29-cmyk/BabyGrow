/**
 * BabyGrow — Main App Entry
 * Fonts → Splash → Onboarding (sekali) → Auth → Navigator
 * Web: wrapped in Android device frame preview
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './src/theme/ThemeContext';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AppNavigator from './src/navigation/AppNavigatorRBAC';
import { useAuthStore } from './src/store/authStore';
import { queryClient } from './src/services/queryClient';
import { colors } from './src/theme';
import { useAppFonts } from './src/theme/useAppFonts';
import { WebDeviceFrame } from './src/components/common/WebDeviceFrame';

const ONBOARDING_KEY = '@babygrow/onboarding_done_v4';

type Gate = 'splash' | 'onboarding' | 'main';

export default function App() {
  const fontsLoaded = useAppFonts();
  const [gate, setGate] = useState<Gate>('splash');
  const initialize = useAuthStore((s) => s.initialize);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const finishSplash = useCallback(async () => {
    try {
      const done = await AsyncStorage.getItem(ONBOARDING_KEY);
      setGate(done === '1' ? 'main' : 'onboarding');
    } catch {
      setGate('onboarding');
    }
  }, []);

  const finishOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    } catch {
      // ignore
    }
    setGate('main');
  }, []);

  if (!fontsLoaded) {
    return (
      <WebDeviceFrame>
        <View style={styles.boot}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </WebDeviceFrame>
    );
  }

  return (
    <WebDeviceFrame>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider>
            {gate === 'splash' && <SplashScreen onFinish={finishSplash} />}
            {gate === 'onboarding' && (
              <OnboardingScreen onFinish={finishOnboarding} />
            )}
            {gate === 'main' && !isInitialized && (
              <View style={styles.boot}>
                <ActivityIndicator size="large" color={colors.primary.main} />
              </View>
            )}
            {gate === 'main' && isInitialized && <AppNavigator />}
            <StatusBar style="dark" />
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WebDeviceFrame>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.default,
  },
});
