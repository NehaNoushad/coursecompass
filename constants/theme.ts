/**
 * Design tokens for the app. Light mode only for now — keep it simple.
 * Everything visual (colour, spacing, type) should reference these tokens.
 */

import { DefaultTheme, type Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

export const colors = {
  // Brand
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  accent: '#F59E0B',
  accentDark: '#D97706',

  // Text
  text: '#0F172A',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',

  // Surfaces
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',

  // Semantic
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
