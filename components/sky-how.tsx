/**
 * Sky "how it works" — four numbered steps laid out as a flight path,
 * with a dotted curve running behind the badges to suggest the journey.
 * Matches prototype 4. The animated "draws itself on scroll" stroke
 * effect from the prototype is deferred to a polish pass; for now the
 * path is fully drawn at all times.
 */

import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  spacing,
} from '@/constants/theme';

// Shared narrow breakpoint — see `components/site-header.tsx`.
const IS_NARROW = Dimensions.get('window').width < 640;

const STEPS = [
  {
    num: '01',
    title: 'Tell us about you',
    body: 'Stream, marks, district, fees you can afford, interests, fears.',
  },
  {
    num: '02',
    title: 'See your matches',
    body: 'Courses ranked by fit, with reasons attached and the exam you\'ll need.',
  },
  {
    num: '03',
    title: 'Explore the colleges',
    body: 'Real Kerala colleges that offer your matched courses, filterable.',
  },
  {
    num: '04',
    title: 'Shortlist or save',
    body: 'Save your top picks. Or buy the full PDF report — coming 2027.',
  },
];

export function SkyHow() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>HOW IT WORKS</Text>
        <Text style={styles.title}>
          {'From "I have no idea" to "I know what I want" — in 5 minutes.'}
        </Text>

        {/* Flight path behind the step badges. Hidden on narrow —
            with steps stacked into a single column the horizontal
            wave reads as a stray line floating across the section,
            not a connector. */}
        <View style={styles.stepsWrap}>
          {!IS_NARROW ? (
            <Svg
              style={styles.flightPath}
              viewBox="0 0 1200 40"
              preserveAspectRatio="none"
            >
              <Path
                d="M 150 20 Q 300 0, 450 20 T 750 20 T 1050 20"
                fill="none"
                stroke={colors.primaryDark}
                strokeWidth={1.5}
                strokeDasharray="4 8"
                opacity={0.5}
              />
            </Svg>
          ) : null}

          <View style={styles.steps}>
            {STEPS.map((step) => (
              <View key={step.num} style={styles.step}>
                <View style={styles.badge}>
                  <Text style={styles.badgeNum}>{step.num}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.skyPale,
    paddingVertical: spacing.x4l,
    paddingHorizontal: spacing.xl,
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
    fontSize: IS_NARROW ? 32 : 44,
    lineHeight: IS_NARROW ? 36 : 48,
    color: colors.text,
    letterSpacing: -1.5,
    marginBottom: spacing.x3l,
    maxWidth: 760,
  },
  stepsWrap: {
    position: 'relative',
    marginTop: spacing.x2l,
  },
  flightPath: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    height: 40,
    width: '100%',
  },
  steps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    position: 'relative',
    zIndex: 1,
  },
  step: {
    flexGrow: 1,
    flexBasis: 220,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 6px 18px rgba(31, 95, 160, 0.18)',
    elevation: 4,
  },
  badgeNum: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  stepTitle: {
    fontFamily: fontFamily.display,
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  stepBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
