/**
 * Sky hero — the prototype-4 home-page hero, ported to React Native.
 *
 * Visual stack (back to front):
 *   1. cyan→azure LinearGradient filling the section
 *   2. soft glowing sun in the upper-right
 *   3. four SVG clouds at staggered positions, each drifting horizontally
 *      via react-native-reanimated (matching the prototype's CSS keyframes)
 *   4. paper-plane SVG
 *   5. centred content: eyebrow chip + big "Look up. / Way up." headline
 *      + sub copy with a Caveat handwritten accent + CTA row + a
 *      handwritten "free for 10 min, no signup" note next to the buttons
 *
 * Sizing: hero is at least 85% of the initial viewport height (min 600px)
 * so it always feels like a full-screen statement on web; on mobile it
 * scales down via the Dimensions snapshot.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  Polygon,
  Stop,
} from 'react-native-svg';

import { LinkButton } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { APP_NAME } from '@/constants/app';
import { COLLEGES, COURSES } from '@/data';
import { useAuth } from '@/lib/auth';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_MIN_HEIGHT = Math.max(620, SCREEN_H * 0.88);
const IS_NARROW = SCREEN_W < 720;
const HEADLINE_SIZE = IS_NARROW
  ? Math.max(56, SCREEN_W * 0.14)
  : Math.min(140, SCREEN_W * 0.12);

// ───────── Small SVG building blocks ─────────

function CloudShape({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.42} viewBox="0 0 240 100">
      <Ellipse cx={60} cy={65} rx={50} ry={32} fill="white" />
      <Ellipse cx={115} cy={50} rx={55} ry={38} fill="white" />
      <Ellipse cx={170} cy={60} rx={45} ry={32} fill="white" />
    </Svg>
  );
}

/**
 * Drifting cloud. Wraps a CloudShape in an Animated.View that gently
 * oscillates horizontally — drifts a short distance in one direction,
 * then reverses, then forward again. Reads as ambient air-motion rather
 * than a one-way march off-screen.
 *
 * `direction` decides which way the first half of each cycle goes:
 *   right → 0 → +distance → 0 → +distance → …
 *   left  → 0 → -distance → 0 → -distance → …
 *
 * Using `withRepeat(..., -1, true)` so reanimated handles the reversal
 * with a smooth ease curve and no visible snap. `distance` is kept
 * small (40-100px) so the motion is subtle, not theatrical.
 */
function DriftingCloud({
  size,
  duration,
  direction,
  distance,
  style,
}: {
  size: number;
  duration: number;
  direction: 'right' | 'left';
  distance: number;
  style: object;
}) {
  const x = useSharedValue(0);
  useEffect(() => {
    const target = direction === 'right' ? distance : -distance;
    x.value = withRepeat(
      withTiming(target, { duration, easing: Easing.inOut(Easing.sin) }),
      -1, // infinite
      true, // reverse on each iteration → smooth back-and-forth
    );
  }, [x, duration, direction, distance]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.View style={[styles.cloud, style, animStyle]} pointerEvents="none">
      <CloudShape size={size} />
    </Animated.View>
  );
}

function PaperPlane({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        <SvgLinearGradient id="plane-fill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor={colors.skyPale} />
        </SvgLinearGradient>
      </Defs>
      <Polygon
        points="10,40 70,15 60,45"
        fill="url(#plane-fill)"
        stroke={colors.skyAnchor}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Polygon
        points="60,45 40,55 70,15"
        fill="#B8DCEF"
        stroke={colors.skyAnchor}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ───────── Main component ─────────

export function SkyHero() {
  const { hasTakenQuiz } = useAuth();
  return (
    <View style={styles.hero}>
      {/* Sky gradient — fills the whole hero */}
      <LinearGradient
        colors={[colors.skyBright, colors.skyMid, colors.skyDeep]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft fade into the next section so the gradient doesn't end on a hard band */}
      <LinearGradient
        colors={['transparent', colors.background]}
        style={styles.heroFade}
        pointerEvents="none"
      />

      {/* Sun — radial glow in the top-right */}
      <View style={styles.sunWrap} pointerEvents="none">
        <View style={styles.sunOuter}>
          <View style={styles.sunMid}>
            <View style={styles.sunCore} />
          </View>
        </View>
      </View>

      {/* Clouds gently oscillate. Short distances (50-100px) + long
          durations (15-22s one-way) read as ambient air-motion. Each
          cloud has its own period + amplitude so the motion stays
          desynced and natural-looking. */}
      <DriftingCloud size={260} duration={18_000} direction="right" distance={80}  style={styles.cloud1} />
      <DriftingCloud size={180} duration={22_000} direction="left"  distance={60}  style={styles.cloud2} />
      <DriftingCloud size={300} duration={25_000} direction="right" distance={100} style={styles.cloud3} />
      <DriftingCloud size={200} duration={15_000} direction="left"  distance={70}  style={styles.cloud4} />

      {/* Paper plane — the brand mascot */}
      <View style={styles.planeWrap} pointerEvents="none">
        <PaperPlane size={80} />
      </View>

      {/* Centred content */}
      <View style={styles.heroInner}>
        <View style={styles.eyebrow}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrowText}>FOR KERALA 12TH-PASS STUDENTS</Text>
        </View>

        <Text style={[styles.h1, { fontSize: HEADLINE_SIZE }]}>Look up.</Text>
        <Text style={[styles.h1, styles.h1Accent, { fontSize: HEADLINE_SIZE }]}>
          Way up.
        </Text>

        <Text style={styles.heroSub}>
          {COLLEGES.length} colleges. {COURSES.length} courses. <Text style={styles.handAccent}>endless</Text> directions. {APP_NAME} helps you pick the one that fits — built for Kerala 12th-pass students.
        </Text>

        <View style={styles.ctaRow}>
          <LinkButton
            href="/quiz"
            label={hasTakenQuiz ? 'Take it again →' : 'Take the quiz →'}
            size="lg"
          />
          <LinkButton
            href="/colleges"
            label={`Browse ${COLLEGES.length} colleges`}
            size="lg"
            variant="ghost"
            style={styles.ghostBtn}
          />
          {!IS_NARROW && (
            <Text style={styles.ctaNote}>↖ free for 10 min, no signup</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'relative',
    minHeight: HERO_MIN_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingVertical: spacing.x4l,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },

  // ─── Sun (concentric radial-ish via nested circles) ───
  sunWrap: {
    position: 'absolute',
    top: '10%',
    right: '8%',
  },
  sunOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 230, 128, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunMid: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 230, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.sun,
  },

  // ─── Clouds ───
  cloud: {
    position: 'absolute',
    opacity: 0.95,
  },
  // Cloud base positions. With the new back-and-forth motion the
  // clouds stay roughly where they're placed; the offsets pull each
  // one partly off-screen so the oscillation slides them in and out
  // of view without revealing the snap-back of a one-directional loop.
  cloud1: { top: '20%', left: '-4%' },
  cloud2: { top: '14%', right: '5%', opacity: 0.85 },
  cloud3: { top: '58%', left: '-6%', opacity: 0.7 },
  cloud4: { top: '68%', right: '-3%', opacity: 0.85 },

  // ─── Paper plane ───
  planeWrap: {
    position: 'absolute',
    top: '32%',
    right: '20%',
    transform: [{ rotate: '-12deg' }],
  },

  // ─── Content ───
  heroInner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 2,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    letterSpacing: 2,
    color: colors.text,
  },
  h1: {
    fontFamily: fontFamily.displayHeavy,
    color: colors.text,
    lineHeight: HEADLINE_SIZE * 0.92,
    letterSpacing: -2,
  },
  h1Accent: {
    color: colors.accent,
  },
  heroSub: {
    fontSize: IS_NARROW ? 16 : 19,
    lineHeight: IS_NARROW ? 26 : 30,
    color: colors.text,
    maxWidth: 560,
    marginTop: spacing.xl,
    marginBottom: spacing.x2l,
  },
  handAccent: {
    fontFamily: fontFamily.hand,
    fontSize: IS_NARROW ? 24 : 30,
    color: colors.primaryDark,
    lineHeight: IS_NARROW ? 28 : 32,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  ghostBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  ctaNote: {
    fontFamily: fontFamily.hand,
    fontSize: 22,
    color: colors.text,
    transform: [{ rotate: '-3deg' }],
    marginLeft: spacing.sm,
  },
});
