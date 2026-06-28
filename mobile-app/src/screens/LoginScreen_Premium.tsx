/**
 * LoginScreen - VIBRANT PINK & ELEGANT WHITE
 * Minimalist design dengan gradasi pink hangat yang menyambut
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../theme';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = () => {
    // Navigate to main app
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF85A1" />
      
      {/* Gradient Background - Vibrant Pink yang Hangat */}
      <LinearGradient
        colors={['#FF85A1', '#FF6B95', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.5, 1]}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Logo & Welcome */}
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoIcon}>👶</Text>
                </View>
                <Text style={styles.appName}>BabyGrow</Text>
                <Text style={styles.tagline}>
                  Pantau Pertumbuhan Buah Hati dengan Cinta 💕
                </Text>
              </View>

              {/* Login Card - Glass Effect */}
              <View style={styles.loginCard}>
                {/* Title */}
                <Text style={styles.cardTitle}>Selamat Datang Kembali</Text>
                <Text style={styles.cardSubtitle}>
                  Masuk untuk melanjutkan monitoring
                </Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>📧</Text>
                    <TextInput
                      placeholder="nama@email.com"
                      value={email}
                      onChangeText={setEmail}
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor={colors.text.tertiary}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      style={styles.input}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      placeholderTextColor={colors.text.tertiary}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Text style={styles.eyeIconText}>
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    style={styles.rememberMe}
                  >
                    <View style={styles.checkbox}>
                      {rememberMe && (
                        <View style={styles.checkboxFilled} />
                      )}
                    </View>
                    <Text style={styles.rememberText}>Ingat Saya</Text>
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <Text style={styles.forgotText}>Lupa Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button - Vibrant Gradient */}
                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  style={styles.loginButton}
                >
                  <LinearGradient
                    colors={['#FF85A1', '#FF6B95']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.loginButtonGradient}
                  >
                    <Text style={styles.loginButtonText}>Masuk</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>atau</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login */}
                <TouchableOpacity style={styles.googleButton}>
                  <Text style={styles.googleIcon}>🔵</Text>
                  <Text style={styles.googleText}>Masuk dengan Google</Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signupRow}>
                  <Text style={styles.signupText}>Belum punya akun? </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ParentData')}
                  >
                    <Text style={styles.signupLink}>Daftar Sekarang</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.xxl,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#FF6B95',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  // Login Card
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  
  // Input Styles
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    padding: 0,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
  } as any,
  eyeIcon: {
    padding: spacing.xs,
  },
  eyeIconText: {
    fontSize: 18,
  },
  
  // Options Row
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FF85A1',
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxFilled: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#FF85A1',
  },
  rememberText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  forgotText: {
    fontSize: typography.fontSize.sm,
    color: '#FF85A1',
    fontWeight: '600',
  },
  
  // Login Button
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    paddingHorizontal: spacing.md,
  },
  
  // Google Button
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.md,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  googleText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  
  // Sign Up Row
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  signupText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  signupLink: {
    fontSize: typography.fontSize.sm,
    color: '#FF85A1',
    fontWeight: '700',
  },
});

export default LoginScreen;
