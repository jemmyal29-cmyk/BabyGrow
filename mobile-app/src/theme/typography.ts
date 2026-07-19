/**
 * BabyGrow Design Tokens — Typography
 * Source: desainuiux.md — Plus Jakarta Sans scale
 */

import { TextStyle } from 'react-native';

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    /** Production: load Plus Jakarta Sans via expo-font */
    display: 'System',
    headline: 'System',
    body: 'System',
    label: 'System',
    button: 'System',
  },

  fontSize: {
    xs: 12, // label-caps
    sm: 14,
    md: 16, // body-md / button-text
    lg: 20,
    xl: 24, // headline-lg-mobile
    xxl: 28, // headline-lg
    xxxl: 32,
    huge: 40, // display-lg
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
    medium: '500' as TextStyle['fontWeight'], // body-md
    semiBold: '600' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'], // headline / button / label
    extraBold: '800' as TextStyle['fontWeight'], // display-lg
  },

  letterSpacing: {
    display: -0.8, // -0.02em @ 40px
    headline: -0.28, // -0.01em @ 28px
    labelCaps: 0.6, // 0.05em @ 12px
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
      fontSize: 40,
      lineHeight: 48,
      fontWeight: '800' as TextStyle['fontWeight'],
      letterSpacing: -0.8,
    },
    headlineLg: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: -0.28,
    },
    headlineLgMobile: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700' as TextStyle['fontWeight'],
    },
    bodyMd: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500' as TextStyle['fontWeight'],
    },
    buttonText: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '700' as TextStyle['fontWeight'],
    },
    labelCaps: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: 0.6,
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
  },
} as const;

export default typography;
