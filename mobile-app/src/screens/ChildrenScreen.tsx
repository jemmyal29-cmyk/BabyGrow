import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';
import type { Child } from '../types/models';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type RootStackParamList = {
  Home: undefined;
  Children: undefined;
  Growth: undefined;
  Profile: undefined;
};

type ChildrenScreenProps = {
  navigation: BottomTabNavigationProp<RootStackParamList, 'Children'>;
};

interface ChildDisplay extends Pick<Child, 'id' | 'name' | 'gender'> {
  birthDate: string;
  age: string;
  weight: string;
  height: string;
  status: string;
  emoji: string;
}

export default function ChildrenScreen({ navigation }: ChildrenScreenProps) {
  const handleAddChild = () => {
    // Navigate to AddChild full page screen (ANTI POP-UP POLICY)
    const rootNavigation = (navigation as any).getParent();
    if (rootNavigation) {
      rootNavigation.navigate('AddChild');
    }
  };

  const handleChildPress = (child: ChildDisplay) => {
    // Navigate to ChildDetail full page screen (ANTI POP-UP POLICY)
    const rootNavigation = (navigation as any).getParent();
    if (rootNavigation) {
      rootNavigation.navigate('ChildDetail', { child });
    }
  };

  const handleGrowthChart = (child: ChildDisplay) => {
    navigation.navigate('Growth');
  };

  const handleMeasure = (child: ChildDisplay) => {
    // Navigate to Measurement Input full page (future implementation)
    Alert.alert(
      '📏 Ukur ' + child.name,
      'Halaman input pengukuran akan terbuka.\n\n' +
      'Form akan berisi:\n\n' +
      '• Berat Badan (kg)\n' +
      '• Tinggi Badan (cm)\n' +
      '• Lingkar Kepala (cm)\n' +
      '• Tanggal Pengukuran\n' +
      '• Catatan (opsional)\n\n' +
      'Setelah disimpan, AI akan menganalisis dan memberikan rekomendasi',
      [{ text: 'Mengerti', style: 'default' }]
    );
  };

  const handleAnalyze = (child: ChildDisplay) => {
    Alert.alert(
      '🤖 Analisis AI',
      'AI akan menganalisis pertumbuhan ' + child.name + ' berdasarkan data terakhir',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Analisis Sekarang',
          onPress: () => {
            // Simulasi analisis AI
            setTimeout(() => {
              Alert.alert(
                '✨ Hasil Analisis AI',
                '📊 Pertumbuhan ' + child.name + ':\n\n' +
                '✅ Berat: Normal (Z-score: 0.2)\n' +
                '✅ Tinggi: Normal (Z-score: -0.5)\n' +
                '✅ Status: Sehat\n\n' +
                '💡 Rekomendasi:\n' +
                '• Pertahankan pola makan bergizi\n' +
                '• Lanjutkan pemantauan rutin\n' +
                '• Konsultasi rutin setiap bulan\n\n' +
                'Untuk analisis lengkap, chat dengan BabyGrow AI',
                [
                  { text: 'Tutup', style: 'cancel' },
                  { text: 'Chat AI', onPress: () => (navigation as any).getParent()?.navigate('AIAssistant') }
                ]
              );
            }, 500);
          }
        }
      ]
    );
  };

  const handleEdit = (child: ChildDisplay) => {
    Alert.alert(
      '✏️ Edit Data',
      'Edit informasi ' + child.name,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Edit',
          onPress: () => {
            Alert.alert(
              '📝 Form Edit',
              'Anda dapat mengubah:\n\n' +
              '• Nama: ' + child.name + '\n' +
              '• Tanggal Lahir: ' + child.birthDate + '\n' +
              '• Foto Profil\n' +
              '• Data Lahir\n' +
              '• Catatan\n\n' +
              'Fitur edit sedang dalam pengembangan',
              [{ text: 'Mengerti', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const [children] = useState<ChildDisplay[]>([
    {
      id: '1',
      name: 'Aisha Putri',
      gender: 'female',
      birthDate: '15 Mei 2024',
      age: '8 bulan',
      weight: '8.2 kg',
      height: '68 cm',
      status: 'Sehat',
      emoji: '👧',
    },
    {
      id: '2',
      name: 'Budi Santoso',
      gender: 'male',
      birthDate: '20 Jan 2023',
      age: '3 tahun',
      weight: '14.5 kg',
      height: '95 cm',
      status: 'Sehat',
      emoji: '👦',
    },
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil Anak</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddChild}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Tambah Anak</Text>
          </TouchableOpacity>
        </View>

        {/* Children List */}
        {children.map((child) => (
          <TouchableOpacity 
            key={child.id} 
            style={styles.childCard}
            onPress={() => handleChildPress(child)}
            activeOpacity={0.9}
          >
            {/* Header Card */}
            <View style={styles.cardHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarEmoji}>{child.emoji}</Text>
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childMeta}>
                  {child.gender} • {child.age}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>✓ {child.status}</Text>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Berat Badan</Text>
                <Text style={styles.statValue}>{child.weight}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Tinggi Badan</Text>
                <Text style={styles.statValue}>{child.height}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Lahir</Text>
                <Text style={styles.statValue}>{child.birthDate}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleGrowthChart(child)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionText}>Grafik</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleMeasure(child)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>📏</Text>
                <Text style={styles.actionText}>Ukur</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleAnalyze(child)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>🤖</Text>
                <Text style={styles.actionText}>Analisis</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEdit(child)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>✏️</Text>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Tambahkan data anak untuk memulai monitoring pertumbuhan dengan AI
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding untuk bottom tabs
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
  },
  addButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  childCard: {
    backgroundColor: colors.background.paper,
    margin: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.xl,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFE4F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  childInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  childName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
  },
  childMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.status.success,
    fontWeight: typography.fontWeight.semiBold,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.default,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  actionRow: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.paper,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actionIcon: {
    fontSize: typography.fontSize.xxl,
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});
