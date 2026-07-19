/**
 * BabyGrow Design Tokens — Border Radius
 * Source: desainuiux.md + layout usage (cards 24, buttons full/pill)
 */

export const borderRadius = {
  none: 0,
  DEFAULT: 4, // 0.25rem
  sm: 8, // 0.5rem / lg in design
  md: 12, // 0.75rem / xl in design
  lg: 16,
  xl: 24, // media / card radius used in mockups
  xxl: 32,
  pill: 9999,
  full: 9999,
  /** Back-compat */
  xs: 8,
} as const;

export default borderRadius;
