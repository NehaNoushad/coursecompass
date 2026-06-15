import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { colors, fontFamily, fontSize, fontWeight } from '@/constants/theme';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption';

// Display variants use Sora (the brand display face). The weight comes
// baked into the loaded font file, so we set fontFamily but NOT
// fontWeight on these — having both can produce platform-specific
// synthesis weirdness. Body / label / caption stay on the system stack
// since Inter isn't loaded yet and the system fonts render well enough.
const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  display:    { fontFamily: fontFamily.displayHeavy,    fontSize: fontSize.x3l, lineHeight: fontSize.x3l * 1.05, letterSpacing: -1.2 },
  title:      { fontFamily: fontFamily.display,         fontSize: fontSize.x2l, lineHeight: fontSize.x2l * 1.15, letterSpacing: -0.8 },
  heading:    { fontFamily: fontFamily.displaySemibold, fontSize: fontSize.xl,  lineHeight: fontSize.xl  * 1.25, letterSpacing: -0.4 },
  subheading: { fontFamily: fontFamily.displayMedium,   fontSize: fontSize.lg,  lineHeight: fontSize.lg  * 1.35, letterSpacing: -0.2 },
  body:       { fontSize: fontSize.md, fontWeight: fontWeight.regular,  lineHeight: fontSize.md * 1.5 },
  bodySmall:  { fontSize: fontSize.sm, fontWeight: fontWeight.regular,  lineHeight: fontSize.sm * 1.5 },
  label:      { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, lineHeight: fontSize.sm * 1.4 },
  caption:    { fontSize: fontSize.xs, fontWeight: fontWeight.medium,   lineHeight: fontSize.xs * 1.4 },
};

/**
 * Default heading level per display variant. On web these render as
 * `role="heading"` + `aria-level=N`, which search engines and screen
 * readers treat as real headings (RN-web renders Text as a <div>, so
 * this is how we get semantic heading structure for SEO). Body / label /
 * caption stay plain text. Pass an explicit `level` to override — e.g.
 * a page's hero name should be `level={1}` so each page has one H1.
 */
const VARIANT_HEADING_LEVEL: Partial<Record<TextVariant, number>> = {
  display: 1,
  title: 1,
  heading: 2,
  subheading: 3,
};

interface Props extends TextProps {
  variant?: TextVariant;
  /** Use the muted grey colour. */
  muted?: boolean;
  /** Override colour entirely. */
  color?: string;
  center?: boolean;
  /**
   * Force a heading level (1–6) regardless of variant — or `0` to opt a
   * heading-styled Text out of being a semantic heading.
   */
  level?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function Text({ variant = 'body', muted, color, center, level, style, ...rest }: Props) {
  const headingLevel = level ?? VARIANT_HEADING_LEVEL[variant];
  const headingProps =
    headingLevel && headingLevel > 0
      ? ({ role: 'heading', 'aria-level': headingLevel } as const)
      : null;

  return (
    <RNText
      {...headingProps}
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
