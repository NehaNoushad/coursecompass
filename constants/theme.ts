/**
 * Design tokens for the app. Light mode only for now — keep it simple.
 * Everything visual (colour, spacing, type) should reference these tokens.
 */

import { DefaultTheme, type Theme } from '@react-navigation/native';

export const colors = {
  // ─── Brand (sky palette — see design_prototypes/4prototype.html) ───
  // `primary` is `skyDeep`, `primaryDark` is `skyAnchor`, `primaryLight`
  // is `skyPale`. The full scale (bright/mid/deep/anchor/pale) lives
  // below for gradient stops and tinted backgrounds.
  primary: '#2D7DD2',
  primaryDark: '#1F5FA0',
  primaryLight: '#E8F4FD',

  // Sky scale — use these for gradient stops, hero backgrounds, tile
  // washes, and any place that needs a specific shade in the blue arc.
  skyPale: '#E8F4FD',
  skyBright: '#87CEEB',
  skyMid: '#4FA3E0',
  skyDeep: '#2D7DD2',
  skyAnchor: '#1F5FA0',

  // ─── Accent — coral (CTA hover, highlights, paper-plane underside) ───
  accent: '#FF8C7A',
  accentDark: '#FF6B57',

  // ─── Sun (warm highlight — final-CTA gradient stop, glow effects) ───
  sun: '#FFD93D',
  sunGlow: '#FFE680',

  // ─── Text ───
  text: '#0D2840',
  textMuted: '#4A5A6E',
  textSubtle: '#8895A6',
  textInverse: '#FFFFFF',

  // ─── Surfaces ───
  background: '#FFFFFF',
  surface: '#FBFCFE',
  surfaceAlt: '#F2F6FB',
  border: '#E2E8F0',

  // ─── Semantic ───
  success: '#16A34A',
  danger: '#DC2626',
  locked: '#94A3B8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  x2l: 32,
  x3l: 48,
  x4l: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  x2l: 28,
  x3l: 36,
  x4l: 44,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/**
 * Font-family tokens that map to the actual fonts loaded in _layout.tsx.
 * Use these instead of hardcoded family strings so we have one place to
 * swap fonts later. Sora is the brand display face; Inter / system stays
 * the body face; Caveat is the handwritten accent (sparingly).
 */
export const fontFamily = {
  display: 'Sora-Bold',
  displayHeavy: 'Sora-ExtraBold',
  displaySemibold: 'Sora-SemiBold',
  displayMedium: 'Sora-Medium',
  displayRegular: 'Sora-Regular',
  hand: 'Caveat-Bold',
  handLight: 'Caveat-Medium',
} as const;

/** Max width of centred content on wide (web/desktop) screens. */
export const layout = {
  maxContentWidth: 1120,
  /**
   * Shared page gutter — the horizontal padding every page body, hero
   * band, and footer uses, so content lines up to the same edge on every
   * screen. Use `gutterNarrow` under the page's narrow breakpoint.
   */
  gutter: 24,
  gutterNarrow: 16,
} as const;

/** Theme passed to react-navigation's ThemeProvider. */
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};
