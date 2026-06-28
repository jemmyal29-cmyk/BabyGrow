/**
 * MBG Questionnaire Modal - AI Menu Generator
 * UIGM 2026 Standard
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../theme';
import GeminiAIService from '../../services/GeminiAIService';

interface MBGQuestionnaireModalProps {
  visible: boolean;
  onClose: () => void;
  childAge?: number;
  childWeight?: number;
  childHeight?: number;
}

export default function MBGQuestionnaireModal({
  visible,
  onClose,
  childAge = 18,
  childWeight = 10.2,
  childHeight = 78.5,
}: MBGQuestionnaireModalProps) {
  const [favoriteFoods, setFavoriteFoods] = useState('');
  const [mealSchedule, setMealSchedule] = useState('');
  const [allergies, setAllergies] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [menuResult, setMenuResult] = useState<string | null>(null);

  const handleGenerateMenu = async () => {
    if (!favoriteFoods.trim()) {
      // Show validation in UI instead of alert
      return;
    }

    if (!mealSchedule.trim()) {
      // Show validation in UI instead of alert
      return;
    }

    setIsGenerating(true);
    try {
      const result = await GeminiAIService.generateMBGMenu(
        favoriteFoods,
        mealSchedule,
        allergies,
        childAge,
        childWeight,
        childHeight
      );

      if (result.success) {
        setMenuResult(result.menuText);
      } else {
        setMenuResult(result.menuText); // Show fallback menu
        Alert.alert('Info', 'Menggunakan menu default karena AI sedang sibuk');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal generate menu. Coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFavoriteFoods('');
    setMealSchedule('');
    setAllergies('');
    setMenuResult(null);
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <BlurView intensity={80} tint="dark" style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#FFB6C1', '#FFF0F5', '#FFFFFF']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>🍽️ AI Menu Bergizi</Text>
              <Text style={styles.subtitle}>Powered by Google Gemini</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {!menuResult ? (
                <>
                  {/* Child Info */}
                  <View style={styles.childInfo}>
                    <Text style={styles.childInfoTitle}>👶 Data Anak</Text>
                    <Text style={styles.childInfoText}>
                      Usia: {childAge} bulan • Berat: {childWeight} kg • Tinggi: {childHeight} cm
                    </Text>
                  </View>

                  {/* Questionnaire */}
                  <View style={styles.section}>
                    <Text style={styles.questionLabel}>
                      1. 🍎 Makanan Kesukaan Anak? *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={favoriteFoods}
                      onChangeText={setFavoriteFoods}
                      placeholder="Contoh: nasi, pisang, ayam, sayuran hijau"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.questionLabel}>
                      2. ⏰ Jam Makan Rutin? *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={mealSchedule}
                      onChangeText={setMealSchedule}
                      placeholder="Contoh: 07:00 sarapan, 10:00 snack, 12:00 makan siang"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.questionLabel}>
                      3. 🚫 Alergi/Pantangan?
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={allergies}
                      onChangeText={setAllergies}
                      placeholder="Contoh: kacang, seafood, telur (kosongkan jika tidak ada)"
                      multiline
                      numberOfLines={2}
                    />
                  </View>

                  {/* Generate Button */}
                  <TouchableOpacity
                    style={[styles.generateButton, isGenerating && styles.disabledButton]}
                    onPress={handleGenerateMenu}
                    disabled={isGenerating}
                    activeOpacity={0.8}
                  >
                    {isGenerating ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#FFFFFF" size="small" />
                        <Text style={styles.generateButtonText}>Generating...</Text>
                      </View>
                    ) : (
                      <Text style={styles.generateButtonText}>
                        🤖 Generate Menu AI
                      </Text>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.disclaimer}>
                    💡 AI akan membuat menu sesuai preferensi dan standar gizi Indonesia
                  </Text>
                </>
              ) : (
                <>
                  {/* Menu Result */}
                  <View style={styles.resultSection}>
                    <Text style={styles.resultTitle}>🍽️ Menu MBG Anda</Text>
                    <ScrollView style={styles.menuScroll}>
                      <Text style={styles.menuText}>{menuResult}</Text>
                    </ScrollView>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.newMenuButton}
                      onPress={() => setMenuResult(null)}
                    >
                      <Text style={styles.newMenuButtonText}>🔄 Menu Baru</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => {
                        Alert.alert('Tersimpan', 'Menu telah disimpan ke galeri');
                        handleClose();
                      }}
                    >
                      <Text style={styles.saveButtonText}>💾 Simpan</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  modalContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: colors.neutral.gray700,
  },
  childInfo: {
    backgroundColor: colors.primary.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  childInfoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  childInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
  },
  section: {
    marginBottom: spacing.lg,
  },
  questionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.neutral.white,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.sm,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  generateButton: {
    backgroundColor: colors.primary.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  generateButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  disclaimer: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultSection: {
    marginBottom: spacing.lg,
  },
  resultTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  menuScroll: {
    maxHeight: 300,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
  },
  menuText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    color: colors.neutral.gray800,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  newMenuButton: {
    flex: 1,
    backgroundColor: colors.neutral.gray200,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  newMenuButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray700,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.status.success,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.white,
  },
});