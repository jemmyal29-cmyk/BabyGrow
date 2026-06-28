/**
 * Enhanced Login Screen with RBAC
 * Mock credentials visible for testing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAuthActions, useAuth } from '../store/authStore';
import HapticService from '../services/HapticService';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuthActions();
  const { isLoading, error } = useAuth();

  // Pulsing animation for logo
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(1);

  React.useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      false
    );
    logoOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    shadowOpacity: logoOpacity.value * 0.3,
  }));

  const handleLogin = async () => {
    await HapticService.buttonPress();
    if (!email || !password) {
      Alert.alert('Validasi', 'Email dan password harus diisi');
      return;
    }

    try {
      await login({ email, password });
      await HapticService.success();
      // Navigation handled by AppNavigatorRBAC
      // User will be redirected to appropriate dashboard based on role
      Alert.alert('Berhasil', `Selamat datang! 💗`);
    } catch (err) {
      await HapticService.error();
      Alert.alert('Login Gagal', error || 'Email atau password salah');
    }
  };

  const handleQuickLogin = async (testEmail: string, testPassword: string) => {
    await HapticService.button3DPress();
    setEmail(testEmail);
    setPassword(testPassword);
    setTimeout(() => {
      handleLogin();
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#FF69B4', '#FFB6C1', '#FFFFFF']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo & Branding */}
            <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
              <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <Image
                  source={require('../../assets/images/logo-babygrow.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles.title}>BabyGrow</Text>
              <Text style={styles.subtitle}>
                Kawal Tumbuh Kembang Sejak Dini
              </Text>
            </Animated.View>

            {/* Login Card */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.card}>
              <Text style={styles.cardTitle}>Masuk ke Akun Anda</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor="#BDBDBD"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#BDBDBD"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Display */}
              {error && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.errorContainer}>
                  <Text style={styles.errorText}>❌ {error}</Text>
                </Animated.View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#FF69B4', '#FFA07A']}
                  style={styles.loginButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>Masuk</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>atau</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Quick Login Section */}
              <View style={styles.quickLoginSection}>
                <Text style={styles.quickLoginTitle}>🧪 Testing Akun:</Text>

                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={() => handleQuickLogin('parent@test.com', 'parent123')}
                  disabled={isLoading}
                >
                  <View style={styles.quickLoginContent}>
                    <Text style={styles.quickLoginIcon}>👨‍👩‍👧</Text>
                    <View style={styles.quickLoginInfo}>
                      <Text style={styles.quickLoginRole}>ORANG TUA / CAREGIVER</Text>
                      <Text style={styles.quickLoginEmail}>parent@test.com</Text>
                      <Text style={styles.quickLoginPassword}>password: parent123</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickLoginButton, styles.quickLoginButtonAdmin]}
                  onPress={() => handleQuickLogin('admin@puskesmas.id', 'admin123')}
                  disabled={isLoading}
                >
                  <View style={styles.quickLoginContent}>
                    <Text style={styles.quickLoginIcon}>🏥</Text>
                    <View style={styles.quickLoginInfo}>
                      <Text style={[styles.quickLoginRole, styles.quickLoginRoleAdmin]}>
                        TENAGA KESEHATAN
                      </Text>
                      <Text style={styles.quickLoginEmail}>admin@puskesmas.id</Text>
                      <Text style={styles.quickLoginPassword}>password: admin123</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.footer}>
              <Text style={styles.footerText}>
                © 2025 BabyGrow • Sistem RBAC v2.0
              </Text>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
    borderWidth: 4,
    borderColor: '#FFC1CC',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  logoIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#212121',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9E9E9E',
  },
  quickLoginSection: {
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    padding: 16,
  },
  quickLoginTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickLoginButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FF69B4',
  },
  quickLoginButtonAdmin: {
    borderColor: '#1A237E',
    marginBottom: 0,
  },
  quickLoginContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickLoginIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  quickLoginInfo: {
    flex: 1,
  },
  quickLoginRole: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF69B4',
    marginBottom: 4,
  },
  quickLoginRoleAdmin: {
    color: '#1A237E',
  },
  quickLoginEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 2,
  },
  quickLoginPassword: {
    fontSize: 12,
    color: '#757575',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
