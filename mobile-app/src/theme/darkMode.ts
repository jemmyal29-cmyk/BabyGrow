/**
 * Dark Mode Theme - Deep Purple/Pink Dark
 * Unicorn 2026 Standard
 */

export const darkTheme = {
  // Background Colors
  background: {
    primary: '#1A0E2E', // Deep Purple Dark
    secondary: '#2D1B3D',
    tertiary: '#3D2548',
    card: '#2D1B3D',
    modal: 'rgba(29, 14, 46, 0.95)',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#E0B3FF',
    tertiary: '#B794F6',
    disabled: '#6B5B95',
    inverse: '#1A0E2E',
  },

  // Primary Colors (Pink)
  primary: {
    main: '#FF69B4',
    light: '#FFB6C1',
    dark: '#C71585',
    glow: 'rgba(255, 105, 180, 0.4)',
  },

  // Accent Colors (Purple)
  accent: {
    main: '#9B59B6',
    light: '#C39BD3',
    dark: '#6C3483',
    glow: 'rgba(155, 89, 182, 0.4)',
  },

  // Status Colors
  status: {
    success: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
  },

  // Glassmorphism
  glass: {
    background: 'rgba(45, 27, 61, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },

  // Gradients
  gradients: {
    primary: ['#FF69B4', '#9B59B6'],
    secondary: ['#9B59B6', '#6C3483'],
    accent: ['#FF69B4', '#FFA07A'],
    dark: ['#1A0E2E', '#2D1B3D'],
    card: ['rgba(45, 27, 61, 0.8)', 'rgba(61, 37, 72, 0.6)'],
  },

  // Shadows
  shadows: {
    small: {
      shadowColor: '#FF69B4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    medium: {
      shadowColor: '#9B59B6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
      elevation: 15,
    },
  },

  // Border Radius
  borderRadius: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    round: 9999,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

export const lightTheme = {
  // Background Colors
  background: {
    primary: '#FAFAFA',
    secondary: '#FFFFFF',
    tertiary: '#F5F5F5',
    card: '#FFFFFF',
    modal: 'rgba(255, 255, 255, 0.98)',
  },

  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    tertiary: '#9E9E9E',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },

  // Primary Colors (Pink)
  primary: {
    main: '#FF69B4',
    light: '#FFB6C1',
    dark: '#C71585',
    glow: 'rgba(255, 105, 180, 0.2)',
  },

  // Accent Colors (Coral)
  accent: {
    main: '#FFA07A',
    light: '#FFD4B8',
    dark: '#FF7F50',
    glow: 'rgba(255, 160, 122, 0.2)',
  },

  // Status Colors
  status: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },

  // Glassmorphism
  glass: {
    background: 'rgba(255, 255, 255, 0.7)',
    border: 'rgba(0, 0, 0, 0.05)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  // Gradients
  gradients: {
    primary: ['#FF69B4', '#FFA07A'],
    secondary: ['#FFB6C1', '#FFD4B8'],
    accent: ['#FFA07A', '#FFD4B8'],
    dark: ['#616161', '#424242'],
    card: ['rgba(255, 255, 255, 0.9)', 'rgba(245, 245, 245, 0.7)'],
  },

  // Shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
  },

  // Border Radius
  borderRadius: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    round: 9999,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

export type Theme = typeof lightTheme;
