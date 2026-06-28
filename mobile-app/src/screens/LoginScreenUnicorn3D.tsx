/**
 * LoginScreenbabygrow3D.tsx
 * LOGIN 3D dengan Logo Bulat Perfect & Animasi Bayi Lucu
 * 2026 Standard
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

/**
 * ═══════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════
 */
export default function LoginScreen3D({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const [logoScale] = useState(new Animated.Value(0));
  const [logoRotate] = useState(new Animated.Value(0));
  const [logoGlow] = useState(new Animated.Value(0));
  const [cardSlide] = useState(new Animated.Value(50));
  const [cardOpacity] = useState(new Animated.Value(0));
  const [babyBounce] = useState(new Animated.Value(0));

  useEffect(() => {
    // Entry animations
    Animated.sequence([
      // Logo appears
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Card slides up
      Animated.parallel([
        Animated.spring(cardSlide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Logo glow animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoGlow, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Baby bounce animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(babyBounce, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(babyBounce, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /**
   * Handle Login
   */
  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi!');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock authentication logic
      let userRole = 'user'; // Default role

      // Admin credentials check
      if (email.toLowerCase() === 'admin@babygrow.com' && password === 'admin123') {
        userRole = 'admin';
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem('userToken', 'mock-jwt-token-12345');
      await AsyncStorage.setItem('userRole', userRole);
      await AsyncStorage.setItem('userEmail', email);

      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate based on role
      if (userRole === 'admin') {
        navigation.replace('AdminDashboard');
      } else {
        navigation.replace('MainApp');
      }
    } catch (error) {
      console.error('[Login] Error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google Login (Mock)
   */
  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Google Login', 'Fitur Google Login akan segera hadir! 🚀');
  };

  /**
   * Handle Register
   */
  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Daftar', 'Halaman pendaftaran akan segera hadir! 📝');
  };

  // Interpolations
  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = logoGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#FFE5EC', '#FFC1CC', '#FF69B4']}
        style={styles.gradient}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          {/* Baby Animation (Background) */}
          <Animated.Text
            style={[
              styles.babyEmoji,
              {
                transform: [{ translateY: babyBounce }],
              },
            ]}
          >
            👶💖
          </Animated.Text>

          {/* Logo Circle with Glow */}
          <Animated.View
            style={[
              styles.logoGlowCircle,
              {
                opacity: glowOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.logoCircle,
              {
                transform: [
                  { scale: logoScale },
                  { rotate: logoRotation },
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

          <Text style={styles.appName}>BabyGrow</Text>
          <Text style={styles.tagline}>Pantau Tumbuh Kembang Buah Hati ✨</Text>
        </View>

        {/* Login Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateY: cardSlide }],
              opacity: cardOpacity,
            },
          ]}
        >
          <BlurView intensity={80} tint="light" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Title */}
              <Text style={styles.cardTitle}>Masuk ke Akun</Text>
              <Text style={styles.cardSubtitle}>Selamat datang kembali! 👋</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📧 Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🔒 Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => Alert.alert('Lupa Password', 'Fitur reset password akan segera hadir!')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Lupa password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF69B4', '#C71585']}
                  style={styles.loginButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? '🔄 Memproses...' : '🚀 Masuk'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>atau</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Login Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.googleIcon}>🔵</Text>
                <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Belum punya akun? </Text>
                <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
                  <Text style={styles.registerLink}>Daftar di sini</Text>
                </TouchableOpacity>
              </View>

              {/* Demo Credentials */}
              <View style={styles.demoContainer}>
                <Text style={styles.demoText}>🎯 Demo:</Text>
                <Text style={styles.demoCredentials}>User: user@test.com / password123</Text>
                <Text style={styles.demoCredentials}>Admin: admin@babygrow.com / admin123</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

/**
 * ═══════════════════════════════════════════════════════
 * STYLES
 * ═══════════════════════════════════════════════════════
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  // Logo Section
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  babyEmoji: {
    fontSize: 48,
    position: 'absolute',
    top: 80,
  },
  logoGlowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF69B4',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 15,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Card
  cardContainer: {
    flex: 1.5,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  cardInner: {
    padding: 28,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Inputs
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C71585',
  },
  // Login Button
  loginButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  loginButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.5)',
  },
  // Google Button
  googleButton: {
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 16,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  // Register
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  registerText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C71585',
  },
  // Demo
  demoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  demoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  demoCredentials: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.6)',
  },
});
