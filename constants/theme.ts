/**
 * Design tokens for the app. Light mode only for now — keep it simple.
 * Everything visual (colour, spacing, type) should reference these tokens.
 */

import { DefaultTheme, type Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

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
} as const;

/** Max width of centred content on wide (web/desktop) screens. */
export const layout = {
  maxContentWidth: 1120,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

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
