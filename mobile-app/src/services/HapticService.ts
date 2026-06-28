/**
 * Haptic Feedback Service
 * Vibrations & Sounds untuk enhanced UX
 */

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class HapticService {
  private sound: Audio.Sound | null = null;

  // Haptic Patterns
  static async light() {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  static async medium() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  static async success() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  static async warning() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  static async error() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  // Button Press Feedback
  static async buttonPress() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Fail silently if haptics not supported
      console.log('Haptics not available');
    }
  }

  // 3D Button Press (dengan delay untuk efek depth)
  static async button3DPress() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Delayed light haptic untuk simulasi "release"
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 50);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  // Data Save Success dengan Sound
  static async dataSaveSuccess() {
    try {
      // Haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Play subtle pop sound
      // Note: Anda bisa tambahkan file sound di assets/sounds/pop.mp3
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../../assets/sounds/pop.mp3')
      // );
      // await sound.playAsync();
      // setTimeout(() => sound.unloadAsync(), 1000);
    } catch (error) {
      console.log('Sound/Haptics not available');
    }
  }
}

export default HapticService;
