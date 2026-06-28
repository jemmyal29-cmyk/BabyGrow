/**
 * Hook untuk mengelola custom notifications
 * Menggantikan Alert.alert dengan UI yang lebih indah
 */

import { useState, useCallback } from 'react';

interface NotificationOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showNotification = useCallback((options: NotificationOptions) => {
    setNotification({
      visible: true,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      onConfirm: options.onConfirm,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Batal',
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, visible: false }));
  }, []);

  // Helper functions untuk tipe spesifik
  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showNotification({
      title,
      message,
      type: 'success',
      onConfirm,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showNotification({
      title,
      message,
      type: 'error',
      onConfirm,
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showNotification({
      title,
      message,
      type: 'warning',
      onConfirm,
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showNotification({
      title,
      message,
      type: 'info',
      onConfirm,
    });
  }, [showNotification]);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void,
    confirmText: string = 'Ya',
    cancelText: string = 'Batal'
  ) => {
    showNotification({
      title,
      message,
      type: 'warning',
      onConfirm,
      confirmText,
      cancelText,
    });
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
};