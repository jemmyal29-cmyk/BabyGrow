/**
 * BabyGrow Design Tokens — Typography
 * Source: desainuiux.md — Plus Jakarta Sans (loaded via expo-font)
 *
 * Use named weight families so Android/iOS get correct cuts without
 * synthesizing bold on top of a bold file.
 */

import { TextStyle } from 'react-native';

export const fontFamilies = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const typography = {
  fontFamily: {
    regular: fontFamilies.regular,
    medium: fontFamilies.medium,
    semiBold: fontFamilies.semiBold,
    bold: fontFamilies.bold,
    extraBold: fontFamilies.extraBold,
    display: fontFamilies.extraBold,
    headline: fontFamilies.bold,
    body: fontFamilies.medium,
    label: fontFamilies.bold,
    button: fontFamilies.bold,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 32,
    huge: 40,
    display: 40,
  },

  lineHeight: {
    labelCaps: 16,
    button: 20,
    body: 24,
    headlineMobile: 32,
    headline: 36,
    display: 48,
    tight: 1.1,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.7,
  },

  fontWeight: {
    light: '300' as TextStyle['fontWeight'],
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semiBold: '600' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extraBold: '800' as TextStyle['fontWeight'],
  },

  letterSpacing: {
    display: -0.8,
    headline: -0.28,
    labelCaps: 0.6,
    tighter: -0.8,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1.0,
    widest: 1.5,
  },

  /** Named styles matching desainuiux.md */
  styles: {
    displayLg: {
      fontFamily: fontFamilies.extraBold,
      fontSize: 40,
      lineHeight: 48,
      letterSpacing: -0.8,
    },
    headlineLg: {
      fontFamily: fontFamilies.bold,
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: -0.28,
    },
    headlineLgMobile: {
      fontFamily: fontFamilies.bold,
      fontSize: 24,
      lineHeight: 32,
    },
    bodyMd: {
      fontFamily: fontFamilies.medium,
      fontSize: 16,
      lineHeight: 24,
    },
    buttonText: {
      fontFamily: fontFamilies.bold,
      fontSize: 16,
      lineHeight: 20,
    },
    labelCaps: {
      fontFamily: fontFamilies.bold,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.6,
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
    brandMark: {
      fontFamily: fontFamilies.extraBold,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: -0.5,
    },
  },
} as const;

export default typography;
