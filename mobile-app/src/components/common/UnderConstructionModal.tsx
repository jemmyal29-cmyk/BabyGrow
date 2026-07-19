/**
 * UnderConstructionModal — desainuiux.md tokens
 */

import React from 'react';
import { Modal, View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, typography, shadows, spacing, borderRadius } from '../../theme';
import { Card } from './Card';
import { Button } from './Button';

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card variant="elevated" padding="large" style={styles.card}>
          <Text style={styles.icon}>🚧</Text>
          <Text style={styles.title}>{featureName} Sedang Dikembangkan</Text>
          <Text style={styles.description}>
            Tim kami sedang bekerja keras untuk menghadirkan fitur ini. Mohon tunggu ya!
          </Text>
          <Button title="Mengerti" onPress={onClose} fullWidth />
        </Card>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 28, 28, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.containerPadding,
  },
  card: {
    width: width - 48,
    maxWidth: 400,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    ...shadows.diffusion,
  },
  icon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.styles.headlineLgMobile,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

export default UnderConstructionModal;
