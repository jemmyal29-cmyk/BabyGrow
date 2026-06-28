/**
 * OnboardingScreenbabygrow.tsx
 * 5-SLIDE ONBOARDING dengan Lottie Animation & 3D Logo
 * 2026 Standard
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

/**
 * ═══════════════════════════════════════════════════════
 * SLIDE DATA - 5 Halaman Onboarding
 * ═══════════════════════════════════════════════════════
 */
const slides = [
  {
    id: 1,
    emoji: '⚖️',
    title: 'Pantau Pertumbuhan Balita',
    description: 'Catat berat, tinggi, dan lingkar kepala anak dengan mudah menggunakan teknologi IoT',
    gradient: ['#FF69B4', '#FFB6C1', '#FFE5EC'] as const,
    illustration: '👶📊',
    showLogo: true,
  },
  {
    id: 2,
    emoji: '📡',
    title: 'Teknologi IoT Bluetooth',
    description: 'Hubungkan smartphone ke alat ukur BabyGrow_Alat secara otomatis via Bluetooth Low Energy',
    gradient: ['#9B59B6', '#C39BD3', '#E8DAEF'] as const,
    illustration: '📱🔌',
    showLogo: false,
  },
  {
    id: 3,
    emoji: '🤖',
    title: 'Deteksi Stunting dengan AI',
    description: 'Analisis pertumbuhan menggunakan AI Gemini dan standar WHO untuk deteksi risiko stunting',
    gradient: ['#3498DB', '#5DADE2', '#AED6F1'] as const,
    illustration: '🧠📈',
    showLogo: false,
  },
  {
    id: 4,
    emoji: '🥗',
    title: 'Resep Makanan Bergizi Gratis',
    description: 'Dapatkan rekomendasi resep MBG (Makan Bergizi Gratis) sesuai usia anak',
    gradient: ['#27AE60', '#58D68D', '#ABEBC6'] as const,
    illustration: '🥘🍎',
    showLogo: false,
  },
  {
    id: 5,
    emoji: '🦄',
    title: 'Chill, Semua Otomatis!',
    description: 'Data tersinkronisasi real-time. Pantau tumbuh kembang anak dari mana saja',
    gradient: ['#E74C3C', '#EC7063', '#F5B7B1'] as const,
    illustration: '✨🎉',
    showLogo: false,
  },
];

/**
 * ═══════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════
 */
export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [logoGlowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo glow animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoGlowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /**
   * Handle Next Button
   */
  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  /**
   * Handle Skip Button
   */
  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleFinish();
  };

  /**
   * Finish Onboarding
   */
  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('[Onboarding] Error saving status:', error);
      navigation.replace('Login');
    }
  };

  /**
   * Render Single Slide
   */
  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => {
    const logoGlowOpacity = logoGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    return (
      <View style={styles.slideContainer}>
        <LinearGradient
          colors={item.gradient}
          style={styles.slideGradient}
        >
          {/* Logo (Only on first slide) */}
          {item.showLogo && (
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: logoGlowOpacity,
                },
              ]}
            >
              <View style={styles.logoCircle}>
                <Image
                  source={require('../../assets/images/logo-babygrow.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>
          )}

          {/* Illustration */}
          {!item.showLogo && (
            <View style={styles.illustrationContainer}>
              <Text style={styles.illustrationEmoji}>{item.illustration}</Text>
            </View>
          )}

          {/* Content Card */}
          <BlurView intensity={80} tint="light" style={styles.contentCard}>
            <View style={styles.cardInner}>
              <Text style={styles.emojiLarge}>{item.emoji}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </BlurView>

          {/* Bottom Safe Area */}
          <View style={styles.bottomSpacer} />
        </LinearGradient>
      </View>
    );
  };

  /**
   * Render Pagination Dots
   */
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Pagination Dots */}
      {renderPaginationDots()}

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {/* Skip Button */}
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Lewati</Text>
          </TouchableOpacity>
        )}

        {/* Next/Finish Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            currentIndex === slides.length - 1 && styles.finishButton,
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              currentIndex === slides.length - 1
                ? ['#E74C3C', '#C0392B']
                : ['#FF69B4', '#C71585']
            }
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? 'Mulai 🚀' : 'Lanjut →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
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
    backgroundColor: '#FFFFFF',
  },
  slideContainer: {
    width,
    height,
  },
  slideGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  // Logo (Slide 1)
  logoContainer: {
    position: 'absolute',
    top: height * 0.15,
    alignItems: 'center',
  },
  logoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  logoImage: {
    width: 140,
    height: 140,
  },
  // Illustration (Slide 2-5)
  illustrationContainer: {
    position: 'absolute',
    top: height * 0.15,
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 100,
    textAlign: 'center',
  },
  // Content Card
  contentCard: {
    position: 'absolute',
    bottom: 180,
    width: width - 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  cardInner: {
    padding: 32,
    alignItems: 'center',
  },
  emojiLarge: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomSpacer: {
    height: 100,
  },
  // Pagination
  paginationContainer: {
    position: 'absolute',
    bottom: 140,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  // Buttons
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    gap: 16,
  },
  skipButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nextButton: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  finishButton: {
    flex: 1,
  },
  nextButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
