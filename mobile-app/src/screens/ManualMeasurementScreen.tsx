/**
 * Manual Measurement Screen with IoT Auto-Fill
 * Zero-Input UX: Automatically filled from sensor data
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Neumorphic3DCard } from '../components/common/Neumorphic3DCard';
import { Neumorphic3DButton } from '../components/common/Neumorphic3DButton';
import MQTTService from '../services/MQTTService';
import HapticService from '../services/HapticService';
import { calculateAgeInMonths, calculateHeightForAge, calculateWeightForAge } from '../utils/zScoreCalculator';

export default function ManualMeasurementScreen({ navigation }: any) {
  const [height, setHeight] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [isAutoFilled, setIsAutoFilled] = React.useState(false);
  const mqttService = React.useMemo(() => MQTTService.getInstance(), []);

  // Auto-fill from IoT sensor on mount
  React.useEffect(() => {
    const latestData = mqttService.getLatestMeasurement();
    if (latestData && latestData.height_cm > 0) {
      setHeight(latestData.height_cm.toFixed(1));
      setWeight(latestData.weight_kg > 0 ? latestData.weight_kg.toFixed(1) : '');
      setIsAutoFilled(true);
      HapticService.success();
      
      Alert.alert(
        '✅ Data Terdeteksi',
        `Tinggi: ${latestData.height_cm.toFixed(1)} cm\\nData otomatis terisi dari sensor IoT!`,
        [{ text: 'OK' }]
      );
    }
  }, []);

  const handleSave = async () => {
    if (!height) {
      Alert.alert('Error', 'Tinggi badan harus diisi');
      return;
    }

    await HapticService.buttonPress();

    // Mock child data for Z-Score calculation
    const childData = {
      dateOfBirth: '2023-06-15',
      gender: 'male' as const,
    };

    const ageMonths = calculateAgeInMonths(childData.dateOfBirth);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight || '0');

    // Calculate Z-Scores using WHO standards
    let zScoreHeight, zScoreWeight;
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
      `Tinggi: ${height} cm\\nBerat: ${weight || '-'} kg\\n\\nZ-Score Tinggi: ${zScoreHeight?.zscore || '-'}\\nStatus: ${zScoreHeight?.category || '-'}\\n\\nData berhasil disimpan!`,
      [
        {
          text: 'Kembali',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#FFE5EC', '#FFF0F5', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <Neumorphic3DCard variant="raised" style={styles.headerCard}>
              <Text style={styles.emoji}>⚖️</Text>
              <Text style={styles.title}>Ukur Manual</Text>
              <Text style={styles.subtitle}>
                {isAutoFilled ? '✅ Data terisi otomatis dari sensor' : 'Input data pengukuran anak'}
              </Text>
            </Neumorphic3DCard>
          </Animated.View>

          {/* Height Input */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Neumorphic3DCard variant="glass" style={styles.inputCard}>
              <Text style={styles.inputLabel}>📏 Tinggi Badan (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="78.5"
                keyboardType="decimal-pad"
                value={height}
                onChangeText={setHeight}
                placeholderTextColor="#BDBDBD"
              />
              {isAutoFilled && (
                <Text style={styles.autoFillBadge}>🤖 Auto-filled dari IoT</Text>
              )}
            </Neumorphic3DCard>
          </Animated.View>

          {/* Weight Input */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <Neumorphic3DCard variant="glass" style={styles.inputCard}>
              <Text style={styles.inputLabel}>⚖️ Berat Badan (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="10.2"
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
                placeholderTextColor="#BDBDBD"
              />
            </Neumorphic3DCard>
          </Animated.View>

          {/* Info */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Neumorphic3DCard variant="flat" style={styles.infoCard}>
              <Text style={styles.infoText}>💡 Tips</Text>
              <Text style={styles.infoDesc}>
                Jika alat IoT terhubung, data tinggi akan terisi otomatis.
                Anda tinggal memeriksa dan menyimpan!
              </Text>
            </Neumorphic3DCard>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <Neumorphic3DButton
              title="Simpan Pengukuran"
              onPress={handleSave}
              variant="primary"
              size="large"
              icon="✅"
            />
            <Neumorphic3DButton
              title="Kembali"
              onPress={() => navigation.goBack()}
              variant="secondary"
              size="large"
            />
          </View>
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
    gap: 20,
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
  inputCard: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#FF69B4',
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#FF69B4',
    textAlign: 'center',
  },
  autoFillBadge: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
  },
  infoCard: {
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 22,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 8,
  },
});
