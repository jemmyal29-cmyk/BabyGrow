/**
 * Shadow Design Tokens
 * Filosofi: VIBRANT PINK & ELEGANT WHITE
 * Premium shadows untuk glassmorphism & neumorphism
 */

export const shadows = {
  // Soft Shadows (Ultra Soft - Modern Clean)
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  
  // Standard Shadow (Cards, Buttons - Soft & Elegant)
  standard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  
  // Medium Shadow (Elevated Cards - Soft Floating)
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  
  // Large Shadow (Full Pages - Premium Depth)
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  
  // Pink Shadow - Soft & Professional (High-End)
  pink: {
    shadowColor: '#FF6B95',  // Vibrant Pink
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,     // Very subtle - high-end look
    shadowRadius: 20,        // Soft blur
    elevation: 6,
  },
  
  // Card Shadow - Glassmorphism Style (Very Subtle)
  card: {
    shadowColor: '#000000',  // Neutral shadow for glass effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,     // Very subtle - glassmorphism
    shadowRadius: 24,        // Soft, wide blur
    elevation: 4,
  },
  
  // Elevated Card Shadow - Premium depth
  cardElevated: {
    shadowColor: '#FF6B95',  // Pink tint
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  
  // Glassmorphism Shadow (Subtle, Blurred)
  glass: {
    shadowColor: '#FF85A1',  // Light pink tint
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  
  // Neumorphism Shadow (Soft Depth)
  neumorphic: {
    light: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: -4, height: -4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
  },
  
  // Deprecated (keep for backwards compatibility)
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
};

export default shadows;
