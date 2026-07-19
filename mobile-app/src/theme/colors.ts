/**
 * BabyGrow Design Tokens — Colors
 * Interim source: existing production palette (Vibrant Pink).
 * Official design file `desain ui/desainuiux.md` is currently empty (0 bytes).
 * When that file is populated, these tokens MUST be updated to match 100%.
 */

export const colors = {
  /** Convenience aliases used by legacy screens */
  white: '#FFFFFF',
  info: '#64B5F6',

  primary: {
    main: '#FF1976',
    vibrant: '#FF85A1',
    light: '#FFB3D9',
    lighter: '#FFE4F3',
    dark: '#E91E63',
    contrast: '#FFFFFF',
  },

  pink: {
    50: '#FFE4F3',
    100: '#FFB3D9',
    200: '#FF85A1',
    300: '#FF6B95',
    400: '#FF4081',
    500: '#FF1976',
    600: '#E91E63',
    700: '#C2185B',
    main: '#FF1976',
  },

  secondary: {
    pureWhite: '#FFFFFF',
    offWhite: '#FAFBFC',
    lightGray: '#F5F7FA',
    gradient: {
      pinkToWhite: ['#FF85A1', '#FFFFFF'] as const,
      vibrantPink: ['#FF6B95', '#FF85A1'] as const,
      lightPink: ['#FFB3C6', '#FFD6E3'] as const,
      softBg: ['#FFE5EC', '#FFF0F5', '#FFFFFF'] as const,
      glassPink: ['rgba(255, 133, 161, 0.2)', 'rgba(255, 255, 255, 0.1)'] as const,
    },
  },

  neutral: {
    white: '#FFFFFF',
    black: '#1A1A1A',
    gray50: '#FAFBFC',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#2D2D2D',
  },

  status: {
    success: '#81C784',
    warning: '#FFD54F',
    error: '#E57373',
    info: '#64B5F6',
  },

  stunting: {
    normal: '#81C784',
    atRisk: '#FFD54F',
    stunted: '#FFB74D',
    severelyStunted: '#E57373',
  },

  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
    elevated: '#FAFBFC',
    gradient: '#FFFFFF',
    overlay: 'rgba(255, 25, 118, 0.08)',
    glass: 'rgba(255, 255, 255, 0.9)',
  },

  text: {
    primary: '#1A1A1A',
    secondary: '#616161',
    tertiary: '#9E9E9E',
    disabled: '#BDBDBD',
    onPink: '#FFFFFF',
    onWhite: '#1A1A1A',
    inverse: '#FFFFFF',
  },

  border: {
    default: '#FFB3C6',
    light: '#FFD6E3',
    dark: '#FF85A1',
    input: '#FF85A1',
    divider: '#F5F7FA',
    glass: 'rgba(255, 133, 161, 0.2)',
  },

  chat: {
    userBubble: '#FF85A1',
    userText: '#FFFFFF',
    aiBubble: '#FFFFFF',
    aiText: '#1A1A1A',
    timestamp: '#9E9E9E',
    shadow: 'rgba(255, 133, 161, 0.15)',
  },

  effects: {
    glassPink: 'rgba(255, 133, 161, 0.2)',
    glassWhite: 'rgba(255, 255, 255, 0.7)',
    glassBlur: 'rgba(255, 255, 255, 0.5)',
    shadowPink: 'rgba(255, 107, 149, 0.25)',
    shadowLight: 'rgba(0, 0, 0, 0.08)',
    shadowMedium: 'rgba(0, 0, 0, 0.15)',
  },

  /** Admin shell accent */
  admin: {
    tabBar: '#1A237E',
  },
} as const;

export default colors;
