/**
 * Recipe List Screen Template
 * Daftar resep Makanan Bergizi Gratis (MBG)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Neumorphic3DCard } from '../components/common/Neumorphic3DCard';
import { Neumorphic3DButton } from '../components/common/Neumorphic3DButton';

export default function RecipeListScreen({ navigation }: any) {
  return (
    <LinearGradient
      colors={['#FFE5EC', '#FFF0F5', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <Neumorphic3DCard variant="raised" style={styles.headerCard}>
              <Text style={styles.emoji}>🥘</Text>
              <Text style={styles.title}>Resep MBG</Text>
              <Text style={styles.subtitle}>
                Makanan Bergizi Gratis untuk nutrisi optimal anak
              </Text>
            </Neumorphic3DCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Neumorphic3DCard variant="glass" style={styles.infoCard}>
              <Text style={styles.infoText}>
                🍽️ Database Resep Sedang Dimuat
              </Text>
              <Text style={styles.infoDesc}>
                Smart MBG Engine akan merekomendasikan resep terbaik berdasarkan
                status gizi anak Anda.
              </Text>
            </Neumorphic3DCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Neumorphic3DButton
              title="Kembali"
              onPress={() => navigation.goBack()}
              variant="secondary"
              size="large"
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  headerCard: {
    alignItems: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  infoCard: {
    padding: 24,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  infoDesc: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 22,
  },
});
