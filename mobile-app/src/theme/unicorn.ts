/**
 * 🦄 BABYGROW UNICORN DESIGN SYSTEM 2026
 * Pink-White 3D Neu-Glassmorphism
 * 
 * Design Philosophy:
 * - Dominan Soft Pink (#FFC1CC) & Clean White (#FFFFFF)
 * - Bayangan berlapis untuk efek 3D "muncul" keluar layar
 * - Glassmorphism dengan blur untuk depth perception
 * - Smooth animations dengan Reanimated
 */

import { Platform, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// ==================== 3D DEPTH SYSTEM ====================

export const shadows3D = {
  // Neumorphic Shadows (Soft UI)
  neumorphic: {
    light: {
      shadowColor: '#000000',
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    },
    lightInner: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: -8, height: -8 },
      shadowOpacity: 0.7,
      shadowRadius: 16,
    },
    pressed: {
      // Inset shadow effect (simulated with inner components)
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 0,
    },
  },

  // Glassmorphism
  glass: {
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      // Note: expo-blur will be used for actual blur
    },
    overlay: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  },

  // Elevated 3D
  elevated: {
    low: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    high: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 16,
    },
  },

  // Pink Glow (Brand)
  pink: {
    soft: {
      shadowColor: '#FF69B4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    vibrant: {
      shadowColor: '#FF69B4',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
  },
};

// ==================== 3D TRANSFORM UTILITIES ====================

export const transform3D = {
  perspective: 1000,
  
  // Card tilt effects
  tilt: {
    light: {
      transform: [
        { perspective: 1000 },
        { rotateX: '5deg' },
        { rotateY: '5deg' },
      ],
    },
    medium: {
      transform: [
        { perspective: 1000 },
        { rotateX: '10deg' },
        { rotateY: '10deg' },
      ],
    },
  },

  // Scale animations
  scale: {
    pressed: { transform: [{ scale: 0.96 }] },
    hover: { transform: [{ scale: 1.02 }] },
  },
};

// ==================== BLUR LEVELS ====================

export const blur = {
  none: 0,
  light: 10,
  medium: 20,
  strong: 40,
  ultra: 60,
};

// ==================== UIGM COLORS (Updated) ====================

export const colors = {
  // Primary Pink
  primary: {
    50: '#FFE4F3',
    100: '#FFB6D9',
    200: '#FF8EC0',
    300: '#FF69B4', // Main
    400: '#F06292',
    500: '#E91E63',
    600: '#C2185B',
    700: '#AD1457',
    vibrant: '#FF69B4',
    light: '#FFB6C1',
    dark: '#C71585',
  },

  // Secondary Coral
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA07A', // Main
    500: '#FF9800',
    600: '#FB8C00',
    pureWhite: '#FFFFFF',
  },

  // Neutral Grays (Extended)
  neutral: {
    white: '#FFFFFF',
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
    black: '#000000',
  },

  // Status Colors
  status: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },

  // Stunting Risk (WHO-based)
  stunting: {
    normal: '#4CAF50',      // Green
    atRisk: '#FFC107',      // Amber
    stunted: '#FF9800',     // Orange
    severe: '#F44336',      // Red
  },

  // Background
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.7)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    white: '#FFFFFF',
    placeholder: '#9E9E9E',
  },

  // Border
  border: {
    default: '#E0E0E0',
    input: '#BDBDBD',
    focus: '#FF69B4',
  },
};

// ==================== GRADIENTS (3D Effect) ====================

export const gradients = {
  primary: {
    colors: ['#FF69B4', '#FFA07A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  light: {
    colors: ['#FFB6C1', '#FFD4B8'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  glass: {
    colors: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  neumorphic: {
    colors: ['#F5F5F5', '#FFFFFF', '#F5F5F5'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// ==================== ANIMATION CONFIGS (Reanimated) ====================

export const animations = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  timing: {
    duration: 300,
  },
  bounce: {
    damping: 10,
    stiffness: 100,
  },
};

// ==================== SPACING (Extended) ====================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ==================== BORDER RADIUS (Extended) ====================

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

// ==================== TYPOGRAPHY (Extended) ====================

export const typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semiBold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 42,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// ==================== Z-INDEX ====================

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// ==================== HARDWARE ACCELERATION UTILS ====================

export const hardwareAcceleration = {
  // Enable GPU rendering
  gpu: {
    renderToHardwareTextureAndroid: true,
    shouldRasterizeIOS: true,
  },
  
  // Transform optimization
  transform: {
    translateZ: 0,
  },
};

// ==================== PRESETS FOR COMMON USE CASES ====================

export const presets = {
  // 3D Card with Neumorphic shadow
  neumorphicCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows3D.neumorphic.light,
    ...hardwareAcceleration.gpu,
  },

  // Glass Card with blur
  glassCard: {
    backgroundColor: colors.background.glass,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...hardwareAcceleration.gpu,
  },

  // Floating Action Button
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.vibrant,
    ...shadows3D.pink.vibrant,
    ...hardwareAcceleration.gpu,
  },

  // Input Field (3D)
  input3D: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows3D.neumorphic.pressed,
    borderWidth: 1,
    borderColor: colors.border.input,
  },
};

// ==================== EXPORT ALL ====================

export default {
  colors,
  shadows3D,
  transform3D,
  blur,
  gradients,
  animations,
  spacing,
  borderRadius,
  typography,
  zIndex,
  hardwareAcceleration,
  presets,
};
