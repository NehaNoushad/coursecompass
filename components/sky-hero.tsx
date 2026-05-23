/**
 * Sky hero — the prototype-4 home-page hero, ported to React Native.
 *
 * Visual stack (back to front):
 *   1. cyan→azure LinearGradient filling the section
 *   2. soft glowing sun in the upper-right
 *   3. four SVG clouds at staggered positions (static for now — drift
 *      animation will be added in a follow-up polish step)
 *   4. paper-plane SVG with a dotted trail behind it
 *   5. centred content: eyebrow chip + big "Look up. / Way up." headline
 *      + sub copy with a Caveat handwritten accent + CTA row + a
 *      handwritten "free for 10 min, no signup" note next to the buttons
 *
 * Sizing: hero is at least 85% of the initial viewport height (min 600px)
 * so it always feels like a full-screen statement on web; on mobile it
 * scales down via the Dimensions snapshot.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  Polygon,
  Stop,
} from 'react-native-svg';

import { LinkButton } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
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

      {/* Clouds — drifting motion will be added in a follow-up */}
      <View style={[styles.cloud, styles.cloud1]} pointerEvents="none">
        <CloudShape size={260} />
      </View>
      <View style={[styles.cloud, styles.cloud2]} pointerEvents="none">
        <CloudShape size={180} />
      </View>
      <View style={[styles.cloud, styles.cloud3]} pointerEvents="none">
        <CloudShape size={300} />
      </View>
      <View style={[styles.cloud, styles.cloud4]} pointerEvents="none">
        <CloudShape size={200} />
      </View>

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
          382 colleges. 176 courses. <Text style={styles.handAccent}>endless</Text> directions. CourseCompass helps you pick the one that fits — built for Kerala 12th-pass students.
        </Text>

        <View style={styles.ctaRow}>
          <LinkButton href="/quiz" label="Take the quiz →" size="lg" />
          <LinkButton
            href="/colleges"
            label="Browse 382 colleges"
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
  cloud1: { top: '20%', left: '-4%' },
  cloud2: { top: '14%', right: '28%', opacity: 0.85 },
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
