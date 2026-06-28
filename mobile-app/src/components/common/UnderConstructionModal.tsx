/**
 * UnderConstructionModal Component
 * Modal cantik untuk fitur yang sedang dalam pengembangan
 * Filosofi: VIBRANT PINK & ELEGANT WHITE
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors, typography, shadows, spacing } from '@theme';
import { GlassCard } from './GlassCard';

interface UnderConstructionModalProps {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
}

export const UnderConstructionModal: React.FC<UnderConstructionModalProps> = ({
  visible,
  onClose,
  featureName = 'Fitur',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <GlassCard variant="white" style={styles.card}>
          {/* Icon - Construction Emoji */}
          <Text style={styles.icon}>🚧</Text>
          
          {/* Title */}
          <Text style={styles.title}>
            {featureName} Sedang Dikembangkan
          </Text>
          
          {/* Description */}
          <Text style={styles.description}>
            Tim kami sedang bekerja keras untuk menghadirkan fitur ini. 
            Mohon tunggu ya! ✨
          </Text>
          
          {/* Close Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Mengerti</Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: width - 60,
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.large,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.vibrant,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.tight,
  },
  description: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary.vibrant,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    ...shadows.pink,
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.white,
    letterSpacing: typography.letterSpacing.wide,
  },
});

export default UnderConstructionModal;
