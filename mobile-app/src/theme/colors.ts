/**
 * BabyGrow Design Tokens — Colors
 * Source of truth: mobile-app/desain ui/desainuiux.md (Tailwind / M3 palette)
 */

export const colors = {
  /** Brand */
  primary: {
    main: '#b60059',
    container: '#e30071',
    fixed: '#ffd9e1',
    fixedDim: '#ffb1c4',
    onPrimary: '#ffffff',
    onContainer: '#fffbff',
    onFixed: '#3f001a',
    onFixedVariant: '#8f0044',
    /** @deprecated aliases for gradual migration */
    vibrant: '#e30071',
    light: '#ffb1c4',
    lighter: '#ffd9e1',
    dark: '#8f0044',
    contrast: '#ffffff',
  },

  /** Surfaces — light professional */
  background: {
    default: '#f9f9f9',
    paper: '#ffffff',
    elevated: '#f3f3f4',
    dim: '#dadada',
    container: '#eeeeee',
    containerHigh: '#e8e8e8',
    containerHighest: '#e2e2e2',
    overlay: 'rgba(182, 0, 89, 0.08)',
    glass: 'rgba(255, 255, 255, 0.2)',
    gradient: '#f9f9f9',
  },

  surface: {
    default: '#f9f9f9',
    lowest: '#ffffff',
    low: '#f3f3f4',
    mid: '#eeeeee',
    high: '#e8e8e8',
    highest: '#e2e2e2',
    bright: '#f9f9f9',
    variant: '#e2e2e2',
    tint: '#ba005b',
  },

  text: {
    primary: '#1a1c1c',
    secondary: '#5e5e5e',
    tertiary: '#5c3f46',
    disabled: '#c6c6c6',
    inverse: '#ffffff',
    onPink: '#ffffff',
    onWhite: '#1a1c1c',
    onBackground: '#1a1c1c',
    onSurface: '#1a1c1c',
    onSurfaceVariant: '#5c3f46',
  },

  secondary: {
    main: '#5e5e5e',
    container: '#e2e2e2',
    onSecondary: '#ffffff',
    onContainer: '#646464',
    fixed: '#e2e2e2',
    fixedDim: '#c6c6c6',
    pureWhite: '#ffffff',
    offWhite: '#f9f9f9',
    lightGray: '#f3f3f4',
    gradient: {
      softBg: ['#f9f9f9', '#f3f3f4', '#ffffff'] as const,
      pinkToWhite: ['#ffb1c4', '#ffffff'] as const,
      vibrantPink: ['#e30071', '#b60059'] as const,
      lightPink: ['#ffd9e1', '#ffb1c4'] as const,
      glassPink: ['rgba(182, 0, 89, 0.12)', 'rgba(255, 255, 255, 0.2)'] as const,
    },
  },

  outline: {
    default: '#906e76',
    variant: '#e5bcc5',
  },

  border: {
    default: '#e5bcc5',
    light: '#ffd9e1',
    dark: '#906e76',
    input: '#e5bcc5',
    divider: '#eeeeee',
    glass: 'rgba(182, 0, 89, 0.15)',
  },

  status: {
    success: '#008820',
    warning: '#c9a227',
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
    onError: '#ffffff',
    info: '#2196F3',
  },

  stunting: {
    normal: '#008820',
    atRisk: '#c9a227',
    stunted: '#e67e22',
    severelyStunted: '#ba1a1a',
  },

  tertiary: {
    main: '#006b17',
    container: '#008820',
    fixed: '#7ffd7c',
    fixedDim: '#63e063',
    onTertiary: '#ffffff',
  },

  /** Legacy pink scale → mapped to design primary */
  pink: {
    50: '#ffd9e1',
    100: '#ffb1c4',
    200: '#ffb1c4',
    300: '#e30071',
    400: '#e30071',
    500: '#b60059',
    600: '#8f0044',
    700: '#3f001a',
    main: '#b60059',
  },

  neutral: {
    white: '#ffffff',
    black: '#1a1c1c',
    gray50: '#f9f9f9',
    gray100: '#f3f3f4',
    gray200: '#eeeeee',
    gray300: '#e2e2e2',
    gray400: '#c6c6c6',
    gray500: '#5e5e5e',
    gray600: '#5e5e5e',
    gray700: '#474747',
    gray800: '#2f3131',
    gray900: '#1a1c1c',
  },

  chat: {
    userBubble: '#b60059',
    userText: '#ffffff',
    aiBubble: '#ffffff',
    aiText: '#1a1c1c',
    timestamp: '#5e5e5e',
    shadow: 'rgba(182, 0, 89, 0.15)',
  },

  effects: {
    glassPink: 'rgba(182, 0, 89, 0.1)',
    glassWhite: 'rgba(255, 255, 255, 0.2)',
    glassBlur: 'rgba(255, 255, 255, 0.4)',
    shadowPink: 'rgba(182, 0, 89, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.04)',
    shadowMedium: 'rgba(0, 0, 0, 0.08)',
    primaryGlow: 'rgba(182, 0, 89, 0.3)',
  },

  admin: {
    tabBar: '#2f3131',
  },

  /** Convenience */
  white: '#ffffff',
  info: '#2196F3',
} as const;

export default colors;
