/**
 * Sky final — the closing CTA section. Sky-bright through sky-mid to
 * sun-yellow gradient, evoking arrival/landing. The paper plane from
 * the hero returns up in the top-left as if it's just landed, three
 * cloud silhouettes drift across the background, and the headline
 * "Where will you go?" centres above the dark "Start the quiz" button.
 *
 * Closes the home page narrative: hero looked up, this section closes
 * the loop by saying — go.
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
import { colors, fontFamily, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

// Shared narrow breakpoint — see `components/site-header.tsx`.
const IS_NARROW = Dimensions.get('window').width < 640;
// The closing headline is set in displayHeavy at 80px on desktop;
// at phone widths that's roughly half the viewport per letter, so
// "Where will you go?" wraps and looks broken. 48px keeps the same
// dramatic presence at 390px without overwhelming the column.
const H2_SIZE = IS_NARROW ? 48 : 80;
const H2_LINE = IS_NARROW ? 52 : 84;

function Cloud({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.42} viewBox="0 0 240 100">
      <Ellipse cx={60} cy={65} rx={50} ry={32} fill="white" />
      <Ellipse cx={115} cy={50} rx={55} ry={38} fill="white" />
      <Ellipse cx={170} cy={60} rx={45} ry={32} fill="white" />
    </Svg>
  );
}

function PaperPlane({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        <SvgLinearGradient id="final-plane-fill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor={colors.skyPale} />
        </SvgLinearGradient>
      </Defs>
      <Polygon
        points="10,40 70,15 60,45"
        fill="url(#final-plane-fill)"
        stroke={colors.primaryDark}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Polygon
        points="60,45 40,55 70,15"
        fill="#B8DCEF"
        stroke={colors.primaryDark}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SkyFinal() {
  const { hasTakenQuiz } = useAuth();
  return (
    <View style={styles.section}>
      <LinearGradient
        colors={[colors.skyBright, colors.skyMid, colors.sun]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Drifting clouds */}
      <View style={[styles.cloud, styles.cloudA]}>
        <Cloud size={220} />
      </View>
      <View style={[styles.cloud, styles.cloudB]}>
        <Cloud size={180} />
      </View>
      <View style={[styles.cloud, styles.cloudC]}>
        <Cloud size={140} />
      </View>

      {/* Paper plane "arriving" */}
      <View style={styles.planeWrap}>
        <PaperPlane size={60} />
      </View>

      <View style={styles.inner}>
        <Text style={styles.h2}>
          Where will <Text style={styles.h2Accent}>you</Text> go?
        </Text>
        <Text style={styles.sub}>
          Free, no signup needed for the first 10 minutes. The quiz takes 5.
        </Text>
        {/* LinkButton bakes alignSelf:'flex-start' into its base style;
            override it to alignSelf:'center' so the button sits in the
            middle of the section instead of clinging to the left edge. */}
        <LinkButton
          href="/quiz"
          label={hasTakenQuiz ? 'Take the quiz again →' : 'Start the quiz →'}
          size="lg"
          style={{ alignSelf: 'center' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    position: 'relative',
    paddingVertical: spacing.x4l * 2,
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 540,
  },
  cloud: { position: 'absolute', opacity: 0.65, pointerEvents: 'none' },
  cloudA: { top: '12%', left: '-6%' },
  cloudB: { top: '22%', right: '-4%' },
  cloudC: { bottom: '18%', left: '24%', opacity: 0.5 },
  planeWrap: {
    position: 'absolute',
    top: 60,
    left: '20%',
    transform: [{ rotate: '15deg' }],
    pointerEvents: 'none',
  },
  inner: {
    width: '100%',
    maxWidth: 800,
    alignItems: 'center',
    zIndex: 1,
  },
  h2: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: H2_SIZE,
    lineHeight: H2_LINE,
    color: colors.text,
    letterSpacing: IS_NARROW ? -1.5 : -3,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  // Nested <Text> on RN-web doesn't reliably inherit the parent's font
  // properties — must repeat them or the accented word falls back to the
  // default ~14px. Keeping size + family + spacing identical to .h2 so
  // only the colour changes.
  h2Accent: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: H2_SIZE,
    lineHeight: H2_LINE,
    letterSpacing: IS_NARROW ? -1.5 : -3,
    color: colors.accentDark,
  },
  sub: {
    fontSize: 19,
    lineHeight: 28,
    color: colors.text,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: spacing.x2l,
  },
});
