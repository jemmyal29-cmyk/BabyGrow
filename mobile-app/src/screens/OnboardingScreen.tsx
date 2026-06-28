/**
 * Enhanced OnboardingScreen - 5 Slides Walkthrough
 * 2026 Standard with 3D Glassmorphism & Logo
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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    id: 1,
    emoji: '⚖️',
    title: 'Pantau Pertumbuhan Balita',
    description: 'Catat berat, tinggi, dan lingkar kepala anak dengan mudah dan akurat menggunakan teknologi terkini',
    gradient: ['#FF1493', '#FF69B4', '#FFB6C1'] as const,
    illustration: '👶📊',
    showLogo: true,
    badge: 'START'
  },
  {
    id: 2,
    emoji: '🔗',
    title: 'Pairing IoT via Bluetooth',
    description: 'Hubungkan smartphone ke alat ukur BabyGrow secara otomatis dengan teknologi Bluetooth Low Energy',
    gradient: ['#9B59B6', '#C471ED', '#E8B5FF'] as const,
    illustration: '📱💫',
    showLogo: false,
    badge: 'IoT'
  },
  {
    id: 3,
    emoji: '🤖',
    title: 'Deteksi Risiko dengan AI',
    description: 'Analisis pertumbuhan menggunakan Artificial Intelligence dan standar WHO untuk deteksi dini stunting',
    gradient: ['#3498DB', '#5DADE2', '#85C1E2'] as const,
    illustration: '🧠✨',
    showLogo: false,
    badge: 'AI'
  },
  {
    id: 4,
    emoji: '🥘',
    title: 'Rekomendasi Nutrisi MBG',
    description: 'Dapatkan resep makanan bergizi gratis yang disesuaikan untuk pertumbuhan optimal anak Anda',
    gradient: ['#F39C12', '#F8B739', '#FECA57'] as const,
    illustration: '🍎🥗',
    showLogo: false,
    badge: 'MBG'
  },
  {
    id: 5,
    emoji: '📈',
    title: 'Grafik Tumbuh Kembang',
    description: 'Visualisasi pertumbuhan dengan grafik WHO yang interaktif, mudah dipahami, dan berbasis data real-time',
    gradient: ['#1ABC9C', '#48C9B0', '#76D7C4'] as const,
    illustration: '📊💚',
    showLogo: false,
    badge: 'WHO'
  }
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentIndex]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // Reset animations for new slide
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      handleGetStarted();
    }
  };

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      // Reset animations for new slide
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFinish();
  };

  const handleGetStarted = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onFinish();
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            currentIndex === index && styles.dotActive,
            {
              opacity: fadeAnim,
              transform: [{ scale: currentIndex === index ? 1.2 : 1 }]
            }
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={slides[currentIndex].gradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Background Circles */}
      <View style={styles.circlesContainer}>
        <Animated.View
          style={[
            styles.circle,
            styles.circle1,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3]
              }),
              transform: [{
                scale: scaleAnim.interpolate({
                  inputRange: [0.8, 1],
                  outputRange: [0.8, 1.2]
                })
              }]
            }
          ]}
        />
        <Animated.View
          style={[
            styles.circle,
            styles.circle2,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.2]
              })
            }
          ]}
        />
      </View>

      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <BlurView intensity={80} tint="light" style={styles.skipBlur}>
            <Text style={styles.skipText}>Lewati</Text>
          </BlurView>
        </TouchableOpacity>
      )}

      {/* Current Slide Only */}
      <View style={styles.slideContainer}>
        {slides.map((slide, index) => 
          index === currentIndex ? (
          <Animated.View
            key={slide.id}
            style={[
              styles.slide,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* 3D Logo (Only on first slide) */}
            {slide.showLogo && (
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    transform: [{
                      scale: scaleAnim.interpolate({
                        inputRange: [0.8, 1],
                        outputRange: [0.5, 1]
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.logoGlow}>
                  {/* Professional Logo Circle */}
                  <View style={styles.logoCircle}>
                    <Image 
                      source={require('../../assets/images/logo-babygrow.png')}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  </View>
                  {/* AI Badge */}
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>AI</Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Badge for each slide */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{slide.badge}</Text>
            </View>

            {/* Illustration */}
            {!slide.showLogo && (
              <Animated.View
                style={[
                  styles.illustrationContainer,
                  {
                    transform: [{
                      translateY: scaleAnim.interpolate({
                        inputRange: [0.8, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.illustration}>{slide.illustration}</Text>
                <Text style={styles.mainEmoji}>{slide.emoji}</Text>
              </Animated.View>
            )}

            {/* Illustration Emoji (Alternative) */}
            {!slide.showLogo && slide.emoji && (
              <Animated.Text
                style={[
                  styles.illustrationEmoji,
                  {
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                {slide.illustration}
              </Animated.Text>
            )}

            {/* Emoji Icon */}
            <Animated.Text
              style={[
                styles.emoji,
                {
                  transform: [{
                    rotate: scaleAnim.interpolate({
                      inputRange: [0.8, 1],
                      outputRange: ['-10deg', '0deg']
                    })
                  }]
                }
              ]}
            >
              {slide.emoji}
            </Animated.Text>

            {/* Content Card */}
            <BlurView intensity={100} tint="light" style={styles.contentCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>

                {/* Feature badges (first slide only) */}
                {index === 0 && (
                  <View style={styles.badgeContainer}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>🏥 Standar WHO</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>📱 Mudah & Cepat</Text>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </BlurView>
          </Animated.View>
          ) : null
        )}
      </View>

      {/* Dots Indicator */}
      {renderDots()}

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {/* Previous Button */}
        {currentIndex > 0 && (
          <TouchableOpacity
            style={styles.prevButton}
            onPress={handlePrev}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
              style={styles.navButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.navButtonText}>← Kembali</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        {/* Next/Get Started Button */}
        <TouchableOpacity
          style={[styles.nextButton, currentIndex === 0 && styles.nextButtonFull]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF69B4', '#FFA07A']}
            style={styles.nextGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.Text
              style={[
                styles.nextText,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              {currentIndex === slides.length - 1 ? 'Mulai Sekarang! 🚀' : 'Lanjut →'}
            </Animated.Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main StyleSheet (cleaned - removed duplicate)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  circle1: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 300,
    height: 300,
    bottom: -50,
    left: -50,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  skipBlur: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  slideContainer: {
    flex: 1,
    width,
    height,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoGlow: {
    position: 'relative',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FF69B4',
  },
  logoImage: {
    width: 110,
    height: 110,
  },
  logoEmoji: {
    fontSize: 70,
  },
  aiBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FF1493',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  aiBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logo3D: {
    width: 140,
    height: 140,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  illustration: {
    fontSize: 80,
    marginBottom: 10,
  },
  mainEmoji: {
    fontSize: 60,
  },
  illustrationEmoji: {
    fontSize: 120,
    marginBottom: 20,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  contentCard: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  cardGradient: {
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.95,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    width: 30,
    backgroundColor: '#FFFFFF',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  prevButton: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  navButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nextButton: {
    flex: 2,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
