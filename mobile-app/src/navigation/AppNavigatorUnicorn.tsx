/**
 * AppNavigatorbabygrow.tsx
 * COMPLETE NAVIGATION SYSTEM dengan Splash → Onboarding → Login → Dashboard
 * 2026 Standard dengan AsyncStorage persistence
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators, StackCardStyleInterpolator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Image, Animated, StyleSheet, Text as RNText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@theme';

// Screens Import
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreenPremium';
import ChildrenScreen from '../screens/ChildrenScreen';
import ChildDetailScreen from '../screens/ChildDetailScreen';
import AddChildScreen from '../screens/AddChildScreen';
import GrowthScreen from '../screens/GrowthScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen_KAI';
import IoTDeviceScreen from '../screens/IoTDeviceScreen';
import ManualMeasurementScreen from '../screens/ManualMeasurementScreen';
import ImmunizationScreen from '../screens/ImmunizationScreen';
import GuideScreen from '../screens/GuideScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import UserDashboardScreen from '../screens/UserDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * ═══════════════════════════════════════════════════════
 * SPLASH SCREEN - Logo Animation dengan Glow Effect
 * ═══════════════════════════════════════════════════════
 */
const SplashScreen = ({ navigation }: any) => {
  const [glowAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Logo animations
    Animated.parallel([
      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
      // Scale bounce
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      // Subtle rotation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    // Check onboarding status after 2.5 seconds
    setTimeout(() => {
      checkOnboardingStatus();
    }, 2500);
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const userToken = await AsyncStorage.getItem('userToken');
      const userRole = await AsyncStorage.getItem('userRole');

      if (userToken && userRole) {
        // User already logged in
        if (userRole === 'admin') {
          navigation.replace('AdminDashboard');
        } else {
          navigation.replace('MainApp');
        }
      } else if (hasSeenOnboarding === 'true') {
        // Skip onboarding, go directly to login
        navigation.replace('Login');
      } else {
        // First time user, show onboarding
        navigation.replace('Onboarding');
      }
    } catch (error) {
      console.error('[Splash] Error checking status:', error);
      // Default to onboarding on error
      navigation.replace('Onboarding');
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <LinearGradient
      colors={['#FFC1CC', '#FFE5EC', '#FFFFFF']}
      style={styles.splashContainer}
    >
      {/* Glow Effect Background */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            opacity: glowOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: spin },
            ],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/logo-babygrow.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Loading Indicator */}
      <ActivityIndicator
        size="large"
        color={colors.primary.main}
        style={styles.loader}
      />
    </LinearGradient>
  );
};

/**
 * ═══════════════════════════════════════════════════════
 * MAIN APP TABS - Bottom Navigation for User Role
 * ═══════════════════════════════════════════════════════
 */
const MainAppTabs = () => {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: '#999999',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={UserDashboardScreen}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <RNText style={{ fontSize: size, color }}>🏠</RNText>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Children"
        component={ChildrenScreen}
        options={{
          tabBarLabel: 'Anak',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <RNText style={{ fontSize: size, color }}>👶</RNText>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Growth"
        component={GrowthScreen}
        options={{
          tabBarLabel: 'Grafik',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <RNText style={{ fontSize: size, color }}>📊</RNText>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipeListScreen}
        options={{
          tabBarLabel: 'Resep',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <RNText style={{ fontSize: size, color }}>🥘</RNText>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <RNText style={{ fontSize: size, color }}>👤</RNText>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * ═══════════════════════════════════════════════════════
 * MAIN NAVIGATOR - Root Stack Navigation
 * ═══════════════════════════════════════════════════════
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id="RootStack"
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {/* ═══ AUTH FLOW ═══ */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid,
          }}
        />

        {/* ═══ MAIN APP ═══ */}
        <Stack.Screen
          name="MainApp"
          component={MainAppTabs}
          options={{
            gestureEnabled: false,
            cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid,
          }}
        />

        {/* ═══ ADMIN DASHBOARD ═══ */}
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* ═══ CHILD MANAGEMENT ═══ */}
        <Stack.Screen
          name="ChildDetail"
          component={ChildDetailScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}
        />

        <Stack.Screen
          name="AddChild"
          component={AddChildScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
            presentation: 'modal',
          }}
        />

        {/* ═══ IOT & MEASUREMENT ═══ */}
        <Stack.Screen
          name="IoTDevice"
          component={IoTDeviceScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
          }}
        />

        <Stack.Screen
          name="ManualMeasurement"
          component={ManualMeasurementScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}
        />

        {/* ═══ AI & FEATURES ═══ */}
        <Stack.Screen
          name="AIAssistant"
          component={AIAssistantScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid,
          }}
        />

        <Stack.Screen
          name="Immunization"
          component={ImmunizationScreen}
        />

        <Stack.Screen
          name="Guide"
          component={GuideScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * ═══════════════════════════════════════════════════════
 * STYLES
 * ═══════════════════════════════════════════════════════
 */
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary.main,
    opacity: 0.3,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
    elevation: 20,
  },
  logoContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoImage: {
    width: 140,
    height: 140,
  },
  loader: {
    position: 'absolute',
    bottom: 100,
  },
});
