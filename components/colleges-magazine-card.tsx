/**
 * Magazine-style college card used on the /colleges browse page.
 *
 * Distinct from `components/college-card.tsx` (which is the dense list
 * card still used on the quiz results and the course-detail "colleges
 * that offer this course" sections). This one is the discovery-mode
 * card: a 140-tall gradient header in the college's accent colour,
 * district + type pill on the header, big name in display type, a
 * derived tagline, a tri-column stat strip (courses / seats / fee
 * band), and a "View college →" cue at the bottom.
 *
 * Accent gradient is picked by college *type* so the grid reads as
 * a watercolour map at a glance — three palettes:
 *   government → sky blue arc
 *   aided      → sun + coral
 *   private    → coral + coral-deep
 *
 * Mild district modulation rotates between two stops within each type's
 * palette so adjacent cards of the same type aren't identical.
 */

import { Link } from 'expo-router';
import type { ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { College } from '@/types';
import { CATEGORY_BY_ID, FEE_BAND_LABELS, TYPE_LABELS } from '@/data';
import {
  colors,
  fontFamily,
  fontWeight,
  radius,
  spacing,
} from '@/constants/theme';
import { Text } from '@/components/ui/text';

type GradientStops = [ColorValue, ColorValue];

const GRADIENTS_BY_TYPE: Record<College['type'], GradientStops[]> = {
  government: [
    [colors.skyBright, colors.skyDeep],
    [colors.skyMid, colors.skyAnchor],
  ],
  aided: [
    [colors.sun, colors.accent],
    [colors.sunGlow, colors.accentDark],
  ],
  private: [
    [colors.accent, colors.accentDark],
    [colors.accentDark, colors.primaryDark],
  ],
};

/**
 * Cheap, stable hash so the same college always gets the same gradient
 * variant within its type's palette. Sum of char codes mod 2 — enough
 * variation across an alphabetised list without a real hash function.
 */
function gradientFor(c: College): GradientStops {
  const palette = GRADIENTS_BY_TYPE[c.type];
  let sum = 0;
  for (let i = 0; i < c.name.length; i++) sum += c.name.charCodeAt(i);
  return palette[sum % palette.length];
}

/**
 * One-line tagline composed from the college's available fields. The
 * data layer doesn't carry hand-written descriptions yet, so we derive
 * something honest from the structured fields: prestige signal (NAAC /
 * NIRF / established year) + the offered course categories. Falls back
 * to just the categories when no prestige signal is present.
 */
function taglineFor(c: College): string {
  const signals: string[] = [];
  if (c.naacGrade) signals.push(`NAAC ${c.naacGrade}`);
  if (c.nirfRank) signals.push(`NIRF #${c.nirfRank}`);
  if (c.established) signals.push(`Est. ${c.established}`);
  const head = signals.slice(0, 2).join(' · ');

  const cats = c.categories
    .slice(0, 3)
    .map((id) => CATEGORY_BY_ID[id]?.name)
    .filter(Boolean)
    .join(', ');
  const extra = Math.max(0, c.categories.length - 3);

  const catLine = cats
    ? `Offers ${cats}${extra > 0 ? ` and ${extra} more` : ''}.`
    : '';

  return head ? `${head}. ${catLine}` : catLine;
}

function ArrowRight() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface Props {
  college: College;
  /** Optional source marker passed through as `?from=` on the link. */
  from?: string;
}

export function CollegesMagazineCard({ college, from }: Props) {
  const gradient = gradientFor(college);
  const tagline = taglineFor(college);

  const courseCount = college.courses?.length ?? college.categories.length;
  const seats = college.totalSeats;
  const feeLabel = FEE_BAND_LABELS[college.feeBand];

  const href = from
    ? ({ pathname: '/colleges/[id]', params: { id: college.id, from } } as const)
    : ({ pathname: '/colleges/[id]', params: { id: college.id } } as const);

  return (
    <Link href={href} asChild>
      <Pressable style={({ hovered }) => [styles.card, hovered && styles.cardHover]}>
        {/* Gradient header */}
        <View style={styles.header}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Translucent cloud-puff decorations */}
          <View style={styles.puffBig} pointerEvents="none" />
          <View style={styles.puffSmall} pointerEvents="none" />
          <View style={styles.districtPill}>
            <Text style={styles.districtPillText}>
              {college.district.toUpperCase()} · {TYPE_LABELS[college.type].toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {college.name}
          </Text>
          {tagline ? (
            <Text style={styles.tagline} numberOfLines={3}>
              {tagline}
            </Text>
          ) : null}

          {/* Stat strip — only renders stats that actually have data
              so we don't show "— seats" placeholders. */}
          <View style={styles.statStrip}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{courseCount}</Text>
              <Text style={styles.statLabel}>
                {college.courses ? 'courses' : 'categories'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{seats ? seats.toLocaleString() : '—'}</Text>
              <Text style={styles.statLabel}>seats</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{feeLabel.split(' ')[0]}</Text>
              <Text style={styles.statLabel}>fees</Text>
            </View>
          </View>

          <View style={styles.cta}>
            <Text style={styles.ctaText}>View college</Text>
            <ArrowRight />
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    overflow: 'hidden',
    // Soft drop shadow at rest; lifts on hover.
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  cardHover: {
    transform: [{ translateY: -4 }],
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
  },

  // ─── Gradient header ───
  header: {
    height: 140,
    padding: spacing.lg,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  puffBig: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    bottom: -50,
    right: -50,
  },
  puffSmall: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    top: spacing.lg,
    right: 60,
  },
  districtPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    zIndex: 1,
  },
  districtPillText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.5,
    color: colors.text,
  },

  // ─── Body ───
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
    flex: 1,
  },
  name: {
    fontFamily: fontFamily.display,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.5,
    color: colors.text,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },

  // ─── Stat strip ───
  statStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderStyle: 'dashed',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: fontFamily.display,
    fontSize: 17,
    color: colors.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSubtle,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },

  // ─── CTA ───
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  ctaText: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    fontSize: 14,
  },
});
