/**
 * TypeScript theme tokens for programmatic access to design system values.
 * These values mirror the CSS custom properties in globals.css.
 * Use CSS variables in components; use these tokens for JS calculations.
 */

export const colors = {
  // Cool Palette
  apexBlue: "#44546A",
  teal1: "#37B3A2",
  teal2: "#9FE2D8",
  teal3: "#EAFDF8",

  // Warm Palette
  orange1: "#E7792B",
  orange2: "#EE9F2D",
  orange3: "#F7C85E",
  yellow: "#F9E661",

  // Neutral Palette
  logoGrey: "#7C95A5",
  grey1: "#808083",
  grey2: "#D2DDE8",
  white: "#FFFFFF",

  // Semantic
  primary: "#44546A",
  primaryHover: "#374759",
  secondary: "#37B3A2",
  secondaryHover: "#2E9A8B",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  sidebarBg: "#F1F5F9",
  sidebarHover: "#D2DDE8",
  border: "#D2DDE8",
  textPrimary: "#44546A",
  textSecondary: "#7C95A5",
  textMuted: "#808083",
  error: "#DC2626",
  success: "#37B3A2",
  warning: "#E7792B",

  // Chat
  chatUserBubbleBg: "#44546A",
  chatUserBubbleText: "#FFFFFF",
  chatAiBubbleBg: "#EAFDF8",
  chatAiBubbleText: "#44546A",
  chatInputBg: "#FFFFFF",
  chatInputBorder: "#D2DDE8",
  chatInputFocusBorder: "#44546A",
} as const;

export const fontSizes = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
} as const;

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeights = {
  tight: 1.25,
  base: 1.5,
  relaxed: 1.75,
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
} as const;

export const layout = {
  sidebarWidth: "280px",
  sidebarCollapsedWidth: "0px",
  headerHeight: "64px",
  chatInputHeight: "56px",
  chatMaxWidth: "768px",
} as const;

export const radii = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
} as const;

export const theme = {
  colors,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  layout,
  radii,
  shadows,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type FontSizes = typeof fontSizes;
export type FontWeights = typeof fontWeights;
export type Spacing = typeof spacing;
export type Layout = typeof layout;
export type Radii = typeof radii;
export type Shadows = typeof shadows;
