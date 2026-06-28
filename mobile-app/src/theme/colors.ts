/**
 * BabyGrow Color Palette - VIBRANT PINK ORIGINAL
 * PINK DOMINAN & MENARIK - Desain yang Anda Suka!
 */

export const colors = {
  // Primary Colors - VIBRANT PINK CERAH (KAI-INSPIRED FRESH!)
  primary: {
    main: '#FF1976',      // Vibrant Pink - FRESH & ENERGETIC!
    vibrant: '#FF85A1',   // Light Vibrant Pink - CHEERFUL!
    light: '#FFB3D9',     // Soft Pink
    lighter: '#FFE4F3',   // Ultra Soft Pink
    dark: '#E91E63',      // Dark Vibrant Pink - BOLD!
    contrast: '#FFFFFF',  // Pure White text on pink
  },
  
  // Pink Shades for Gradients & Layers (VIBRANT PINK!)
  pink: {
    50: '#FFE4F3',        // Ultra light vibrant pink
    100: '#FFB3D9',       // Very light vibrant pink
    200: '#FF85A1',       // Light vibrant pink
    300: '#FF6B95',       // Medium vibrant pink
    400: '#FF4081',       // Main vibrant pink
    500: '#FF1976',       // Deep Vibrant Pink - ENERGETIC!
    600: '#E91E63',       // Dark Vibrant Pink - BOLD!
    700: '#C2185B',       // Darkest Pink
    main: '#FF1976',      // Alias for main
  },
  
  // Secondary Colors - Elegant White & Soft Gradients
  secondary: {
    pureWhite: '#FFFFFF', // Pure white - Primary container color
    offWhite: '#FAFBFC',  // Off-white - Subtle backgrounds
    lightGray: '#F5F7FA', // Light gray - Dividers, borders
    gradient: {
      pinkToWhite: ['#FF85A1', '#FFFFFF'],     // Pink to white gradient
      vibrantPink: ['#FF6B95', '#FF85A1'],     // Vibrant pink gradient
      lightPink: ['#FFB3C6', '#FFD6E3'],       // Light pink gradient
      glassPink: ['rgba(255, 133, 161, 0.2)', 'rgba(255, 255, 255, 0.1)'], // Glassmorphism
    },
  },
  
  // Neutral Colors - Clean & Professional (High-End)
  neutral: {
    white: '#FFFFFF',     // Pure White - Clean & elegant
    black: '#1A1A1A',     // Rich Black - Premium feel
    gray50: '#FAFBFC',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',   // Text secondary
    gray700: '#616161',   // Text primary (not black)
    gray800: '#424242',
    gray900: '#2D2D2D',
  },
  
  // Status Colors - Soft Medical Tones
  status: {
    success: '#81C784',   // Soft Green - Less intense
    warning: '#FFD54F',   // Soft Yellow - Gentle warning
    error: '#E57373',     // Soft Red - Not alarming
    info: '#64B5F6',      // Soft Blue - Calming info
  },
  
  // Stunting Risk Colors - Medical Professional
  stunting: {
    normal: '#81C784',         // Soft Green - Healthy
    atRisk: '#FFD54F',         // Soft Yellow - Attention needed
    stunted: '#FFB74D',        // Soft Orange - Care required
    severelyStunted: '#E57373', // Soft Red - Immediate care
  },
  
  // Background Colors - Pure White & Fresh Pink Balance
  background: {
    default: '#FFFFFF',    // Pure White - Clean & professional (NO PINK BG!)
    paper: '#FFFFFF',      // Pure White - Clean & professional
    elevated: '#FAFBFC',   // Off-white - Elevated surfaces
    gradient: '#FFFFFF',   // White for gradient overlays
    overlay: 'rgba(255, 25, 118, 0.08)', // Very light pink overlay
    glass: 'rgba(255, 255, 255, 0.9)',   // Glassmorphism background
  },
  
  // Text Colors - High Contrast (Premium Readability)
  text: {
    primary: '#1A1A1A',    // Rich Black - Premium feel
    secondary: '#616161',  // Dark Gray - Secondary info
    tertiary: '#9E9E9E',   // Medium Gray - Hints
    disabled: '#BDBDBD',   // Light Gray - Disabled
    onPink: '#FFFFFF',     // White text on pink
    onWhite: '#1A1A1A',    // Black text on white
    inverse: '#FFFFFF',    // White text
  },
  
  // Border Colors - Vibrant Pink & Clean White
  border: {
    default: '#FFB3C6',    // Light vibrant pink
    light: '#FFD6E3',      // Very light pink
    dark: '#FF85A1',       // Vibrant pink
    input: '#FF85A1',      // Input borders (vibrant pink)
    divider: '#F5F7FA',    // Clean divider (light gray)
    glass: 'rgba(255, 133, 161, 0.2)', // Glassmorphism border
  },
  
  // Chat Bubble Colors - Modern & Contrast
  chat: {
    userBubble: '#FF85A1',      // Vibrant pink for user
    userText: '#FFFFFF',        // White text on pink
    aiBubble: '#FFFFFF',        // White for AI (glassmorphism)
    aiText: '#1A1A1A',          // Rich black text
    timestamp: '#9E9E9E',       // Gray timestamp
    shadow: 'rgba(255, 133, 161, 0.15)', // Soft shadow
  },
  
  // Menu Card Colors - Vibrant & Modern
  menuCard: {
    pink: '#FF85A1',       // Vibrant pink
    lightPink: '#FFB3C6',  // Light vibrant pink
    white: '#FFFFFF',      // Pure white
    glass: 'rgba(255, 255, 255, 0.7)', // Glassmorphism
    blue: '#64B5F6',       // Vibrant blue
    purple: '#BA68C8',     // Vibrant purple
    green: '#81C784',      // Vibrant green
    orange: '#FFB74D',     // Vibrant orange
  },
  
  // Glassmorphism & Neumorphism Effects
  effects: {
    glassPink: 'rgba(255, 133, 161, 0.2)',
    glassWhite: 'rgba(255, 255, 255, 0.7)',
    glassBlur: 'rgba(255, 255, 255, 0.5)',
    neumorphLight: '#FFFFFF',
    neumorphDark: 'rgba(0, 0, 0, 0.05)',
    shadowPink: 'rgba(255, 107, 149, 0.25)',
    shadowLight: 'rgba(0, 0, 0, 0.08)',
    shadowMedium: 'rgba(0, 0, 0, 0.15)',
  },

};

export default colors;
