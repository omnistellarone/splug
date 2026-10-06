/**
 * Slurge Electronics — Kalki Premium Mobile Design System Tokens
 * Source: docs/stitch_designs/kalki_premium/DESIGN.md
 */

export const colors = {
  // Brand & Accents
  brand: "#4F46E5",
  brandDark: "#1D1C5C",
  brandLight: "#F3F5FF",
  primary: "#3525cd",
  primaryContainer: "#4F46E5",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#DAD7FF",

  // Surfaces & Backgrounds
  background: "#F8F9FD",
  canvas: "#F4F5F9",
  surface: "#FFFFFF",
  surfaceContainerLow: "#F2F3F7",
  surfaceContainer: "#EDEEF2",
  surfaceContainerHigh: "#E7E8EC",

  // Text Hierarchy
  textPrimary: "#111827",
  textSecondary: "#464555",
  textMuted: "#6B7280",
  textPlaceholder: "#9CA3AF",

  // Borders & Dividers
  border: "#E8E9F0",
  borderSubtle: "#D7D9E1",
  outline: "#777587",
  outlineVariant: "#C7C4D8",

  // Feedback & Status
  success: "#139546",
  successLight: "#E8F7ED",
  danger: "#D5413A",
  dangerLight: "#FDECEC",
  warning: "#A47200",
  warningLight: "#FEF7E6",
  info: "#0681D4",
  infoLight: "#E6F4FE",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 40,
};

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: "700" as const, lineHeight: 38 },
  headlineLg: { fontSize: 26, fontWeight: "700" as const, lineHeight: 32 },
  headlineMd: { fontSize: 22, fontWeight: "600" as const, lineHeight: 28 },
  headlineSm: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  bodyLg: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  bodySm: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: "600" as const, lineHeight: 20 },
  labelSm: { fontSize: 12, fontWeight: "600" as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: "500" as const, lineHeight: 14 },
};
