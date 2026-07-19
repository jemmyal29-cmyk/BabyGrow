/**
 * BabyGrow Theme — Design System (desainuiux.md)
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borderRadius } from './borderRadius';
import { shadows } from './shadows';

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

export { colors, typography, spacing, borderRadius, shadows };

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
} as const;

export type Theme = typeof theme;
export default theme;
