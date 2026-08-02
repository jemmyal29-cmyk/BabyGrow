/**
 * Cross-platform alert — RN Alert is a no-op on web.
 */

import { Alert, Platform } from 'react-native';

export type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons as never);
    return;
  }

  const opts =
    buttons && buttons.length > 0 ? buttons : [{ text: 'OK' as const }];
  const body = [title, message].filter(Boolean).join('\n');

  if (opts.length === 1) {
    window.alert(body);
    opts[0].onPress?.();
    return;
  }

  const cancel = opts.find((b) => b.style === 'cancel');
  const confirm =
    opts.find((b) => b.style === 'destructive') ||
    opts.find((b) => b.style !== 'cancel') ||
    opts[opts.length - 1];

  if (window.confirm(body)) {
    confirm?.onPress?.();
  } else {
    cancel?.onPress?.();
  }
}
