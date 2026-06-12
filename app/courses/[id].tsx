/**
 * /courses/[id] — Course detail page, "Journey diagram" design.
 *
 * Tells the story of a course as a 4-node flowchart:
 *   Node 1 — Where you are  (Class 12 + stream requirements)
 *   Node 2 — The gate       (entrance exams, or "Direct admission")
 *   Node 3 — The course     (central card: subjects, campus note)
 *   Node 4 — Where it leads (career roles + honest scope, no salary)
 *
 * On desktop (≥ 980 px) the 4 nodes are laid out in a row with a dotted
 * SVG path running behind them. On mobile they collapse into a single-
 * column vertical timeline with a dashed left-border connector.
 *
 * Below the journey: a grid of colleges offering the course + a quiz CTA.
 *
 * Because the SkyBandHero must span the full viewport width, this page
 * manages its own SiteHeader / ScrollView / SiteFooter (same pattern as
 * /colleges/index.tsx) rather than using <Screen>.
 */

import React from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  CATEGORY_BY_ID,
  CAREER_OUTLOOK,
  COURSE_BY_ID,
  STREAM_LABELS,
  getCollegesForCourse,
  getExamsForCourse,
  type CareerPath,
} from '@/data';
import {
  colors,
  fontFamily,
  fontWeight,
  fontSize,
  layout,
  radius,
  spacing,
} from '@/constants/theme';
import { Badge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CollegeCard } from '@/components/college-card';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SkyBandHero } from '@/components/sky-band-hero';
import { Text } from '@/components/ui/text';

// ─── Breakpoint ────────────────────────────────────────────────────────────────
const WIN_W = Dimensions.get('window').width;
const IS_NARROW = WIN_W < 980;

const COLLEGE_PREVIEW_COUNT = 6;

// ─── Per-category content maps ─────────────────────────────────────────────────

/** Placeholder "what you study" subjects per category. */
const SUBJECT_MAP: Record<string, string[]> = {
  engineering: ['Programming', 'Data Structures', 'Algorithms', 'Computer Networks', 'AI / ML', 'Operating Systems'],
  medical: ['Anatomy', 'Physiology', 'Biochemistry', 'Pharmacology', 'Pathology', 'Clinical Medicine'],
  dental: ['Dental Anatomy', 'Oral Medicine', 'Orthodontics', 'Prosthodontics', 'Oral Surgery', 'Community Dentistry'],
  ayush: ['Ayurvedic Samhita', 'Dravyaguna', 'Panchakarma', 'Kaumarabhritya', 'Shalya Tantra', 'Preventive Medicine'],
  nursing: ['Anatomy & Physiology', 'Nursing Fundamentals', 'Medical-Surgical Nursing', 'Obstetric Nursing', 'Community Health', 'Mental Health Nursing'],
  paramedical: ['Human Anatomy', 'Medical Lab Techniques', 'Clinical Biochemistry', 'Microbiology', 'Pathology', 'Healthcare Management'],
  pharmacy: ['Pharmaceutical Chemistry', 'Pharmacognosy', 'Pharmacology', 'Pharmaceutics', 'Medicinal Chemistry', 'Drug Regulatory Affairs'],
  architecture: ['Architectural Design', 'Building Construction', 'Structural Systems', 'Urban Design', 'History of Architecture', 'Environmental Studies'],
  agriculture: ['Soil Science', 'Crop Physiology', 'Agricultural Entomology', 'Plant Pathology', 'Farm Management', 'Agricultural Economics'],
  veterinary: ['Veterinary Anatomy', 'Animal Physiology', 'Animal Nutrition', 'Veterinary Surgery', 'Livestock Production', 'Veterinary Public Health'],
  fisheries: ['Aquaculture', 'Fish Biology', 'Fisheries Management', 'Post-Harvest Technology', 'Marine Ecology', 'Fishing Technology'],
  law: ['Constitutional Law', 'Criminal Law', 'Contract Law', 'Family Law', 'Property Law', 'International Law'],
  science: ['Mathematics / Statistics', 'Physics / Chemistry', 'Laboratory Techniques', 'Research Methodology', 'Data Analysis', 'Elective Specialisation'],
  commerce: ['Financial Accounting', 'Business Economics', 'Corporate Law', 'Taxation', 'Management Principles', 'Banking & Finance'],
  arts: ['English Literature', 'History / Sociology', 'Political Science', 'Psychology', 'Philosophy', 'Research & Writing'],
  design: ['Design Thinking', 'Typography', 'Visual Communication', 'Digital Media', 'Product Design', 'Portfolio Studio'],
  'hotel-management': ['Food Production', 'Accommodation Management', 'Food & Beverage Service', 'Front Office Operations', 'Hospitality Finance', 'Event Management'],
  'fine-arts': ['Drawing & Painting', 'Sculpture', 'Art History', 'Applied Arts', 'Digital Art', 'Portfolio Development'],
  education: ['Educational Psychology', 'Curriculum Design', 'Pedagogy', 'School Management', 'ICT in Education', 'Teaching Practice'],
  polytechnic: ['Engineering Drawing', 'Workshop Practice', 'Applied Mathematics', 'Applied Sciences', 'Core Trade Subjects', 'Industrial Training'],
};

/** Required subjects per stream. */
const STREAM_SUBJECTS: Record<string, string[]> = {
  pcm: ['Physics', 'Chemistry', 'Mathematics'],
  pcb: ['Physics', 'Chemistry', 'Biology'],
  commerce: ['Accountancy', 'Business Studies', 'Economics'],
  arts: ['History / Sociology / Political Science', 'English', 'Elective Subject'],
};

/** Campus life one-liner per category. */
const CAMPUS_NOTE: Record<string, string> = {
  engineering: 'Internships from 3rd year; campus placements in the final year. Kerala\'s IT corridor (Technopark, Infopark, Cyberpark) actively recruits from state engineering colleges.',
  medical: 'Clinical postings from the 2nd year across teaching hospitals. Final internship year covers all major departments.',
  dental: 'Dental clinic postings from the 2nd year. Final-year students manage supervised patient consultations.',
  nursing: 'Hospital posting from Year 1. Elective specialisation (ICU, OT, community) in later years.',
  pharmacy: 'Industrial visits from Year 2. Final-year project tied to hospital or pharma company attachment.',
  architecture: 'Studio culture — long design projects, site visits, and competitions drive learning. Internship in a firm is standard before graduation.',
  law: 'Moot courts and internships with lawyers / courts are built into the curriculum from Year 2.',
  commerce: 'Internship with a CA firm or bank is typical in the penultimate year.',
  default: 'Practical training and field exposure are built into the final two years of the programme.',
};

// ─── Helper ────────────────────────────────────────────────────────────────────
function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/courses');
  }
}

function backLabel(from: string | undefined): string {
  if (from === 'quiz') return '← Back to your matches';
  return '← Back to courses';
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function CourseDetailScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const course = id ? COURSE_BY_ID[id] : undefined;
  const back = backLabel(from);

  if (!course) {
    return (
      <View style={styles.root}>
        <SiteHeader />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.pageBody}>
            <Text variant="title">Course not found</Text>
            <Text muted style={{ marginVertical: spacing.lg }}>
              We couldn&apos;t find that course.
            </Text>
            <Button label={back} variant="secondary" onPress={goBack} />
          </View>
          <SiteFooter />
        </ScrollView>
      </View>
    );
  }

  const category     = CATEGORY_BY_ID[course.categoryId];
  const exams        = getExamsForCourse(course.id);
  const colleges     = getCollegesForCourse(course.id);
  const preview      = colleges.slice(0, COLLEGE_PREVIEW_COUNT);
  const remaining    = colleges.length - preview.length;

  const catId        = course.categoryId as string;
  const subjects     = SUBJECT_MAP[catId] ?? SUBJECT_MAP['engineering'];
  const careers      = CAREER_OUTLOOK[course.categoryId];
  const campusNote   = CAMPUS_NOTE[catId] ?? CAMPUS_NOTE['default'];
  const categoryName = category?.name ?? 'Course';
  const streamLabels = course.streams.map((s) => STREAM_LABELS[s]);

  return (
    <View style={styles.root}>
      <SiteHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <SkyBandHero minHeight={IS_NARROW ? 280 : 340}>

          {/* Back breadcrumb */}
          <Link href="/courses" style={styles.crumb}>
            <Text style={styles.crumbText}>← Courses</Text>
          </Link>

          {/* Category pill */}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{categoryName.toUpperCase()}</Text>
          </View>

          {/* Course title */}
          <Text style={styles.heroTitle}>{course.name}</Text>

          {/* Sub-heading */}
          <Text style={styles.heroSub}>Your {course.name} journey.</Text>

          {/* Stat pills */}
          <View style={styles.statRow}>
            <StatPill label={`${course.durationYears} ${course.durationYears === 1 ? 'year' : 'years'}`} />
            {streamLabels.map((l) => (
              <StatPill key={l} label={l} />
            ))}
            {exams.length > 0 ? (
              <StatPill label={`${exams.length} entrance exam${exams.length > 1 ? 's' : ''}`} />
            ) : (
              <StatPill label="Direct admission" />
            )}
            <StatPill label={`${colleges.length} college${colleges.length !== 1 ? 's' : ''} in Kerala`} />
          </View>

        </SkyBandHero>

        {/* ── PAGE BODY ─────────────────────────────────────────────── */}
        <View style={styles.pageBody}>

          {/* ── JOURNEY ───────────────────────────────────────────── */}
          <View style={styles.journeySection}>

            {IS_NARROW ? (
              // ── MOBILE: vertical timeline ──────────────────────────
              <View style={styles.timelineWrap}>
                {/* Dashed left border — drawn as an absolute View */}
                <View style={styles.timelineSpine} />

                <TimelineStep number="1" label="Where you are" accentColor={colors.skyBright}>
                  <Node1Content streams={course.streams} />
                </TimelineStep>

                <TimelineStep number="2" label="The gate" accentColor={colors.sun}>
                  <Node2Content exams={exams} />
                </TimelineStep>

                <TimelineStep number="3" label="The course" accentColor={colors.skyAnchor} highlighted>
                  <Node3Content
                    course={course}
                    subjects={subjects}
                    campusNote={campusNote}
                    categoryName={categoryName}
                  />
                </TimelineStep>

                <TimelineStep number="4" label="Where it leads" accentColor={colors.accent} last>
                  <Node4Content careers={careers} />
                </TimelineStep>
              </View>
            ) : (
              // ── DESKTOP: horizontal 4-column ───────────────────────
              <View style={styles.desktopJourney}>

                {/* Dotted connector SVG behind the cards */}
                <View style={styles.connectorWrap}>
                  <Svg
                    style={styles.connectorSvg}
                    viewBox="0 0 1200 40"
                    preserveAspectRatio="none"
                  >
                    <Path
                      d="M 150 20 Q 300 0, 450 20 T 750 20 T 1050 20"
                      fill="none"
                      stroke={colors.skyDeep}
                      strokeWidth={2.5}
                      strokeDasharray="6 5"
                      opacity={0.45}
                    />
                  </Svg>
                </View>

                {/* Step labels row */}
                <View style={styles.stepLabelsRow}>
                  <StepLabel number="1" label="Where you are" dotColor={colors.skyDeep} />
                  <StepLabel number="2" label="The gate" dotColor={colors.sun} dotTextDark />
                  <StepLabel number="3" label="The course" dotColor={colors.skyAnchor} />
                  <StepLabel number="4" label="Where it leads" dotColor={colors.accent} />
                </View>

                {/* Cards row */}
                <View style={styles.cardsRow}>
                  <View style={[styles.cardCell, styles.cardCellNode1]}>
                    <Node1Content streams={course.streams} />
                  </View>
                  <View style={[styles.cardCell, styles.cardCellNode2]}>
                    <Node2Content exams={exams} />
                  </View>
                  <View style={[styles.cardCell, styles.cardCellNode3]}>
                    <Node3Content
                      course={course}
                      subjects={subjects}
                      campusNote={campusNote}
                      categoryName={categoryName}
                    />
                  </View>
                  <View style={[styles.cardCell, styles.cardCellNode4]}>
                    <Node4Content careers={careers} />
                  </View>
                </View>

              </View>
            )}
          </View>

          {/* ── COLLEGES ──────────────────────────────────────────── */}
          <View style={styles.collegesSection}>
            <View style={styles.sectionHeadRow}>
              <Text style={styles.sectionHeadTitle}>
                Colleges offering {course.name} in Kerala
              </Text>
              <Text variant="bodySmall" muted style={styles.sectionHeadCount}>
                {colleges.length} total
              </Text>
            </View>

            {colleges.length === 0 ? (
              <Card muted style={styles.emptyState}>
                <Text muted>No college data found for this course yet. Check back soon.</Text>
              </Card>
            ) : (
              <>
                <View style={styles.collegeGrid}>
                  {preview.map((college) => (
                    <View key={college.id} style={styles.collegeCell}>
                      <CollegeCard college={college} from={`course-${id}`} />
                    </View>
                  ))}
                </View>

                {remaining > 0 ? (
                  <View style={styles.seeAll}>
                    <LinkButton
                      href={{ pathname: '/colleges', params: { course: course.id } }}
                      label={`Browse all ${colleges.length} colleges offering ${course.name}`}
                      variant="ghost"
                    />
                  </View>
                ) : null}
              </>
            )}
          </View>

          {/* ── QUIZ CTA ──────────────────────────────────────────── */}
          <View style={styles.ctaSection}>
            <Card style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>
                Find the college that fits your journey.
              </Text>
              <Text muted style={styles.ctaSub}>
                6 questions about your district, marks, exams and interests — matched to the right {course.name} college.
              </Text>
              <LinkButton
                href="/quiz"
                label="Take the quiz to see which fits you best →"
                variant="primary"
                size="lg"
                style={styles.ctaBtn}
              />
            </Card>
          </View>

          {/* ── BACK ──────────────────────────────────────────────── */}
          <View style={styles.backRow}>
            <Button label={back} variant="secondary" onPress={goBack} />
          </View>

        </View>{/* end pageBody */}

        <SiteFooter />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Pill strip in the hero. */
function StatPill({ label }: { label: string }) {
  return (
    <View style={pillStyles.pill}>
      <Text style={pillStyles.text}>{label}</Text>
    </View>
  );
}

/** Step-label header (desktop: shows above each card). */
function StepLabel({
  number,
  label,
  dotColor,
  dotTextDark,
}: {
  number: string;
  label: string;
  dotColor: string;
  dotTextDark?: boolean;
}) {
  return (
    <View style={stepLabelStyles.wrap}>
      <View style={[stepLabelStyles.dot, { backgroundColor: dotColor }]}>
        <Text style={[stepLabelStyles.dotNum, dotTextDark && { color: colors.text }]}>
          {number}
        </Text>
      </View>
      <Text style={stepLabelStyles.label}>{label}</Text>
    </View>
  );
}

/** Mobile timeline step wrapper. */
function TimelineStep({
  number,
  label,
  accentColor,
  highlighted,
  last,
  children,
}: {
  number: string;
  label: string;
  accentColor: string;
  highlighted?: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[timelineStyles.step, last && timelineStyles.stepLast]}>
      {/* Dot */}
      <View style={[timelineStyles.dotWrap]}>
        <View style={[timelineStyles.dot, { backgroundColor: accentColor }]}>
          <Text style={timelineStyles.dotNum}>{number}</Text>
        </View>
      </View>
      {/* Content */}
      <View style={timelineStyles.content}>
        <Text style={timelineStyles.labelText}>{label}</Text>
        <View style={[
          nodeCardStyles.card,
          nodeCardStyles.cardBase,
          highlighted && nodeCardStyles.cardHighlighted,
          { borderTopColor: accentColor },
        ]}>
          {children}
        </View>
      </View>
    </View>
  );
}

// ─── Node content components ───────────────────────────────────────────────────

function Node1Content({ streams }: { streams: string[] }) {
  const subjectSets = streams.flatMap((s) => STREAM_SUBJECTS[s] ?? []);
  // deduplicate
  const subjects = Array.from(new Set(subjectSets));
  const streamStr = streams.map((s) => STREAM_LABELS[s as keyof typeof STREAM_LABELS] ?? s).join(' / ');

  return (
    <View>
      {/* Icon */}
      <View style={nodeCardStyles.iconBox}>
        <Svg viewBox="0 0 24 24" width={24} height={24}>
          <Path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke={colors.skyDeep} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M6 12v5c3 3 9 3 12 0v-5" stroke={colors.skyDeep} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
      <Text style={nodeCardStyles.nodeTitle}>Class 12 — {streamStr}</Text>
      <Text style={nodeCardStyles.nodeDesc}>
        You&apos;ve cleared or are appearing for your 12th board. That&apos;s the entry requirement.
      </Text>
      <View style={nodeCardStyles.chipRow}>
        {subjects.map((s) => (
          <View key={s} style={nodeCardStyles.chip}>
            <Text style={nodeCardStyles.chipText}>{s}</Text>
          </View>
        ))}
      </View>
      <View style={nodeCardStyles.infoNote}>
        <Text style={nodeCardStyles.infoNoteText}>
          Minimum marks vary by college — typically 45–50% for government seats, higher for top institutions.
        </Text>
      </View>
    </View>
  );
}

function Node2Content({ exams }: { exams: { id: string; name: string; fullName: string; scope: string }[] }) {
  if (exams.length === 0) {
    return (
      <View>
        <Badge label="Direct admission" tone="success" />
        <Text muted style={{ marginTop: spacing.sm, fontSize: fontSize.sm, lineHeight: 20 }}>
          No entrance exam required — admission is typically on 12th marks or merit.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      <View style={nodeCardStyles.gateNote}>
        <Text style={nodeCardStyles.gateNoteText}>
          Clear at least one exam to unlock admission options.
        </Text>
      </View>
      {exams.map((exam) => (
        <ExamMiniCard key={exam.id} exam={exam} />
      ))}
    </View>
  );
}

function ExamMiniCard({ exam }: { exam: { id: string; name: string; fullName: string; scope: string } }) {
  return (
    <View style={examCardStyles.wrap}>
      <View style={examCardStyles.top}>
        <View style={examCardStyles.badge}>
          <Text style={examCardStyles.badgeText} numberOfLines={1}>
            {exam.name.slice(0, 6)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={examCardStyles.name}>{exam.name}</Text>
          <Text style={examCardStyles.sub}>{exam.fullName}</Text>
        </View>
      </View>
      <Text style={examCardStyles.scope}>{exam.scope}</Text>
      <Link href={{ pathname: '/courses', params: { exam: exam.id } }} style={examCardStyles.link}>
        <Text style={examCardStyles.linkText}>View exam details →</Text>
      </Link>
    </View>
  );
}

function Node3Content({
  course,
  subjects,
  campusNote,
  categoryName,
}: {
  course: { name: string; durationYears: number };
  subjects: string[];
  campusNote: string;
  categoryName: string;
}) {
  return (
    <View>
      <View style={nodeCardStyles.courseTag}>
        <Text style={nodeCardStyles.courseTagText}>{categoryName.toUpperCase()}</Text>
      </View>
      <Text style={nodeCardStyles.nodeTitle}>{course.name}</Text>
      <Text style={nodeCardStyles.courseDuration}>
        {course.durationYears} {course.durationYears === 1 ? 'year' : 'years'} · {course.durationYears * 2} semesters
      </Text>
      <View style={nodeCardStyles.subjectTagRow}>
        {subjects.map((s) => (
          <View key={s} style={nodeCardStyles.subjectTag}>
            <Text style={nodeCardStyles.subjectTagText}>{s}</Text>
          </View>
        ))}
      </View>
      <View style={nodeCardStyles.campusNote}>
        <Text style={nodeCardStyles.campusNoteText}>{campusNote}</Text>
      </View>
    </View>
  );
}

function Node4Content({ careers }: { careers: CareerPath[] }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {careers.map(({ role, scope }) => (
        <View key={role} style={careerStyles.row}>
          <Text style={careerStyles.roleText}>{role}</Text>
          <Text style={careerStyles.scopeText}>{scope}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'stretch',
  },
  pageBody: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: IS_NARROW ? layout.gutterNarrow : layout.gutter,
    paddingBottom: spacing.x4l,
  },

  // Hero inner
  crumb: {
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  crumbText: {
    fontSize: fontSize.sm,
    color: 'rgba(13,40,64,0.55)',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: fontWeight.extrabold,
    letterSpacing: 2,
    color: colors.skyAnchor,
  },
  heroTitle: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_NARROW ? 32 : 52,
    lineHeight: IS_NARROW ? 36 : 56,
    letterSpacing: IS_NARROW ? -1 : -1.8,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  heroSub: {
    fontSize: IS_NARROW ? 15 : 18,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    fontFamily: fontFamily.hand,
    lineHeight: IS_NARROW ? 22 : 26,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Journey section
  journeySection: {
    marginTop: IS_NARROW ? spacing.x2l : spacing.x3l,
    marginBottom: IS_NARROW ? spacing.x2l : spacing.x3l,
  },

  // Desktop journey
  desktopJourney: {
    position: 'relative',
  },
  connectorWrap: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 0,
    pointerEvents: 'none',
  },
  connectorSvg: {
    width: '100%',
    height: 40,
  },
  stepLabelsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.md,
    position: 'relative',
    zIndex: 1,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
    position: 'relative',
    zIndex: 1,
  },
  cardCell: {
    flex: 1,
  },
  cardCellNode1: {},
  cardCellNode2: {},
  cardCellNode3: {},
  cardCellNode4: {},

  // Mobile timeline
  timelineWrap: {
    position: 'relative',
    paddingLeft: 52,
  },
  timelineSpine: {
    position: 'absolute',
    left: 13,
    top: 14,
    bottom: 14,
    width: 3,
    borderStyle: 'dashed',
    borderLeftWidth: 3,
    borderColor: colors.skyDeep,
    opacity: 0.3,
  },

  // Colleges section
  collegesSection: {
    marginBottom: spacing.x3l,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionHeadTitle: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_NARROW ? 22 : 28,
    letterSpacing: -0.8,
    color: colors.text,
  },
  sectionHeadCount: {
    color: colors.textSubtle,
  },
  collegeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  collegeCell: {
    flexGrow: 1,
    flexBasis: IS_NARROW ? '45%' : 300,
    maxWidth: 400,
  },
  seeAll: {
    marginTop: spacing.sm,
  },
  emptyState: {
    padding: spacing.xl,
  },

  // Quiz CTA
  ctaSection: {
    marginBottom: spacing.x2l,
  },
  ctaCard: {
    backgroundColor: colors.skyDeep,
    borderWidth: 0,
    borderRadius: radius.xl,
    padding: IS_NARROW ? spacing.x2l : spacing.x4l,
    alignItems: 'center',
  },
  ctaTitle: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_NARROW ? 22 : 28,
    letterSpacing: -0.8,
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ctaSub: {
    fontSize: IS_NARROW ? 14 : 16,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    maxWidth: 440,
    lineHeight: 24,
    marginBottom: spacing.x2l,
  },
  ctaBtn: {
    backgroundColor: colors.background,
  },

  // Back row
  backRow: {
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xl,
  },
});

const pillStyles = StyleSheet.create({
  pill: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
});

const stepLabelStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 0px 6px rgba(31, 95, 160, 0.20)',
    elevation: 2,
  },
  dotNum: {
    fontFamily: fontFamily.display,
    fontSize: 13,
    color: colors.textInverse,
  },
  label: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
});

const timelineStyles = StyleSheet.create({
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.x2l,
  },
  stepLast: {
    marginBottom: 0,
  },
  dotWrap: {
    position: 'absolute',
    left: -52,
    top: 0,
    alignItems: 'center',
    width: 52,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotNum: {
    fontFamily: fontFamily.display,
    fontSize: 13,
    color: colors.textInverse,
  },
  content: {
    flex: 1,
  },
  labelText: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textSubtle,
    marginBottom: spacing.sm,
  },
});

const nodeCardStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: IS_NARROW ? spacing.lg : spacing.xl,
    backgroundColor: colors.background,
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 4px 12px rgba(31, 95, 160, 0.08)',
    elevation: 2,
  },
  cardBase: {
    borderTopWidth: 3,
  },
  cardHighlighted: {
    backgroundColor: colors.skyPale,
  },

  // Node 1
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.skyPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  nodeTitle: {
    fontFamily: fontFamily.display,
    fontSize: 17,
    letterSpacing: -0.4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  nodeDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.skyPale,
    borderWidth: 1,
    borderColor: 'rgba(45,125,210,0.2)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: colors.skyAnchor,
  },
  infoNote: {
    backgroundColor: colors.skyPale,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.skyMid,
    padding: spacing.md,
  },
  infoNoteText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },

  // Node 2
  gateNote: {
    backgroundColor: 'rgba(255,217,61,0.1)',
    borderRadius: radius.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.sun,
    padding: spacing.md,
  },
  gateNoteText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 20,
  },

  // Node 3
  courseTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.skyDeep,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  courseTagText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
    color: colors.textInverse,
  },
  courseDuration: {
    fontSize: 13,
    color: colors.textSubtle,
    marginBottom: spacing.md,
  },
  subjectTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  subjectTag: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'rgba(45,125,210,0.2)',
  },
  subjectTagText: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  campusNote: {
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderLeftWidth: 3,
    borderLeftColor: colors.skyMid,
    padding: spacing.md,
  },
  campusNoteText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
});

const examCardStyles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.skyDeep,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    color: colors.textInverse,
    letterSpacing: 0.3,
  },
  name: {
    fontFamily: fontFamily.display,
    fontSize: 15,
    color: colors.text,
  },
  sub: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  scope: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  link: {
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: colors.skyDeep,
  },
});

const careerStyles = StyleSheet.create({
  row: {
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
  roleText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  scopeText: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
});

