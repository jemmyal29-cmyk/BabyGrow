/**
 * Custom notification component untuk menggantikan Alert.alert
 * Design premium dengan pink theme untuk Expo Go compatibility
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

interface NotificationProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const CustomNotification: React.FC<NotificationProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Batal',
}) => {
  const { isDark } = { isDark: false }; // Temporary fix
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Set langsung dulu biar tidak "invisible" kalau animasi macet (web)
      slideAnim.setValue(1);
      scaleAnim.setValue(1);
    } else {
      slideAnim.setValue(0);
      scaleAnim.setValue(0);
    }
  }, [visible, slideAnim, scaleAnim]);

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', color: colors.status.success, bgColor: colors.tertiary.fixed };
      case 'error':
        return { icon: '❌', color: colors.status.error, bgColor: colors.status.errorContainer };
      case 'warning':
        return { icon: '⚠️', color: colors.status.warning, bgColor: colors.primary.fixed };
      default:
        return { icon: '💗', color: colors.primary.main, bgColor: colors.primary.fixed };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  const handleBackdropPress = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
                {
                  scale: scaleAnim,
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            {/* Header dengan icon */}
            <View style={[styles.header, { backgroundColor: bgColor }]}>
              <Text style={styles.icon}>{icon}</Text>
              <Text style={[styles.title, { color }]}>{title}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={[styles.message, { color: isDark ? colors.text.inverse : colors.text.primary }]}>
                {message}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {onConfirm && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.confirmButton, 
                  { backgroundColor: color }
                ]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.effects.shadowMedium,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: Math.min(width - 40, 350),
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface.lowest,
    overflow: 'hidden',
    ...shadows.medium,
  },
  modalContent: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.effects.shadowLight,
  },
  icon: {
    fontSize: typography.fontSize.xxxl,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  message: {
    ...typography.styles.bodyMd,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.element,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.element,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: colors.primary.main,
  },
  confirmButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.neutral.gray300,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});

export default CustomNotification;
