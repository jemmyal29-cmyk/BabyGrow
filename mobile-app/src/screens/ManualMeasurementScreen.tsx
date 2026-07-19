/**
 * Manual Measurement Screen with IoT Auto-Fill
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Button } from '../components/common';
import MQTTService from '../services/MQTTService';
import HapticService from '../services/HapticService';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  calculateAgeInMonths,
  calculateHeightForAge,
  calculateWeightForAge,
} from '../utils/zScoreCalculator';

export default function ManualMeasurementScreen({ navigation }: any) {
  const [height, setHeight] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [isAutoFilled, setIsAutoFilled] = React.useState(false);
  const mqttService = React.useMemo(() => MQTTService.getInstance(), []);

  React.useEffect(() => {
    const latestData = mqttService.getLatestMeasurement();
    if (latestData && latestData.height_cm > 0) {
      setHeight(latestData.height_cm.toFixed(1));
      setWeight(latestData.weight_kg > 0 ? latestData.weight_kg.toFixed(1) : '');
      setIsAutoFilled(true);
      HapticService.success();

      Alert.alert(
        'Data Terdeteksi',
        `Tinggi: ${latestData.height_cm.toFixed(1)} cm\nData otomatis terisi dari sensor IoT!`,
        [{ text: 'OK' }]
      );
    }
  }, [mqttService]);

  const handleSave = async () => {
    if (!height) {
      Alert.alert('Error', 'Tinggi badan harus diisi');
      return;
    }

    await HapticService.buttonPress();

    const childData = {
      dateOfBirth: '2023-06-15',
      gender: 'male' as const,
    };

    const ageMonths = calculateAgeInMonths(childData.dateOfBirth);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight || '0');

    let zScoreHeight;
    let zScoreWeight;
    try {
      zScoreHeight = calculateHeightForAge(heightNum, ageMonths, childData.gender);
      if (weightNum > 0) {
        zScoreWeight = calculateWeightForAge(weightNum, ageMonths, childData.gender);
      }
    } catch (error) {
      console.error('Z-Score calculation error:', error);
    }

    Alert.alert(
      'Pengukuran Tersimpan',
      `Tinggi: ${height} cm\nBerat: ${weight || '-'} kg\n\nZ-Score Tinggi: ${zScoreHeight?.zscore ?? '-'}\nStatus: ${zScoreHeight?.category ?? '-'}${zScoreWeight ? `\nZ-Score Berat: ${zScoreWeight.zscore}` : ''}\n\nData berhasil disimpan!`,
      [{ text: 'Kembali', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <LinearGradient colors={[...colors.secondary.gradient.softBg]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <Card variant="elevated" padding="large" style={styles.headerCard}>
              <Text style={styles.emoji}>⚖️</Text>
              <Text style={styles.title}>Ukur Manual</Text>
              <Text style={styles.subtitle}>
                {isAutoFilled
                  ? 'Data terisi otomatis dari sensor'
                  : 'Input data pengukuran anak'}
              </Text>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Card variant="glass" padding="large" style={styles.inputCard}>
              <Text style={styles.inputLabel}>Tinggi Badan (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="78.5"
                keyboardType="decimal-pad"
                value={height}
                onChangeText={setHeight}
                placeholderTextColor={colors.text.disabled}
              />
              {isAutoFilled ? (
                <Text style={styles.autoFillBadge}>Auto-filled dari IoT</Text>
              ) : null}
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <Card variant="glass" padding="large" style={styles.inputCard}>
              <Text style={styles.inputLabel}>Berat Badan (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="10.2"
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
                placeholderTextColor={colors.text.disabled}
              />
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Card variant="outlined" padding="large">
              <Text style={styles.infoText}>Tips</Text>
              <Text style={styles.infoDesc}>
                Jika alat IoT terhubung, data tinggi akan terisi otomatis. Anda tinggal
                memeriksa dan menyimpan!
              </Text>
            </Card>
          </Animated.View>

          <View style={styles.buttonGroup}>
            <Button title="Simpan Pengukuran" onPress={handleSave} size="large" fullWidth />
            <Button
              title="Kembali"
              onPress={() => navigation.goBack()}
              variant="secondary"
              size="large"
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerCard: { alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  inputCard: {},
  inputLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.paper,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    textAlign: 'center',
  },
  autoFillBadge: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.status.success,
    textAlign: 'center',
  },
  infoText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.status.info,
    marginBottom: spacing.sm,
  },
  infoDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  buttonGroup: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
