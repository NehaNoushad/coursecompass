/**
 * Colleges hero strip — short sky-gradient band at the top of the
 * /colleges catalogue page (and reusable for /courses later). It's
 * NOT a marketing hero like sky-hero on the home page — just a
 * shoulder-height band that sets the brand atmosphere, carries a
 * count + a tagline, and fades into the paper-coloured body below.
 *
 * Visual stack:
 *   1. cyan → azure LinearGradient filling the band
 *   2. two-to-three soft cloud SVGs at staggered positions
 *   3. eyebrow chip + big headline (with a coral-accented count)
 *      + sub copy with a handwritten Caveat accent
 *
 * The lower edge fades into the page's paper background via a
 * second LinearGradient so the next section doesn't start on a
 * hard band.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';

const IS_NARROW = Dimensions.get('window').width < 640;

interface Props {
  /** Eyebrow chip text in caps. */
  eyebrow: string;
  /** Large headline; render { count } inline by passing prefix/suffix. */
  prefix: string;
  count: number | string;
  suffix?: string;
  /** Sub-copy below the headline. Plain string, no inline accents. */
  sub: string;
  /** Optional handwritten Caveat accent shown inline in the sub copy. */
  handAccent?: string;
}

function CloudShape() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 240 100">
      <Ellipse cx={60} cy={65} rx={50} ry={32} fill="white" />
      <Ellipse cx={115} cy={50} rx={55} ry={38} fill="white" />
      <Ellipse cx={170} cy={60} rx={45} ry={32} fill="white" />
    </Svg>
  );
}

export function CollegesHero({ eyebrow, prefix, count, suffix, sub, handAccent }: Props) {
  return (
    <View style={styles.band}>
      <LinearGradient
        colors={[colors.skyBright, colors.skyMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative cloud puffs. Pinned with percentage offsets so they
          stay roughly in place at any width without going off-screen. */}
      <View style={[styles.cloud, styles.cloud1]} pointerEvents="none">
        <CloudShape />
      </View>
      <View style={[styles.cloud, styles.cloud2]} pointerEvents="none">
        <CloudShape />
      </View>
      <View style={[styles.cloud, styles.cloud3]} pointerEvents="none">
        <CloudShape />
      </View>

      {/* Soft fade into the body below so the gradient doesn't end on a hard line. */}
      <LinearGradient
        colors={['transparent', colors.background]}
        style={styles.fade}
        pointerEvents="none"
      />

      <View style={styles.inner}>
        <View style={styles.eyebrow}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrowText}>{eyebrow}</Text>
        </View>

        <Text style={styles.title}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'relative',
    overflow: 'hidden',
    paddingTop: IS_NARROW ? spacing.x3l : spacing.x4l,
    paddingBottom: IS_NARROW ? spacing.x3l : spacing.x4l + spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: IS_NARROW ? 240 : 300,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    zIndex: 1,
  },
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

  // Cloud positioning — three puffs at staggered offsets so the band
  // feels populated without crowding the headline.
  cloud: {
    position: 'absolute',
    pointerEvents: 'none',
    opacity: 0.9,
  },
  cloud1: {
    width: 260,
    height: 100,
    top: 24,
    right: '5%',
    opacity: 0.85,
  },
  cloud2: {
    width: 180,
    height: 70,
    bottom: '30%',
    right: '25%',
    opacity: 0.7,
  },
  cloud3: {
    width: 220,
    height: 85,
    bottom: -10,
    left: '-2%',
    opacity: 0.6,
  },
});
