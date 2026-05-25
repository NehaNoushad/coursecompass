/**
 * Sky features — "What you can do here" section. Three feature cards
 * sitting on a soft paper→sky-pale gradient background, each with a
 * gradient-filled icon container and a tiny extra cloud puff peeking
 * out of the corner (matches prototype 4).
 */

import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';

// Shared narrow breakpoint — see `components/site-header.tsx`.
const IS_NARROW = Dimensions.get('window').width < 640;

type GradientStops = [ColorValue, ColorValue];

const FEATURES: {
  title: string;
  body: string;
  icon: (props: { color: string; size?: number }) => React.ReactElement;
  iconGradient: GradientStops;
}[] = [
  {
    title: 'Take the 6-question quiz',
    body: 'Stream, marks, district, fees, interests, fears. We match you to courses in seconds — with the reasons we picked them, not just rankings.',
    icon: ({ color, size = 28 }) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={2} />
        <Path
          d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    ),
    iconGradient: [colors.skyMid, colors.primaryDark],
  },
  {
    title: 'Browse the catalogue',
    body: 'Every Kerala college, every course they offer. Filter by district, type, fees, entrance exam. No ads. No "sponsored" tiles. No 2019 listicles.',
    icon: ({ color, size = 28 }) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="6" width="18" height="14" rx="2" stroke={color} strokeWidth={2} />
        <Path d="M3 10h18M9 6V4h6v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
    iconGradient: [colors.accent, colors.accentDark],
  },
  {
    title: 'Shortlist and decide',
    body: 'Save what you like. Compare side-by-side. Walk away with a clear answer — and the entrance exams you\'ll need to clear it.',
    icon: ({ color, size = 28 }) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 11l3 3L22 4"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    iconGradient: [colors.skyDeep, colors.primaryDark],
  },
];

export function SkyFeatures() {
  return (
    <View style={styles.section}>
      <LinearGradient
        colors={[colors.background, colors.skyPale]}
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
      />
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>WHAT YOU CAN DO HERE</Text>
        <Text style={styles.title}>Three ways to figure out what fits.</Text>

        <View style={styles.grid}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.card}>
              <View style={styles.cornerPuff} />
              <View style={styles.iconWrap}>
                <LinearGradient
                  colors={feature.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                {/* iconGlyph needs zIndex so it paints above the absolutely-
                    positioned gradient sibling — CSS stacking. */}
                <View style={styles.iconGlyph}>
                  <feature.icon color="white" />
                </View>
              </View>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardBody}>{feature.body}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    position: 'relative',
    paddingVertical: spacing.x4l,
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    letterSpacing: 2,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_NARROW ? 32 : 48,
    lineHeight: IS_NARROW ? 36 : 50,
    color: colors.text,
    letterSpacing: -1.5,
    marginBottom: spacing.x3l,
    maxWidth: 720,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  card: {
    position: 'relative',
    flexGrow: 1,
    flexBasis: 280,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.x2l,
    overflow: 'hidden',
    // Soft shadow approximating the prototype's `0 10px 40px -10px rgba(31, 95, 160, 0.15)`
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity.
    boxShadow: '0px 10px 24px rgba(31, 95, 160, 0.12)',
    elevation: 4,
  },
  cornerPuff: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.skyPale,
    top: -20,
    right: -20,
    opacity: 0.7,
    pointerEvents: 'none',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconGlyph: {
    zIndex: 1,
  },
  cardTitle: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMuted,
  },
});
