/**
 * Quiz result screen — the "verdict" rebuild.
 *
 * The old result was two flat card grids whose reasons echoed the student's
 * own picks back at them ("Matches your interest in Engineering"). This
 * version reads like advice:
 *
 *   1. Hero — profile summary chips (what we know about the student).
 *   2. Marks note + honest "blocked" cards (interests their stream can't
 *      enter — said plainly, with the alternative).
 *   3. Best-fit paths — one card per picked interest, ranked. Each card adds
 *      information the student DIDN'T type in: how many courses their stream
 *      unlocks, the entrance-exam gate (✓ if attempted), where the field
 *      leads (career outlook, no salary), and college availability with
 *      honest cautions ("none in your district — 14 elsewhere").
 *   4. Worth a look — adjacent fields they didn't pick.
 *   5. The full course/college match grids, kept as supporting evidence.
 *
 * Pure presentation: all reasoning lives in lib/recommend.ts.
 */

import { Link } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import type { District } from '@/types';
import { STREAM_LABELS, TYPE_LABELS } from '@/data';
import {
  MARKS_LABELS,
  marksNote,
  type BlockedInterest,
  type Discovery,
  type PathRecommendation,
  type QuizAnswers,
  type Recommendation,
} from '@/lib/recommend';
import {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';
import { Badge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CollegeCard } from '@/components/college-card';
import { CourseCard } from '@/components/course-card';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SkyBandHero } from '@/components/sky-band-hero';
import { Text } from '@/components/ui/text';

const IS_NARROW = Dimensions.get('window').width < 640;

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// ─── Profile chips (hero) ────────────────────────────────────────────────────

function profileChips(answers: QuizAnswers): string[] {
  const chips: string[] = [];
  chips.push(answers.streams.map((s) => STREAM_LABELS[s]).join(' + '));
  chips.push(MARKS_LABELS[answers.marksBand]);
  chips.push(
    answers.districts.length === 0
      ? 'Anywhere in Kerala'
      : answers.districts.slice(0, 2).join(', ') +
          (answers.districts.length > 2 ? ` +${answers.districts.length - 2}` : ''),
  );
  chips.push(
    answers.collegeTypes.length === 0
      ? 'Any college type'
      : answers.collegeTypes.map((t) => TYPE_LABELS[t]).join(' / '),
  );
  chips.push(
    answers.examsAttempted.length === 0
      ? 'No entrance exams yet'
      : `${plural(answers.examsAttempted.length, 'entrance exam')} attempted`,
  );
  return chips;
}

// ─── Small shared pieces ─────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return <Text style={shared.sectionLabel}>{text}</Text>;
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={shared.sectionHead}>
      <Text variant="heading">{title}</Text>
      {sub ? (
        <Text variant="bodySmall" muted style={{ marginTop: spacing.xs }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

function MatchReasons({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) return null;
  return (
    <View style={shared.reasons}>
      {reasons.map((r) => (
        <Text key={r} variant="caption" color={colors.primaryDark}>
          • {r}
        </Text>
      ))}
    </View>
  );
}

const shared = StyleSheet.create({
  sectionLabel: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textSubtle,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionHead: {
    marginTop: spacing.x2l,
    marginBottom: spacing.lg,
  },
  reasons: {
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
});

// ─── Blocked-interest card ───────────────────────────────────────────────────

function BlockedCard({ blocked }: { blocked: BlockedInterest }) {
  return (
    <View style={bk.box}>
      <Text style={bk.title}>About {blocked.category.name} — an honest heads-up</Text>
      <Text style={bk.note}>{blocked.note}</Text>
    </View>
  );
}

const bk = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(255,217,61,0.10)',
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.sun,
    padding: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  note: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
    color: colors.textMuted,
  },
});

// ─── Path card ───────────────────────────────────────────────────────────────

const MAX_PATH_COURSES = 4;
const MAX_PATH_EXAMS = 6;

function PathCard({
  rank,
  path,
  districts,
}: {
  rank: number;
  path: PathRecommendation;
  districts: District[];
}) {
  const { category } = path;
  const shownCourses = path.courses.slice(0, MAX_PATH_COURSES);
  const moreCourses = path.courses.length - shownCourses.length;
  const shownExams = path.exams.slice(0, MAX_PATH_EXAMS);
  const moreExams = path.exams.length - shownExams.length;

  // Colleges link — keep the student's single-district filter when it still
  // has results; widen to all of Kerala when their district came up empty.
  const widen = path.collegeCount === 0;
  const collegeTotal = widen ? path.collegeCountAnywhere : path.collegeCount;
  const collegesHref =
    !widen && districts.length === 1
      ? ({ pathname: '/colleges', params: { category: category.id, district: districts[0] } } as const)
      : ({ pathname: '/colleges', params: { category: category.id } } as const);

  return (
    <View style={[pc.card, rank === 1 && pc.cardTop]}>
      {/* Header */}
      <View style={pc.head}>
        <View style={pc.rankDot}>
          <Text style={pc.rankNum}>{rank}</Text>
        </View>
        <View style={pc.headBody}>
          <Text variant="heading">{category.name}</Text>
          <Text variant="bodySmall" muted style={{ marginTop: 2 }}>
            {category.description}
          </Text>
        </View>
        {rank === 1 ? <Badge label="Top match" tone="success" /> : null}
      </View>

      {/* Why it fits — grounded in their other answers, never circular */}
      <SectionLabel text="WHY IT FITS YOU" />
      <View style={pc.bullets}>
        {path.whyItFits.map((r) => (
          <View key={r} style={pc.bulletRow}>
            <Text style={pc.bulletTick}>✓</Text>
            <Text style={pc.bulletText}>{r}</Text>
          </View>
        ))}
      </View>

      {path.cautions.length > 0 ? (
        <View style={pc.cautionBox}>
          {path.cautions.map((c) => (
            <Text key={c} style={pc.cautionText}>
              ⚠ {c}
            </Text>
          ))}
        </View>
      ) : null}

      {/* The gate */}
      <SectionLabel text="THE GATE" />
      {path.exams.length === 0 ? (
        <Badge label="No entrance exam — direct admission" tone="success" />
      ) : (
        <>
          <View style={pc.pillRow}>
            {shownExams.map(({ exam, attempted }) => (
              <View key={exam.id} style={[pc.examPill, attempted && pc.examPillDone]}>
                <Text style={[pc.examPillText, attempted && pc.examPillTextDone]}>
                  {attempted ? '✓ ' : ''}
                  {exam.name}
                </Text>
              </View>
            ))}
            {moreExams > 0 ? (
              <View style={pc.examPill}>
                <Text style={pc.examPillText}>+{moreExams} more</Text>
              </View>
            ) : null}
          </View>
          {path.directAdmissionCount > 0 ? (
            <Text variant="caption" muted style={{ marginTop: spacing.sm }}>
              …and {plural(path.directAdmissionCount, 'course')} here need
              {path.directAdmissionCount === 1 ? 's' : ''} no exam at all.
            </Text>
          ) : null}
        </>
      )}

      {/* Where it leads — the future-scope layer */}
      {path.careers.length > 0 ? (
        <>
          <SectionLabel text="WHERE IT CAN LEAD" />
          <View style={pc.careers}>
            {path.careers.map((c) => (
              <View key={c.role} style={pc.careerRow}>
                <Text style={pc.careerRole}>{c.role}</Text>
                <Text style={pc.careerScope}>{c.scope}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {/* Courses */}
      <SectionLabel text="COURSES TO LOOK AT" />
      <View style={pc.pillRow}>
        {shownCourses.map((c) => (
          <Link
            key={c.id}
            href={{ pathname: '/courses/[id]', params: { id: c.id, from: 'quiz' } }}
            style={pc.courseChip}>
            <Text style={pc.courseChipText}>{c.name} →</Text>
          </Link>
        ))}
        {moreCourses > 0 ? (
          <View style={pc.moreChip}>
            <Text style={pc.moreChipText}>+{moreCourses} more</Text>
          </View>
        ) : null}
      </View>

      {/* Colleges footer */}
      {collegeTotal > 0 ? (
        <View style={pc.footer}>
          <LinkButton
            href={collegesHref}
            label={
              widen
                ? `Browse ${plural(collegeTotal, 'college')} across Kerala →`
                : `Browse the ${plural(collegeTotal, 'college')} offering it →`
            }
            variant="ghost"
          />
        </View>
      ) : null}
    </View>
  );
}

const pc = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: IS_NARROW ? spacing.lg : spacing.x2l,
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 4px 14px rgba(31, 95, 160, 0.10)',
    elevation: 2,
  },
  cardTop: {
    borderColor: 'rgba(45,125,210,0.35)',
    boxShadow: '0px 10px 28px rgba(31, 95, 160, 0.16)',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headBody: {
    flex: 1,
    minWidth: 0,
  },
  rankDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.skyDeep,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  rankNum: {
    fontFamily: fontFamily.display,
    fontSize: 14,
    color: colors.textInverse,
  },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletTick: {
    color: colors.skyDeep,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.sm * 1.5,
  },
  bulletText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
    color: colors.textMuted,
  },
  cautionBox: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,217,61,0.10)',
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.sun,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cautionText: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * 1.55,
    color: colors.textMuted,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  examPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  examPillDone: {
    borderColor: colors.success,
    backgroundColor: '#DCFCE7',
  },
  examPillText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  examPillTextDone: {
    color: colors.success,
    fontWeight: fontWeight.semibold,
  },
  careers: {
    gap: spacing.sm,
  },
  careerRow: {
    gap: 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(45,125,210,0.15)',
    borderLeftWidth: 3,
    borderLeftColor: colors.skyMid,
    backgroundColor: colors.skyPale,
  },
  careerRole: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  careerScope: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * 1.5,
    color: colors.textMuted,
  },
  courseChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(45,125,210,0.25)',
    backgroundColor: colors.skyPale,
  },
  courseChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.skyAnchor,
  },
  moreChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  moreChipText: {
    fontSize: fontSize.xs,
    color: colors.textSubtle,
  },
  footer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-start',
  },
});

// ─── Discovery card ──────────────────────────────────────────────────────────

function DiscoveryCard({ discovery }: { discovery: Discovery }) {
  return (
    <View style={dc.card}>
      <Text style={dc.eyebrow}>HAVE YOU CONSIDERED</Text>
      <Text variant="subheading">{discovery.category.name}</Text>
      <Text variant="bodySmall" muted style={{ marginTop: spacing.xs }}>
        {discovery.category.description}
      </Text>
      <Text style={dc.reason}>{discovery.reason}</Text>
      <View style={dc.chips}>
        {discovery.courses.map((c) => (
          <Link
            key={c.id}
            href={{ pathname: '/courses/[id]', params: { id: c.id, from: 'quiz' } }}
            style={dc.chip}>
            <Text style={dc.chipText}>{c.name} →</Text>
          </Link>
        ))}
      </View>
    </View>
  );
}

const dc = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 280,
    maxWidth: 520,
    backgroundColor: colors.skyPale,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(45,125,210,0.18)',
    padding: spacing.xl,
  },
  eyebrow: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.skyAnchor,
    marginBottom: spacing.sm,
  },
  reason: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * 1.55,
    color: colors.primaryDark,
    fontStyle: 'italic',
  },
  chips: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(45,125,210,0.25)',
    backgroundColor: colors.background,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.skyAnchor,
  },
});

// ─── Main result screen ──────────────────────────────────────────────────────

export function QuizResult({
  answers,
  result,
  onRestart,
}: {
  answers: QuizAnswers;
  result: Recommendation;
  onRestart: () => void;
}) {
  const chips = profileChips(answers);
  const hasPaths = result.paths.length > 0;

  return (
    <View style={rs.root}>
      <SiteHeader />

      <ScrollView contentContainerStyle={rs.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero scrolls away with the content (see quiz/index history). */}
        <SkyBandHero>
          <Badge label="Your results" tone="success" />
          <Text variant="title" style={rs.heroTitle}>
            Here&apos;s what fits you
          </Text>
          <View style={rs.heroChips}>
            {chips.map((c) => (
              <View key={c} style={rs.heroChip}>
                <Text style={rs.heroChipText}>{c}</Text>
              </View>
            ))}
          </View>
        </SkyBandHero>

        <View style={rs.inner}>
          <Card muted style={rs.marksCard}>
            <Text variant="bodySmall">{marksNote(answers.marksBand)}</Text>
          </Card>

          {/* Honest part first — interests their stream can't enter. */}
          {result.blocked.length > 0 ? (
            <View style={rs.blockedList}>
              {result.blocked.map((b) => (
                <BlockedCard key={b.category.id} blocked={b} />
              ))}
            </View>
          ) : null}

          {/* Best-fit paths */}
          {hasPaths ? (
            <>
              <SectionHead
                title="Your best-fit paths"
                sub="Ranked with your stream, exams and districts — each with why it fits, the gate, and where it leads."
              />
              <View style={rs.pathList}>
                {result.paths.map((p, i) => (
                  <PathCard key={p.category.id} rank={i + 1} path={p} districts={answers.districts} />
                ))}
              </View>
            </>
          ) : null}

          {/* Discoveries */}
          {result.discoveries.length > 0 ? (
            <>
              <SectionHead
                title={hasPaths ? 'Worth a look — fields you didn’t pick' : 'Fields your stream opens up'}
                sub="Close to what you chose, and genuinely open to your stream."
              />
              <View style={rs.grid}>
                {result.discoveries.map((d) => (
                  <DiscoveryCard key={d.category.id} discovery={d} />
                ))}
              </View>
            </>
          ) : null}

          {/* Supporting evidence — the full match grids. */}
          <SectionHead
            title="Every course that fits you"
            sub={`All ${result.courses.length} matches, best first.`}
          />
          <View style={rs.grid}>
            {result.courses.map((m) => (
              <View key={m.course.id} style={rs.cell}>
                <CourseCard course={m.course} from="quiz" />
                <MatchReasons reasons={m.reasons} />
              </View>
            ))}
          </View>

          <SectionHead title="Colleges to consider" />
          {result.colleges.length === 0 ? (
            <Card muted>
              <Text variant="subheading">No exact college matches</Text>
              <Text muted style={{ marginTop: spacing.sm }}>
                Your district and college-type choices were strict. Try retaking the quiz with
                &quot;Anywhere in Kerala&quot; or &quot;No preference&quot; on college type.
              </Text>
            </Card>
          ) : (
            <View style={rs.grid}>
              {result.colleges.map((m) => (
                <View key={m.college.id} style={rs.cell}>
                  <CollegeCard college={m.college} from="quiz" />
                  <MatchReasons reasons={m.reasons} />
                </View>
              ))}
            </View>
          )}

          <View style={rs.nav}>
            <Button label="Retake the quiz" variant="secondary" onPress={onRestart} />
            <LinkButton href="/colleges" label="Browse all colleges" variant="ghost" />
          </View>
        </View>

        <SiteFooter />
      </ScrollView>
    </View>
  );
}

const rs = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    // No `alignItems: 'center'` — that shrinks SkyBandHero to fit
    // the centred body. inner block sets its own alignSelf:center.
  },
  heroTitle: {
    marginTop: spacing.sm,
    color: colors.text,
  },
  heroChips: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  heroChipText: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.x2l,
  },
  marksCard: {
    marginTop: spacing.lg,
  },
  blockedList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  pathList: {
    gap: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cell: {
    flexGrow: 1,
    flexBasis: 300,
    maxWidth: 540,
    gap: spacing.sm,
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.x2l,
  },
});
