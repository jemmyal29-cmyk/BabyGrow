/**
 * BabyGrow Design Tokens — Spacing
 * Source: desainuiux.md
 * section-margin: 40 | container-padding: 24 | stack-gap: 16 | element-gap: 12
 */

export const spacing = {
  xs: 4,
  sm: 8,
  element: 12, // element-gap
  md: 16, // stack-gap
  lg: 24, // container-padding
  xl: 32,
  section: 40, // section-margin
  xxl: 48,

  /** Named aliases from design file */
  containerPadding: 24,
  stackGap: 16,
  elementGap: 12,
  sectionMargin: 40,
} as const;

export default spacing;
