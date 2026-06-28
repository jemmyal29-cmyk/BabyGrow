/**
 * BabyGrow Unicorn 2026 - Main App Entry
 * Integrated with Splash, Onboarding, Theme Context
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './src/theme/ThemeContext';
import SplashScreen from './src/screens/SplashScreen';
// TEMPORARY: Comment out OnboardingScreen to test Metro
// import OnboardingScreen from './src/screens/OnboardingScreen';
import AppNavigator from './src/navigation/AppNavigatorRBAC';

export default function App() {
  const [appState, setAppState] = useState<'splash' | 'onboarding' | 'main'>('splash');
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('onboarding_completed');
      setOnboardingCompleted(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleSplashFinish = () => {
    // Skip onboarding for now - go straight to main
    setAppState('main');
    // if (onboardingCompleted) {
    //   setAppState('main');
    // } else {
    //   setAppState('onboarding');
    // }
  };

  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      setOnboardingCompleted(true);
      setAppState('main');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setAppState('main');
    }
  };

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        {appState === 'splash' && <SplashScreen onFinish={handleSplashFinish} />}
        {appState === 'main' && <AppNavigator />}
        <StatusBar style="light" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
