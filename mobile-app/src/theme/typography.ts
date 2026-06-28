/**
 * Typography Design Tokens
 * Filosofi: VIBRANT PINK & ELEGANT WHITE (Premium Typography)
 * Font: Poppins (Modern, Friendly, Premium)
 * Fallback: System (untuk development, production gunakan custom fonts)
 */

import { TextStyle } from 'react-native';

export const typography = {
  // Font Family - Premium Typography (Poppins/Montserrat style)
  fontFamily: {
    regular: 'System',      // Fallback (Production: 'Poppins-Regular')
    medium: 'System',       // Production: 'Poppins-Medium'
    semiBold: 'System',     // Production: 'Poppins-SemiBold'
    bold: 'System',         // Production: 'Poppins-Bold'
    // Note: Untuk production, install:
    // - Poppins: Modern, friendly, premium
    // - Montserrat: Clean, elegant, professional
    // Command: expo install expo-font @expo-google-fonts/poppins
  },
  
  fontSize: {
    xs: 11,    // Small captions, labels
    sm: 13,    // Secondary text, helper text
    md: 15,    // Body text (primary reading size)
    lg: 17,    // Large body, emphasized text
    xl: 19,    // Section headers
    xxl: 24,   // Page titles, card headers
    xxxl: 30,  // Large titles, hero text
    huge: 38,  // Extra large (splash, welcome)
    display: 48, // Display text (marketing, hero)
  },
  
  lineHeight: {
    tight: 1.1,      // Headers, titles (compact)
    snug: 1.3,       // Sub-headers
    normal: 1.5,     // Body text (comfortable reading)
    relaxed: 1.7,    // Long-form content
    loose: 2.0,      // Extra spacing (poems, quotes)
  },
  
  fontWeight: {
    light: '300' as TextStyle['fontWeight'],      // Light text (rare use)
    regular: '400' as TextStyle['fontWeight'],    // Normal text
    medium: '500' as TextStyle['fontWeight'],     // Medium emphasis
    semiBold: '600' as TextStyle['fontWeight'],   // Sub-headers, important
    bold: '700' as TextStyle['fontWeight'],       // Headers, buttons
    extraBold: '800' as TextStyle['fontWeight'],  // Hero titles, emphasis
    black: '900' as TextStyle['fontWeight'],      // Ultra emphasis (rare)
  },
  
  // Letter Spacing - Premium Typography Feel
  letterSpacing: {
    tighter: -0.8,   // Compact headers
    tight: -0.5,     // Headers
    normal: 0,       // Body text
    wide: 0.5,       // Buttons, labels
    wider: 1.0,      // Uppercase headings
    widest: 1.5,     // Display text, branding
  },
};

export default typography;
