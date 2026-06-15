/**
 * Colleges hero strip — sugar wrapper around `SkyBandHero` for the
 * /colleges catalogue page. Lays out the eyebrow chip, the coral-
 * accented count headline, and the sub-copy with an optional
 * handwritten Caveat accent.
 *
 * The sky gradient + clouds + fade are NOT defined here — they live
 * in `components/sky-band-hero.tsx` so every band-hero across the
 * site (catalogue, detail pages, courses, account) shares one
 * source of truth for the blue background and cloud positions.
 */

import { Dimensions, StyleSheet, View } from 'react-native';

import { SkyBandHero } from '@/components/sky-band-hero';
import { Text } from '@/components/ui/text';
import {
  colors,
  fontFamily,
  fontWeight,
  radius,
  spacing,
} from '@/constants/theme';

const IS_NARROW = Dimensions.get('window').width < 640;

interface Props {
  /** Eyebrow chip text in caps. */
  eyebrow: string;
  /** Large headline; split as prefix / count / suffix so the count
   * can be coral-accented inline. */
  prefix: string;
  count: number | string;
  suffix?: string;
  /** Sub-copy below the headline. Plain string, no inline accents. */
  sub: string;
  /** Optional handwritten Caveat accent shown inline at the end of the sub copy. */
  handAccent?: string;
}

export function CollegesHero({ eyebrow, prefix, count, suffix, sub, handAccent }: Props) {
  return (
    <SkyBandHero>
      <View style={styles.eyebrow}>
        <View style={styles.eyebrowDot} />
        <Text style={styles.eyebrowText}>{eyebrow}</Text>
      </View>

      <Text level={1} style={styles.title}>
        {prefix}
        <Text style={styles.titleAccent}> {count} </Text>
        {suffix}
      </Text>

      <Text style={styles.sub}>
        {sub}
        {handAccent ? (
          <Text style={styles.handAccent}> {handAccent} </Text>
        ) : null}
      </Text>
    </SkyBandHero>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    marginBottom: spacing.xl,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 2,
    color: colors.text,
  },
  title: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_NARROW ? 40 : 64,
    lineHeight: IS_NARROW ? 44 : 64,
    letterSpacing: IS_NARROW ? -1.5 : -2.5,
    color: colors.text,
    maxWidth: 720,
  },
  titleAccent: {
    // Repeat font properties because nested RN-web <Text> doesn't reliably
    // inherit family/size/lineHeight from the parent — only colour change
    // would make the accented number shrink back to the default ~14px.
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_NARROW ? 40 : 64,
    lineHeight: IS_NARROW ? 44 : 64,
    letterSpacing: IS_NARROW ? -1.5 : -2.5,
    color: colors.accent,
  },
  sub: {
    marginTop: spacing.lg,
    fontSize: IS_NARROW ? 15 : 17,
    lineHeight: IS_NARROW ? 22 : 26,
    color: colors.textMuted,
    maxWidth: 540,
  },
  handAccent: {
    fontFamily: fontFamily.hand,
    fontSize: IS_NARROW ? 20 : 24,
    color: colors.skyAnchor,
    lineHeight: IS_NARROW ? 22 : 26,
  },
});
