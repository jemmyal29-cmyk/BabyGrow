/**
 * BabyGrow Theme - Centralized Design System
 * Halodoc-inspired pink theme
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borderRadius } from './borderRadius';
import { shadows } from './shadows';

// Z-index values
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Export all theme tokens
export { colors, typography, spacing, borderRadius, shadows };

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
};
