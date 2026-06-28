/**
 * Bottom Sheet Component
 * Lembaran dari bawah untuk fitur under development
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface FeatureBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  featureName: string;
  featureIcon: string;
  description: string;
}

const { height } = Dimensions.get('window');

export const FeatureBottomSheet: React.FC<FeatureBottomSheetProps> = ({
  visible,
  onClose,
  featureName,
  featureIcon,
  description,
}) => {
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(height, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, [visible]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          </Pressable>
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View style={[styles.sheet, animatedSheetStyle]}>
          <LinearGradient
            colors={['#FFFFFF', '#FFF0F5']}
            style={styles.sheetContent}
          >
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Icon dengan 3D Effect */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{featureIcon}</Text>
                <View style={styles.iconGlow} />
              </View>

              <Text style={styles.title}>{featureName}</Text>
              <Text style={styles.description}>{description}</Text>

              {/* AI Animation Indicator */}
              <View style={styles.aiIndicator}>
                <View style={styles.aiDot} />
                <View style={styles.aiDot} />
                <View style={styles.aiDot} />
              </View>

              <Text style={styles.statusText}>
                🤖 AI sedang menyiapkan data...
              </Text>

              {/* Close Button */}
              <Pressable style={styles.closeButton} onPress={onClose}>
                <LinearGradient
                  colors={['#FF69B4', '#FFC1CC']}
                  style={styles.closeButtonGradient}
                >
                  <Text style={styles.closeButtonText}>Mengerti</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetContent: {
    paddingBottom: 32,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  contentContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  icon: {
    fontSize: 64,
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF69B4',
    opacity: 0.2,
    transform: [{ scale: 1.2 }],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  aiIndicator: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  aiDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF69B4',
  },
  statusText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  closeButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  closeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
