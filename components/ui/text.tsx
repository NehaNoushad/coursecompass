import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { colors, fontSize, fontWeight } from '@/constants/theme';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption';

const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  display: { fontSize: fontSize.x3l, fontWeight: fontWeight.bold, lineHeight: fontSize.x3l * 1.15 },
  title: { fontSize: fontSize.x2l, fontWeight: fontWeight.bold, lineHeight: fontSize.x2l * 1.2 },
  heading: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, lineHeight: fontSize.xl * 1.3 },
  subheading: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, lineHeight: fontSize.lg * 1.4 },
  body: { fontSize: fontSize.md, fontWeight: fontWeight.regular, lineHeight: fontSize.md * 1.5 },
  bodySmall: { fontSize: fontSize.sm, fontWeight: fontWeight.regular, lineHeight: fontSize.sm * 1.5 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, lineHeight: fontSize.sm * 1.4 },
  caption: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, lineHeight: fontSize.xs * 1.4 },
};

interface Props extends TextProps {
  variant?: TextVariant;
  /** Use the muted grey colour. */
  muted?: boolean;
  /** Override colour entirely. */
  color?: string;
  center?: boolean;
}

export function Text({ variant = 'body', muted, color, center, style, ...rest }: Props) {
  return (
    <RNText
      style={[
        VARIANT_STYLES[variant],
        { color: color ?? (muted ? colors.textMuted : colors.text) },
        center && { textAlign: 'center' },
        style,
      ]}
      {...rest}
    />
  );
}
