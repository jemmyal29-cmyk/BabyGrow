/**
 * BabyGrow Design Tokens — Typography
 * Interim source pending `desain ui/desainuiux.md`.
 */

import { TextStyle } from 'react-native';

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },

  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 19,
    xxl: 24,
    xxxl: 30,
    huge: 38,
    display: 48,
  },

  lineHeight: {
    tight: 1.1,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.7,
    loose: 2.0,
  },

  fontWeight: {
    light: '300' as TextStyle['fontWeight'],
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semiBold: '600' as TextStyle['fontWeight'],
    /** @deprecated use semiBold */
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extraBold: '800' as TextStyle['fontWeight'],
  },

  letterSpacing: {
    tighter: -0.8,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1.0,
    widest: 1.5,
  },
} as const;

export default typography;
