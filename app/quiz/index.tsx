/**
 * Quiz page — Compass layout (prototype C).
 *
 * Two-pane on desktop (width ≥ 980):
 *   LEFT  — sticky "Your profile" card, slots fill in as the student answers.
 *   RIGHT — current question, chip grid, action row.
 *
 * On mobile (< 980) the profile collapses to a thin horizontal summary
 * strip showing only done/active slots, and the question comes first
 * in visual order.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import type { CollegeType, CourseCategoryId, District, Stream } from '@/types';
import {
  COURSE_CATEGORIES,
  DISTRICTS,
  EXAMS,
  STREAM_LABELS,
} from '@/data';
import { useAuth } from '@/lib/auth';
import {
  recommend,
  type MarksBand,
  type QuizAnswers,
  type Recommendation,
} from '@/lib/recommend';
import { supabase } from '@/lib/supabase';
import {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';
import { QuizResult } from '@/components/quiz-result';
import { SiteHeader } from '@/components/site-header';
import { Text } from '@/components/ui/text';

// ─── Layout breakpoint ──────────────────────────────────────────────────────

const BREAKPOINT = 980;

/**
 * Module-load snapshot for use inside `StyleSheet.create()` (which can't
 * read React state). Matches the pattern used by other pages in this
 * codebase — e.g. components/site-header.tsx, components/colleges-hero.tsx.
 * The runtime `useWindowWidth` hook below is used for layout decisions
 * that need to react to resize after mount (e.g. swapping the desktop
 * profile pane for the mobile summary strip).
 */
const IS_NARROW = Dimensions.get('window').width < 640;

function useWindowWidth() {
  const [w, setW] = useState(Dimensions.get('window').width);
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setW(window.width));
    return () => sub.remove();
  }, []);
  return w;
}

// ─── Data / options ─────────────────────────────────────────────────────────

const TOTAL_STEPS = 6;

const STREAM_OPTIONS: { value: Stream; label: string }[] = [
  { value: 'pcm',      label: STREAM_LABELS.pcm },
  { value: 'pcb',      label: STREAM_LABELS.pcb },
  { value: 'commerce', label: STREAM_LABELS.commerce },
  { value: 'arts',     label: STREAM_LABELS.arts },
];

const MARKS_OPTIONS: { value: MarksBand; label: string }[] = [
  { value: 'above85', label: 'Above 85%' },
  { value: '75to85',  label: '75% – 85%' },
  { value: '60to75',  label: '60% – 75%' },
  { value: 'below60', label: 'Below 60%' },
];

const COLLEGE_TYPE_OPTIONS: { value: CollegeType; label: string; description: string }[] = [
  {
    value: 'government',
    label: 'Government',
    description: 'Lowest fees overall but most competitive — merit + entrance score really matter.',
  },
  {
    value: 'aided',
    label: 'Aided',
    description: 'Government-funded with private management. Mid-range fees; often the strongest reputation in arts and sciences.',
  },
  {
    value: 'private',
    label: 'Private / Self-financing',
    description: 'More seats and easier admission, but fees vary widely between colleges and between seat categories.',
  },
];

// ─── Slot definitions (one per step) ────────────────────────────────────────

interface SlotDef {
  name: string;
  stepLabel: string; // "step N" placeholder
}

const SLOT_DEFS: SlotDef[] = [
  { name: 'Stream',         stepLabel: 'step 1' },
  { name: '12th marks',     stepLabel: 'step 2' },
  { name: 'District',       stepLabel: 'step 3' },
  { name: 'College type',   stepLabel: 'step 4' },
  { name: 'Interests',      stepLabel: 'step 5' },
  { name: 'Entrance exams', stepLabel: 'step 6' },
];

// ─── Small SVG paper-plane icon ──────────────────────────────────────────────

function PlaneMark({ size = 14, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Pulsing coral dot (active slot indicator) ───────────────────────────────

function PulsingDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={pulseDotStyles.wrap}>
      {/* Ripple ring */}
      <Animated.View style={[pulseDotStyles.ring, ringStyle]} />
      {/* Solid core */}
      <View style={pulseDotStyles.core} />
    </View>
  );
}

const pulseDotStyles = StyleSheet.create({
  wrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    flexShrink: 0,
  },
  ring: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    opacity: 0.5,
  },
  core: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
});

// ─── Shimmer (footer tile) ───────────────────────────────────────────────────

function ShimmerTile() {
  const tx = useSharedValue(-200);

  useEffect(() => {
    tx.value = withRepeat(
      withTiming(200, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [tx]);

  const shimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  return (
    <View style={shimStyles.tile}>
      {/* Shimmer overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, shimStyle, { pointerEvents: 'none' }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.65)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={shimStyles.inner}>
        <PlaneMark size={13} color={colors.textMuted} />
        <Text variant="caption" color={colors.textMuted} style={shimStyles.label}>
          Your match · revealed at step 6
        </Text>
      </View>
    </View>
  );
}

const shimStyles = StyleSheet.create({
  tile: {
    backgroundColor: colors.skyPale,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 1,
  },
  label: {
    fontFamily: fontFamily.displaySemibold,
    letterSpacing: 0.2,
  },
});

// ─── Active segment (progress bar) ──────────────────────────────────────────

function ActiveSegment() {
  const width = useSharedValue(0.5);

  useEffect(() => {
    width.value = withRepeat(
      withTiming(0.6, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%` as unknown as number,
    opacity: width.value === 0.5 ? 0.65 : 1,
  }));

  return (
    <View style={segStyles.wrap}>
      <Animated.View style={[segStyles.fill, fillStyle]} />
    </View>
  );
}

const segStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(31,95,160,0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.skyDeep,
  },
});

// ─── Progress strip ──────────────────────────────────────────────────────────

function ProgressStrip({ step }: { step: number }) {
  // step is 0-indexed
  return (
    <LinearGradient
      colors={[colors.skyPale, colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={progressStyles.strip}
    >
      <View style={progressStyles.inner}>
        <View style={progressStyles.caption}>
          <Text style={progressStyles.captionText}>
            STEP{' '}
          </Text>
          <Text style={[progressStyles.captionText, progressStyles.captionNum]}>
            {step + 1}
          </Text>
          <Text style={progressStyles.captionText}>
            {' '}OF 6
          </Text>
        </View>
        <View style={progressStyles.bar}>
          {Array.from({ length: 6 }, (_, i) => {
            if (i < step) {
              // done
              return (
                <View key={i} style={[segStyles.wrap, progressStyles.doneSeg]} />
              );
            } else if (i === step) {
              // active
              return <ActiveSegment key={i} />;
            } else {
              // empty
              return (
                <View key={i} style={segStyles.wrap} />
              );
            }
          })}
        </View>
      </View>
    </LinearGradient>
  );
}

const progressStyles = StyleSheet.create({
  strip: {
    paddingVertical: 20,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31,95,160,0.10)',
  },
  inner: {
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  caption: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  captionText: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.xs,
    letterSpacing: 1.5,
    color: colors.text,
  },
  captionNum: {
    color: colors.skyDeep,
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  doneSeg: {
    backgroundColor: colors.skyDeep,
  },
});

// ─── Profile card slots ──────────────────────────────────────────────────────

type SlotState = 'done' | 'active' | 'empty';

interface SlotProps {
  state: SlotState;
  name: string;
  stepLabel: string;
  value?: string;
  /** Mobile horizontal strip mode — tighter layout */
  compact?: boolean;
}

function ProfileSlot({ state, name, stepLabel, value, compact }: SlotProps) {
  const isDone   = state === 'done';
  const isActive = state === 'active';

  if (compact) {
    // Horizontal strip slot (mobile)
    if (state === 'empty') return null;
    return (
      <View style={slotStyles.compactSlot}>
        {isDone ? (
          <View style={slotStyles.compactDotDone}>
            <Text style={slotStyles.compactTick}>✓</Text>
          </View>
        ) : (
          <View style={slotStyles.compactDotActive} />
        )}
        <Text style={slotStyles.compactName}>{name.toUpperCase()}</Text>
        {value ? (
          <Text style={[slotStyles.compactValue, isActive && slotStyles.compactValueActive]}>
            {value}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[slotStyles.slot, !isDone && !isActive && slotStyles.slotEmpty]}>
      {/* Indicator dot */}
      <View style={slotStyles.dotWrap}>
        {isDone ? (
          <View style={slotStyles.dotDone}>
            <Text style={slotStyles.tick}>✓</Text>
          </View>
        ) : isActive ? (
          <PulsingDot />
        ) : (
          <View style={slotStyles.dotEmpty} />
        )}
      </View>

      {/* Slot body */}
      <View style={slotStyles.slotBody}>
        <Text style={[slotStyles.slotName, isDone && slotStyles.slotNameDone, isActive && slotStyles.slotNameActive]}>
          {name}
        </Text>
        {isDone && value ? (
          <Text style={slotStyles.slotValue}>{value}</Text>
        ) : isActive ? (
          <Text style={[slotStyles.slotValue, slotStyles.slotValueActive]}>
            {value ?? 'picking now…'}
          </Text>
        ) : (
          <Text style={[slotStyles.slotValue, slotStyles.slotValuePlaceholder]}>
            {stepLabel}
          </Text>
        )}
      </View>
    </View>
  );
}

const slotStyles = StyleSheet.create({
  slot: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31,95,160,0.10)',
    borderStyle: 'dashed',
  },
  slotEmpty: {
    opacity: 0.6,
  },
  dotWrap: {
    width: 14,
    flexShrink: 0,
    alignItems: 'center',
    marginTop: 4,
  },
  dotDone: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.skyDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    color: '#fff',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: fontWeight.bold,
  },
  dotEmpty: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.textSubtle,
    backgroundColor: colors.background,
    marginTop: 4,
  },
  slotBody: {
    flex: 1,
    minWidth: 0,
  },
  slotName: {
    fontSize: fontSize.xs,
    color: colors.textSubtle,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.2,
  },
  slotNameDone: {
    color: colors.textMuted,
  },
  slotNameActive: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  slotValue: {
    marginTop: 2,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  slotValueActive: {
    color: colors.accentDark,
    fontStyle: 'italic',
    fontWeight: fontWeight.medium,
  },
  slotValuePlaceholder: {
    color: colors.textSubtle,
    fontWeight: fontWeight.regular,
    fontStyle: 'italic',
  },

  // Compact (mobile strip) variants
  compactSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  compactDotDone: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.skyDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTick: {
    color: '#fff',
    fontSize: 7,
    lineHeight: 9,
    fontWeight: fontWeight.bold,
  },
  compactDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  compactName: {
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
  },
  compactValue: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  compactValueActive: {
    color: colors.accentDark,
    fontStyle: 'italic',
  },
});

// ─── Profile card (desktop) ──────────────────────────────────────────────────

interface ProfileCardProps {
  step: number;
  slotValues: (string | undefined)[];
}

function ProfileCard({ step, slotValues }: ProfileCardProps) {
  return (
    <View style={profileStyles.card}>
      {/* Header */}
      <View style={profileStyles.head}>
        <View style={profileStyles.mark}>
          <PlaneMark size={13} color="#fff" />
        </View>
        <Text style={profileStyles.buildingLabel}>BUILDING YOUR MATCH</Text>
      </View>
      <Text style={profileStyles.title}>Your profile</Text>
      <Text style={profileStyles.sub}>
        Each answer narrows down the colleges + courses we&apos;ll show you.
      </Text>

      {/* Slots */}
      {SLOT_DEFS.map((def, i) => {
        const state: SlotState = i < step ? 'done' : i === step ? 'active' : 'empty';
        return (
          <ProfileSlot
            key={def.name}
            state={state}
            name={def.name}
            stepLabel={def.stepLabel}
            value={slotValues[i]}
          />
        );
      })}

      {/* Footer shimmer tile */}
      <View style={profileStyles.foot}>
        <ShimmerTile />
      </View>
    </View>
  );
}

const profileStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'rgba(31,95,160,0.12)',
    borderRadius: 20,
    padding: spacing.xl,
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 12px 32px rgba(31, 95, 160, 0.18)',
    elevation: 6,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  mark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.skyMid,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    // Gradient approximated with a solid mid-sky
  },
  buildingLabel: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textSubtle,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    letterSpacing: -0.3,
    color: colors.text,
    marginTop: 2,
    marginBottom: 4,
  },
  sub: {
    fontSize: fontSize.xs,
    color: colors.textSubtle,
    lineHeight: fontSize.xs * 1.5,
    marginBottom: spacing.md,
  },
  foot: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31,95,160,0.10)',
  },
});

// ─── Mobile profile strip ────────────────────────────────────────────────────

function MobileProfileStrip({ step, slotValues }: ProfileCardProps) {
  return (
    <View style={mobileStripStyles.strip}>
      {SLOT_DEFS.map((def, i) => {
        const state: SlotState = i < step ? 'done' : i === step ? 'active' : 'empty';
        if (state === 'empty') return null;
        return (
          <ProfileSlot
            key={def.name}
            state={state}
            name={def.name}
            stepLabel={def.stepLabel}
            value={slotValues[i]}
            compact
          />
        );
      })}
    </View>
  );
}

const mobileStripStyles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(31,95,160,0.10)',
  },
});

// ─── Answer chip ─────────────────────────────────────────────────────────────

function AnswerChip({
  label,
  selected,
  onPress,
  fullWidth,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  fullWidth?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        chipStyles.chip,
        selected && chipStyles.chipSelected,
        fullWidth && chipStyles.chipFull,
      ]}
    >
      <View style={[chipStyles.box, selected && chipStyles.boxSelected]}>
        {selected && <Text style={chipStyles.boxTick}>✓</Text>}
      </View>
      <Text
        style={[chipStyles.label, selected && chipStyles.labelSelected]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    // Uniform chip sizing. flexGrow:0 + maxWidth + fixed minHeight
    // means every chip is the same width AND the same height — even
    // when a long name like "Thiruvananthapuram" wraps to two lines,
    // the row doesn't get taller than its neighbours. Last partial
    // row left-aligns instead of stretching (preferred to mismatched
    // sizes).
    //
    // 3 per row on desktop (one chip ~= 32% wide), 2 per row on phone.
    flexBasis: IS_NARROW ? '47%' : '32%',
    maxWidth: IS_NARROW ? '48%' : '32.3%',
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: 'rgba(31,95,160,0.12)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  chipSelected: {
    borderColor: colors.skyDeep,
    backgroundColor: colors.skyPale,
  },
  chipFull: {
    flexBasis: '100%',
    borderStyle: 'dashed',
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(31,95,160,0.20)',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  boxSelected: {
    borderColor: colors.skyDeep,
    backgroundColor: colors.skyDeep,
  },
  boxTick: {
    color: '#fff',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: fontWeight.bold,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  labelSelected: {
    fontWeight: fontWeight.semibold,
    color: colors.skyAnchor,
  },
});

// ─── Chip grid wrapper ────────────────────────────────────────────────────────

function ChipGrid({ children }: { children: ReactNode }) {
  return <View style={chipGridStyles.grid}>{children}</View>;
}

const chipGridStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing.x2l,
  },
});

// ─── College-type description notes ─────────────────────────────────────────

function CollegeTypeNotes({ selectedTypes }: { selectedTypes: CollegeType[] }) {
  const toShow = selectedTypes.length > 0
    ? COLLEGE_TYPE_OPTIONS.filter(o => selectedTypes.includes(o.value))
    : COLLEGE_TYPE_OPTIONS;
  return (
    <View style={ctNoteStyles.wrap}>
      {toShow.map((opt) => (
        <View key={opt.value} style={ctNoteStyles.note}>
          <Text variant="label">{opt.label}</Text>
          <Text variant="bodySmall" muted style={{ marginTop: spacing.xs }}>
            {opt.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

const ctNoteStyles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  note: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryLight,
    paddingLeft: spacing.md,
  },
});

// ─── Question pane ────────────────────────────────────────────────────────────

interface QuestionPaneProps {
  step: number;
  // State
  streams: Stream[];
  marks: MarksBand | null;
  districts: District[];
  districtTouched: boolean;
  collegeTypes: CollegeType[];
  collegeTypeTouched: boolean;
  interests: CourseCategoryId[];
  exams: string[];
  // Handlers
  setStreams: (fn: (prev: Stream[]) => Stream[]) => void;
  setMarks: (v: MarksBand) => void;
  setDistricts: (fn: (prev: District[]) => District[]) => void;
  setDistrictTouched: (v: boolean) => void;
  setCollegeTypes: (fn: (prev: CollegeType[]) => CollegeType[]) => void;
  setCollegeTypeTouched: (v: boolean) => void;
  setInterests: (fn: (prev: CourseCategoryId[]) => CourseCategoryId[]) => void;
  setExams: (fn: (prev: string[]) => string[]) => void;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  onFinish: () => void;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function QuestionPane({
  step,
  streams, marks, districts, districtTouched,
  collegeTypes, collegeTypeTouched,
  interests, exams,
  setStreams, setMarks, setDistricts, setDistrictTouched,
  setCollegeTypes, setCollegeTypeTouched, setInterests, setExams,
  canContinue, onBack, onContinue, onFinish,
}: QuestionPaneProps) {
  // Derived counts for the action row hint
  const selectedCount = (() => {
    if (step === 0) return streams.length;
    if (step === 1) return marks !== null ? 1 : 0;
    if (step === 2) {
      if (!districtTouched) return 0;
      return districts.length === 0 ? 1 : districts.length; // "anywhere" counts as 1
    }
    if (step === 3) {
      if (!collegeTypeTouched) return 0;
      return collegeTypes.length === 0 ? 1 : collegeTypes.length;
    }
    if (step === 4) return interests.length;
    return exams.length; // step 5 — optional
  })();

  const questions: { title: string; hint: string }[] = [
    {
      title: 'Which stream did you study in 12th?',
      hint: 'Pick one — or both if you studied bio-maths (PCM + PCB).',
    },
    {
      title: 'Roughly what marks did you get?',
      hint: 'An estimate is fine — it just helps set expectations.',
    },
    {
      title: 'Where would you like to study?',
      hint: 'Pick one or more districts — or choose anywhere in Kerala.',
    },
    {
      title: 'What type of college are you looking for?',
      hint: 'Government / aided / private is a stable signal of fees and competition.',
    },
    {
      title: 'What are you interested in?',
      hint: "Pick one or more fields. We'll match courses and colleges to these.",
    },
    {
      title: 'Any entrance exams you\'ve taken or plan to?',
      hint: 'Optional — pick any that apply, or continue without selecting any.',
    },
  ];

  const q = questions[step];

  return (
    <View style={qpStyles.pane}>
      {/* Question header */}
      <Text style={qpStyles.qLabel}>QUESTION {step + 1} OF 6</Text>
      <Text style={qpStyles.qTitle}>{q.title}</Text>
      <Text style={qpStyles.qHint}>{q.hint}</Text>

      {/* Answer area */}
      {step === 0 && (
        <ChipGrid>
          {STREAM_OPTIONS.map((opt) => (
            <AnswerChip
              key={opt.value}
              label={opt.label}
              selected={streams.includes(opt.value)}
              onPress={() => setStreams((prev) => toggle(prev, opt.value))}
            />
          ))}
        </ChipGrid>
      )}

      {step === 1 && (
        <ChipGrid>
          {MARKS_OPTIONS.map((opt) => (
            <AnswerChip
              key={opt.value}
              label={opt.label}
              selected={marks === opt.value}
              onPress={() => setMarks(opt.value)}
            />
          ))}
        </ChipGrid>
      )}

      {step === 2 && (
        <ChipGrid>
          <AnswerChip
            label="Anywhere in Kerala"
            selected={districts.length === 0 && districtTouched}
            onPress={() => {
              setDistricts(() => []);
              setDistrictTouched(true);
            }}
            fullWidth
          />
          {DISTRICTS.map((d) => (
            <AnswerChip
              key={d}
              label={d}
              selected={districts.includes(d)}
              onPress={() => {
                setDistricts((prev) => toggle(prev, d));
                setDistrictTouched(true);
              }}
            />
          ))}
        </ChipGrid>
      )}

      {step === 3 && (
        <>
          <ChipGrid>
            <AnswerChip
              label="No preference"
              selected={collegeTypes.length === 0 && collegeTypeTouched}
              onPress={() => {
                setCollegeTypes(() => []);
                setCollegeTypeTouched(true);
              }}
              fullWidth
            />
            {COLLEGE_TYPE_OPTIONS.map((opt) => (
              <AnswerChip
                key={opt.value}
                label={opt.label}
                selected={collegeTypes.includes(opt.value)}
                onPress={() => {
                  setCollegeTypes((prev) => toggle(prev, opt.value));
                  setCollegeTypeTouched(true);
                }}
              />
            ))}
          </ChipGrid>
          <CollegeTypeNotes selectedTypes={collegeTypes} />
        </>
      )}

      {step === 4 && (
        <ChipGrid>
          {COURSE_CATEGORIES.map((c) => (
            <AnswerChip
              key={c.id}
              label={c.name}
              selected={interests.includes(c.id)}
              onPress={() => setInterests((prev) => toggle(prev, c.id))}
            />
          ))}
        </ChipGrid>
      )}

      {step === 5 && (
        <ChipGrid>
          <AnswerChip
            label="None"
            selected={exams.length === 0}
            onPress={() => setExams(() => [])}
            fullWidth
          />
          {EXAMS.map((e) => (
            <AnswerChip
              key={e.id}
              label={e.name}
              selected={exams.includes(e.id)}
              onPress={() => setExams((prev) => toggle(prev, e.id))}
            />
          ))}
        </ChipGrid>
      )}

      {/* Actions row */}
      <View style={qpStyles.actions}>
        <View style={qpStyles.actionsLeft}>
          {selectedCount > 0 ? (
            <Text style={qpStyles.selCount}>
              <Text style={qpStyles.selCountNum}>{selectedCount}</Text>
              {' '}selected
            </Text>
          ) : step === 5 ? (
            <Text style={qpStyles.selCount}>optional step</Text>
          ) : null}
        </View>
        <View style={qpStyles.actionsRight}>
          {step > 0 && (
            <Pressable onPress={onBack} style={qpStyles.ghostBtn}>
              <Text style={qpStyles.ghostBtnLabel}>← Previous</Text>
            </Pressable>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <Pressable
              onPress={canContinue ? onContinue : undefined}
              style={[qpStyles.primaryBtn, !canContinue && qpStyles.primaryBtnDisabled]}
            >
              <Text style={[qpStyles.primaryBtnLabel, !canContinue && qpStyles.primaryBtnLabelDisabled]}>
                Continue →
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={onFinish} style={qpStyles.primaryBtn}>
              <Text style={qpStyles.primaryBtnLabel}>See my matches →</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const qpStyles = StyleSheet.create({
  pane: {
    flex: 1,
    minWidth: 0,
  },
  qLabel: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textSubtle,
    marginBottom: 12,
  },
  qTitle: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: fontSize.x3l,
    lineHeight: fontSize.x3l * 1.05,
    letterSpacing: -1.5,
    color: colors.text,
    maxWidth: 700,
  },
  qHint: {
    marginTop: 12,
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: fontSize.md * 1.5,
    maxWidth: 580,
  },
  actions: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31,95,160,0.10)',
  },
  actionsLeft: {
    flex: 1,
  },
  actionsRight: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  selCount: {
    fontSize: fontSize.xs,
    color: colors.textSubtle,
  },
  selCountNum: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  ghostBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(31,95,160,0.15)',
  },
  ghostBtnLabel: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.skyDeep,
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(31,95,160,0.15)',
  },
  primaryBtnLabel: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
    color: '#fff',
  },
  primaryBtnLabelDisabled: {
    color: colors.textSubtle,
  },
});

// ─── Derive slot values for the profile card ─────────────────────────────────

function buildSlotValues(
  step: number,
  streams: Stream[],
  marks: MarksBand | null,
  districts: District[],
  districtTouched: boolean,
  collegeTypes: CollegeType[],
  collegeTypeTouched: boolean,
  interests: CourseCategoryId[],
  exams: string[],
): (string | undefined)[] {
  // 0 = stream, 1 = marks, 2 = district, 3 = college type, 4 = interests, 5 = exams
  const streamLabel =
    streams.length === 0 ? undefined
    : streams.length === 1
      ? STREAM_LABELS[streams[0]]
      : `${streams.length} streams`;

  const marksLabel: string | undefined = marks
    ? MARKS_OPTIONS.find((m) => m.value === marks)?.label
    : undefined;

  let districtLabel: string | undefined;
  if (districtTouched) {
    districtLabel =
      districts.length === 0 ? 'anywhere'
      : districts.length === 1 ? districts[0]
      : `${districts.length} districts`;
  }

  let ctLabel: string | undefined;
  if (collegeTypeTouched) {
    ctLabel =
      collegeTypes.length === 0 ? 'any type'
      : collegeTypes.length === 1
        ? COLLEGE_TYPE_OPTIONS.find((o) => o.value === collegeTypes[0])?.label
        : `${collegeTypes.length} types`;
  }

  const interestsLabel =
    interests.length === 0 ? undefined
    : interests.length === 1
      ? COURSE_CATEGORIES.find((c) => c.id === interests[0])?.name
      : `${interests.length} fields`;

  const examsLabel =
    step < 5 ? undefined
    : exams.length === 0 ? 'none'
    : exams.length === 1 ? exams[0]
    : `${exams.length} exams`;

  // For the active slot, show a live preview or "picking now…"
  const activeOrDone = (i: number, val: string | undefined): string | undefined => {
    if (i < step) return val; // done → actual value
    if (i === step) return val; // active → live preview (or undefined → "picking now…")
    return undefined;
  };

  return [
    activeOrDone(0, streamLabel),
    activeOrDone(1, marksLabel),
    activeOrDone(2, districtLabel),
    activeOrDone(3, ctLabel),
    activeOrDone(4, interestsLabel),
    activeOrDone(5, examsLabel),
  ];
}

// ─── Main quiz screen ─────────────────────────────────────────────────────────

export default function QuizScreen() {
  const windowWidth = useWindowWidth();
  const isWide = windowWidth >= BREAKPOINT;

  const [step, setStep] = useState(0);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [marks, setMarks] = useState<MarksBand | null>(null);
  // Districts is multi-select. Empty array = "anywhere in Kerala".
  // The "Anywhere" chip is treated as a clear-all toggle, not a value.
  const [districts, setDistricts] = useState<District[]>([]);
  // `null` = the student hasn't touched the district step yet (so we can
  // gate the Continue button); after first interaction (including picking
  // Anywhere, which sets districts back to [] but flips this to true)
  // the step is satisfied.
  const [districtTouched, setDistrictTouched] = useState(false);
  // College types is multi-select. Empty array = no preference.
  // Same touched flag pattern as district so picking "no preference"
  // still counts as having answered the step.
  const [collegeTypes, setCollegeTypes] = useState<CollegeType[]>([]);
  const [collegeTypeTouched, setCollegeTypeTouched] = useState(false);
  const [interests, setInterests] = useState<CourseCategoryId[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  // The result screen needs the answers too (profile chips, marks note),
  // so keep them alongside the recommendation.
  const [result, setResult] = useState<{ answers: QuizAnswers; rec: Recommendation } | null>(null);

  const canContinue = [
    streams.length > 0,
    marks !== null,
    districtTouched,
    collegeTypeTouched,
    interests.length > 0,
    true, // exams step is optional
  ][step];

  const { session, refreshQuizHistory } = useAuth();

  function finish() {
    if (streams.length === 0 || marks === null || !districtTouched || !collegeTypeTouched) return;
    const answers: QuizAnswers = {
      streams,
      marksBand: marks,
      districts,
      collegeTypes,
      interests,
      examsAttempted: exams,
    };
    const recommendation = recommend(answers);
    setResult({ answers, rec: recommendation });

    // Persist the attempt for signed-in users so it shows up on /account.
    // Fire-and-forget: a failed insert (table missing, network blip,
    // policy edge case) shouldn't block the user from seeing their
    // results — we just log it.
    if (session) {
      const topCourse  = recommendation.courses[0]?.course;
      const topCollege = recommendation.colleges[0]?.college;
      supabase
        .from('quiz_results')
        .insert({
          user_id:          session.user.id,
          answers,
          top_course_id:    topCourse?.id   ?? null,
          top_course_name:  topCourse?.name ?? null,
          top_college_id:   topCollege?.id   ?? null,
          top_college_name: topCollege?.name ?? null,
        })
        .then(({ error }) => {
          if (error) {
            console.warn('quiz_results insert failed:', error.message);
            return;
          }
          // Flip the global hasTakenQuiz flag so the header drops the
          // "Take the quiz" CTA and hero CTAs relabel immediately.
          refreshQuizHistory();
        });
    }
  }

  function restart() {
    setStep(0);
    setStreams([]);
    setMarks(null);
    setDistricts([]);
    setDistrictTouched(false);
    setCollegeTypes([]);
    setCollegeTypeTouched(false);
    setInterests([]);
    setExams([]);
    setResult(null);
  }

  if (result) {
    return <QuizResult answers={result.answers} result={result.rec} onRestart={restart} />;
  }

  const slotValues = buildSlotValues(
    step,
    streams,
    marks,
    districts,
    districtTouched,
    collegeTypes,
    collegeTypeTouched,
    interests,
    exams,
  );

  const questionPaneProps: QuestionPaneProps = {
    step,
    streams, marks, districts, districtTouched,
    collegeTypes, collegeTypeTouched, interests, exams,
    setStreams, setMarks, setDistricts, setDistrictTouched,
    setCollegeTypes, setCollegeTypeTouched, setInterests, setExams,
    canContinue: Boolean(canContinue),
    onBack:      () => setStep((s) => s - 1),
    onContinue:  () => setStep((s) => s + 1),
    onFinish:    finish,
  };

  return (
    <View style={rootStyles.root}>
      <SiteHeader />
      {/* Progress strip — thin sky-pale strip below the SiteHeader */}
      <ProgressStrip step={step} />

      <ScrollView
        contentContainerStyle={rootStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            rootStyles.body,
            isWide ? rootStyles.bodyWide : rootStyles.bodyNarrow,
          ]}
        >
          {isWide ? (
            /* ── Wide: profile card LEFT (sticky), question RIGHT ── */
            <>
              <View style={rootStyles.profileCol}>
                <View style={rootStyles.sticky as ViewStyle}>
                  <ProfileCard step={step} slotValues={slotValues} />
                </View>
              </View>
              <View style={rootStyles.questionCol}>
                <QuestionPane {...questionPaneProps} />
              </View>
            </>
          ) : (
            /* ── Narrow: profile strip ABOVE question ── */
            <>
              <MobileProfileStrip step={step} slotValues={slotValues} />
              <QuestionPane {...questionPaneProps} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const rootStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  body: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    paddingBottom: 80,
  },
  bodyWide: {
    flexDirection: 'row',
    gap: 48,
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: 48,
  },
  bodyNarrow: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileCol: {
    width: 320,
    flexShrink: 0,
  },
  sticky: {
    position: 'sticky' as ViewStyle['position'],
    top: 92,
  },
  questionCol: {
    flex: 1,
    minWidth: 0,
  },
});

