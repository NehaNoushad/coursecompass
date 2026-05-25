/**
 * /courses — Stream-funnel catalogue port of Bprototype.html.
 *
 * Structure:
 *   1. Full-bleed SkyBandHero with an eyebrow chip, the big Sora
 *      display question, and a 5-tab stream switcher as the hero CTA.
 *   2. Summary line + "Reset to all courses" link below the hero.
 *   3. Course groups keyed by entrance-exam path:
 *        – JEE / KEAM      (PCM or Any)
 *        – NEET-UG         (PCB or Any)
 *        – Design exams    (UCEED / NID DAT / NIFT)
 *        – Other exams     (CLAT, KLEE, NCHMCT JEE, etc.)
 *        – Direct / CUET   (courses with cuet-ug or university entrances)
 *        – No entrance     (courses with empty examIds)
 *   4. A quiz-nudge banner at the bottom.
 *   5. SiteFooter.
 *
 * Because the hero must span the full viewport width this page draws its
 * own SiteHeader / ScrollView / SiteFooter trio instead of using <Screen>.
 */

import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { CourseCategoryId, Stream } from '@/types';
import { COURSES } from '@/data';
import { SkyBandHero } from '@/components/sky-band-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Text } from '@/components/ui/text';
import {
  colors,
  fontFamily,
  fontWeight,
  fontSize,
  layout,
  radius,
  spacing,
} from '@/constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

type StreamTab = Stream | 'any';

// ─── Stream tab config ────────────────────────────────────────────────────────

interface TabDef {
  id: StreamTab;
  label: string;
  emoji: string;
  summaryLabel: string;
}

const TABS: TabDef[] = [
  { id: 'pcm',      label: 'After PCM',            emoji: '🔬', summaryLabel: 'PCM' },
  { id: 'pcb',      label: 'After PCB',             emoji: '🧬', summaryLabel: 'PCB' },
  { id: 'commerce', label: 'After Commerce',        emoji: '📊', summaryLabel: 'Commerce' },
  { id: 'arts',     label: 'After Arts/Humanities', emoji: '🎨', summaryLabel: 'Arts / Humanities' },
  { id: 'any',      label: 'Any stream',            emoji: '✦',  summaryLabel: 'any stream' },
];

// ─── Exam-path group definitions ─────────────────────────────────────────────

interface ExamGroup {
  key: string;
  label: string;
  /** Which stream tabs show this group. Empty = shown for all tabs. */
  streams: StreamTab[];
  /** A course belongs to this group if it has at least one of these exam ids. */
  examIds: string[];
  /** If true, a course belongs to this group when its examIds is empty. */
  noExam?: boolean;
  accentColor: string;
}

const EXAM_GROUPS: ExamGroup[] = [
  {
    key: 'jee-keam',
    label: 'Need JEE / KEAM',
    streams: ['pcm', 'any'],
    examIds: ['jee-main', 'jee-advanced', 'keam', 'cusat-cat'],
    accentColor: colors.skyDeep,
  },
  {
    key: 'neet',
    label: 'Need NEET-UG',
    streams: ['pcb', 'any'],
    examIds: ['neet-ug'],
    accentColor: '#C0392B',
  },
  {
    key: 'agri-vet',
    label: 'Need ICAR / KAU / KVASU / KUFOS',
    streams: ['pcb', 'pcm', 'any'],
    examIds: ['icar-aieea', 'kau-entrance', 'kvasu-entrance', 'kufos-entrance'],
    accentColor: '#16A34A',
  },
  {
    key: 'design',
    label: 'Need a design exam (UCEED / NID DAT / NIFT)',
    streams: [],
    examIds: ['uceed', 'nid-dat', 'nift-entrance'],
    accentColor: '#059669',
  },
  {
    key: 'other',
    label: 'Other entrance exams (CLAT / NCHMCT JEE / NDA / IMU CET…)',
    streams: [],
    examIds: [
      'clat', 'klee',
      'nchmct-jee',
      'nda', 'inet', 'afcat', 'tes', 'coast-guard', 'imu-cet',
      'iiser-iat', 'nest',
      'nata', 'jee-main-paper2',
      'kuhs-paramedical', 'lbs-allied-health',
      'kerala-deled', 'ncet',
      'kerala-polytechnic',
      'kmat',
    ],
    accentColor: '#7C3AED',
  },
  {
    key: 'cuet-direct',
    label: 'Direct / CUET-UG / University entrance',
    streams: [],
    examIds: [
      'cuet-ug',
      'kerala-univ-entrance', 'mg-univ-entrance',
      'calicut-univ-entrance', 'kannur-univ-entrance',
      'kerala-sanskrit-univ-entrance', 'malayalam-univ-entrance',
    ],
    accentColor: '#D97706',
  },
  {
    key: 'no-exam',
    label: 'Direct admission — no entrance exam',
    streams: [],
    examIds: [],
    noExam: true,
    accentColor: colors.textMuted,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IS_NARROW = Dimensions.get('window').width < 980;

function categoryLabel(id: CourseCategoryId): string {
  // Capitalise the category id for a quick readable pill.
  return id.replace(/-/g, ' ').toUpperCase();
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CoursesScreen() {
  const params = useLocalSearchParams<{ stream?: string; category?: string; exam?: string }>();

  // Read ?stream= from URL and validate it
  const validStreams: StreamTab[] = ['pcm', 'pcb', 'commerce', 'arts', 'any'];
  const initialStream: StreamTab =
    params.stream && validStreams.includes(params.stream as StreamTab)
      ? (params.stream as StreamTab)
      : 'pcm';

  const [activeStream, setActiveStream] = useState<StreamTab>(initialStream);
  const [search, setSearch] = useState('');

  // Courses visible for the active stream (before the search filter).
  const streamFilteredCourses = useMemo(
    () =>
      COURSES.filter(
        (c) =>
          activeStream === 'any' ||
          c.streams.includes(activeStream as Stream),
      ),
    [activeStream],
  );

  // Apply the live search filter on top of the stream filter. Empty
  // query passes everything through. Matches against:
  //   1. Direct substring of the course name (case-insensitive).
  //   2. Acronym derived from the course name's words — so typing
  //      "CSE" finds "B.Tech Computer Science Engineering" (whose
  //      word-initials spell "bcse" and contain "cse"). Without this,
  //      students searching by the common abbreviations they actually
  //      know would get zero results.
  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return streamFilteredCourses;
    return streamFilteredCourses.filter((c) => {
      const name = c.name.toLowerCase();
      if (name.includes(q)) return true;
      const initials = name
        .split(/[\s&.,()/-]+/)
        .filter((w) => w.length >= 2)
        .map((w) => w[0])
        .join('');
      return initials.includes(q);
    });
  }, [streamFilteredCourses, search]);

  // Build grouped lists — a course can appear in more than one group
  const groups = useMemo(() => {
    return EXAM_GROUPS.map((group) => {
      // Check stream visibility: groups with empty `streams` array show for all tabs.
      const streamVisible =
        group.streams.length === 0 || group.streams.includes(activeStream);

      if (!streamVisible) return { ...group, courses: [] };

      const courses = visibleCourses.filter((c) => {
        if (group.noExam) return c.examIds.length === 0;
        return c.examIds.some((eid) => group.examIds.includes(eid));
      });

      return { ...group, courses };
    });
  }, [visibleCourses, activeStream]);

  const activeTab = TABS.find((t) => t.id === activeStream)!;
  const isSearching = search.trim().length > 0;
  const noResults = isSearching && visibleCourses.length === 0;

  return (
    <View style={styles.root}>
      <SiteHeader />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <SkyBandHero minHeight={IS_NARROW ? 280 : 380}>
          {/* Eyebrow chip */}
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>BROWSE BY STREAM</Text>
          </View>

          {/* Headline */}
          <Text style={styles.heroTitle}>
            What did you study{'\n'}after{' '}
            <Text style={styles.heroTitleEm}>10th</Text>?
          </Text>

          {/* Sub-line */}
          <Text style={styles.heroSub}>
            We&apos;ll show you the courses you qualify for, grouped by the entrance exam you&apos;d need.
          </Text>

          {/* Stream tabs */}
          <View style={styles.tabRow}>
            {TABS.map((tab) => {
              const isActive = activeStream === tab.id;
              const count =
                tab.id === 'any'
                  ? COURSES.filter((c) => c.streams.length < 4).length
                  : COURSES.filter((c) => c.streams.includes(tab.id as Stream)).length;
              return (
                <Pressable
                  key={tab.id}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveStream(tab.id)}>
                  <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                  <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
                    {count}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SkyBandHero>

        {/* ── Content area ── */}
        <View style={styles.body}>

          {/* Summary bar */}
          <View style={styles.contentBar}>
            <Text style={styles.summaryText}>
              {isSearching ? (
                <>
                  <Text style={styles.summaryEm}>{visibleCourses.length}</Text> course
                  {visibleCourses.length === 1 ? '' : 's'} matching &ldquo;{search.trim()}&rdquo;
                  {activeStream !== 'any' ? (
                    <> within <Text style={styles.summaryEm}>{activeTab.summaryLabel}</Text></>
                  ) : null}
                  .
                </>
              ) : activeStream === 'any' ? (
                <>Showing all <Text style={styles.summaryEm}>{visibleCourses.length} courses</Text> across every stream.</>
              ) : (
                <>You studied <Text style={styles.summaryEm}>{activeTab.summaryLabel}</Text>. Here are <Text style={styles.summaryEm}>{visibleCourses.length} courses</Text> you can apply for.</>
              )}
            </Text>
            <Pressable onPress={() => setActiveStream('any')} style={styles.resetBtn}>
              <Text style={styles.resetText}>← Reset to all courses</Text>
            </Pressable>
          </View>

          {/* Search input — live filters across all visible exam-path groups. */}
          <View style={styles.searchWrap}>
            {/* Raw <input> on web (this app is web-only for now). RN's
                TextInput's focus ring conflicts with the soft pill we
                want here. Inline CSS scoped by `cc-search` class is
                rendered after the body via a <style> sibling — matches
                the pattern used on /colleges. */}
            <input
              className="cc-search"
              placeholder="Search by course name… (e.g. CSE, Nursing, B.Com)"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            {isSearching ? (
              <Pressable onPress={() => setSearch('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Empty state when search returns nothing */}
          {noResults ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No courses match &ldquo;{search.trim()}&rdquo;
                {activeStream !== 'any' ? <> in {activeTab.summaryLabel}</> : null}
              </Text>
              <Text style={styles.emptyBody}>
                Try a shorter query, a different spelling, or
                {activeStream !== 'any' ? <> switching to <Text style={styles.summaryEm}>Any stream</Text></> : <> a different course name</>}.
              </Text>
              <Pressable onPress={() => setSearch('')} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Clear search</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Course groups */}
          {groups.map((group) => {
            if (group.courses.length === 0) return null;
            return (
              <View key={group.key} style={styles.pathGroup}>
                {/* Group header */}
                <View style={styles.pathHeader}>
                  <View style={[styles.pathBadge, { backgroundColor: group.accentColor }]}>
                    <Text style={styles.pathBadgeText}>{group.label}</Text>
                  </View>
                  <Text style={styles.pathCount}>{group.courses.length} courses</Text>
                  <View style={styles.pathRule} />
                </View>

                {/* Tile grid */}
                <View style={styles.tileRow}>
                  {group.courses.map((course) => (
                    <Link
                      key={`${group.key}-${course.id}`}
                      href={`/courses/${course.id}`}
                      asChild>
                      {/* StyleSheet.flatten merges the array into a single
                          object — necessary because <Link asChild> clones
                          onto an <a> on web and drops array-typed styles
                          on the inner Pressable. Same fix as in
                          components/college-card.tsx. */}
                      <Pressable
                        style={StyleSheet.flatten([styles.tile, { borderTopColor: group.accentColor }])}>
                        {/* Category pill */}
                        <View style={styles.catPill}>
                          <Text style={styles.catPillText}>{categoryLabel(course.categoryId)}</Text>
                        </View>

                        {/* Course name */}
                        <Text style={styles.tileName}>{course.name}</Text>

                        {/* Duration + stream strip */}
                        <View style={styles.tileMeta}>
                          <Text style={styles.tileDuration}>
                            {course.durationYears} yr{course.durationYears !== 1 ? 's' : ''}
                          </Text>
                          <View style={styles.tileDot} />
                          <Text style={styles.tileStreams}>
                            {course.streams.map((s) => s.toUpperCase()).join(' · ')}
                          </Text>
                        </View>

                        {/* CTA */}
                        <View style={styles.tileCta}>
                          <Text style={styles.tileCtaText}>View course </Text>
                          <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                            <Path
                              d="M5 12h14M13 6l6 6-6 6"
                              stroke={colors.skyDeep}
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        </View>
                      </Pressable>
                    </Link>
                  ))}
                </View>

                {/* Note for direct-admission group */}
                {group.key === 'cuet-direct' && (
                  <View style={styles.directNote}>
                    <Text style={styles.directNoteText}>
                      ℹ  These courses admit students directly based on 12th marks at government and aided colleges. Private colleges may require CUET-UG or a university entrance test.
                    </Text>
                  </View>
                )}
                {group.key === 'no-exam' && (
                  <View style={styles.directNote}>
                    <Text style={styles.directNoteText}>
                      ℹ  These programmes rely on portfolio review, audition, or merit — no written entrance exam required.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Quiz nudge */}
          <View style={styles.quizNudge}>
            <View style={styles.quizNudgeText}>
              <Text style={styles.quizNudgeTitle}>
                Not sure which exam to aim for?
              </Text>
              <Text style={styles.quizNudgeSub}>
                Answer 6 quick questions — we&apos;ll match courses and colleges to your marks, district, and budget.
              </Text>
            </View>
            <Link href="/quiz" asChild>
              <Pressable style={styles.quizNudgeBtn}>
                <Text style={styles.quizNudgeBtnText}>Take the quiz</Text>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="white"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
            </Link>
          </View>

        </View>{/* /body */}

        <SiteFooter />

        {/* Web-only styling for the raw <input>. Scoped by .cc-search
            class so it doesn't bleed into the rest of the app. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .cc-search {
                flex: 1;
                width: 100%;
                height: 48px;
                padding: 0 18px;
                border: 1.5px solid ${colors.border};
                border-radius: 999px;
                background: ${colors.background};
                font-family: inherit;
                font-size: 15px;
                color: ${colors.text};
                outline: none;
                box-sizing: border-box;
                transition: border-color 0.15s, box-shadow 0.15s;
              }
              .cc-search::placeholder { color: ${colors.textSubtle}; }
              .cc-search:focus {
                border-color: ${colors.primary};
                box-shadow: 0 0 0 4px rgba(45, 125, 210, 0.12);
              }
            `,
          }}
        />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    // Don't `alignItems: 'center'` — that shrinks the full-bleed
    // SkyBandHero down to the body's max-width. The body block sets
    // its own alignSelf:center; the hero (and footer) get the full
    // ScrollView width.
  },

  // ── Hero internals ──────────────────────────────────────────────────────────
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  eyebrowText: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.xs,
    letterSpacing: 2,
    color: colors.text,
  },
  heroTitle: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_NARROW ? 38 : 52,
    lineHeight: IS_NARROW ? 44 : 56,
    letterSpacing: -1.5,
    color: colors.text,
    marginBottom: spacing.md,
  },
  heroTitleEm: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_NARROW ? 38 : 52,
    lineHeight: IS_NARROW ? 44 : 56,
    letterSpacing: -1.5,
    color: colors.accent,
  },
  heroSub: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
    marginBottom: spacing.x2l,
    maxWidth: 560,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: IS_NARROW ? 10 : 14,
    paddingHorizontal: IS_NARROW ? 14 : 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  tabEmoji: {
    fontSize: IS_NARROW ? 15 : 18,
  },
  tabLabel: {
    fontFamily: fontFamily.display,
    fontSize: IS_NARROW ? 13 : 15,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.textInverse,
  },
  tabCount: {
    fontSize: 13,
    fontWeight: fontWeight.regular,
    color: colors.textSubtle,
  },
  tabCountActive: {
    color: 'rgba(255,255,255,0.7)',
  },

  // ── Content body ────────────────────────────────────────────────────────────
  body: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: IS_NARROW ? spacing.lg : spacing.xl,
    paddingBottom: spacing.x3l,
    marginTop: -20,
  },
  contentBar: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31,95,160,0.12)',
    marginBottom: spacing.x2l,
    flexWrap: 'wrap',
  },
  summaryText: {
    fontFamily: fontFamily.display,
    fontSize: IS_NARROW ? 16 : 20,
    letterSpacing: -0.4,
    color: colors.text,
    flex: 1,
  },
  summaryEm: {
    fontFamily: fontFamily.display,
    fontSize: IS_NARROW ? 16 : 20,
    letterSpacing: -0.4,
    color: colors.skyDeep,
  },
  resetBtn: {
    paddingVertical: spacing.xs,
  },
  resetText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSubtle,
  },

  // ── Search input row ─────────────────────────────────────────────────────────
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  clearBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },

  // ── Empty state when search returns nothing ──────────────────────────────────
  emptyCard: {
    padding: spacing.x3l,
    alignItems: 'flex-start',
    backgroundColor: colors.skyPale,
    borderRadius: radius.xl,
    gap: spacing.sm,
    marginBottom: spacing.x2l,
  },
  emptyTitle: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  emptyBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textInverse,
  },

  // ── Path groups ──────────────────────────────────────────────────────────────
  pathGroup: {
    marginBottom: spacing.x2l + spacing.md,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  pathBadge: {
    paddingVertical: 6,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
  pathBadgeText: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 13,
    letterSpacing: 0.3,
    color: colors.textInverse,
  },
  pathCount: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 14,
    color: colors.textMuted,
  },
  pathRule: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(31,95,160,0.12)',
    minWidth: 20,
  },

  // ── Tile row + individual tile ────────────────────────────────────────────
  tileRow: {
    flexDirection: 'row',
    flexWrap: IS_NARROW ? 'nowrap' : 'wrap',
    gap: 12,
    ...(IS_NARROW
      ? {
          overflowX: 'scroll' as 'scroll',
          paddingBottom: spacing.sm,
        }
      : {}),
  },
  tile: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'rgba(31,95,160,0.12)',
    borderTopWidth: 3,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...(IS_NARROW
      ? { minWidth: 200, maxWidth: 240, flexShrink: 0 }
      : { minWidth: 200, maxWidth: 260, flex: 1 }),
  },
  catPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.skyPale,
    borderRadius: radius.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  catPillText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
    color: colors.skyAnchor,
  },
  tileName: {
    fontFamily: fontFamily.display,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.2,
    color: colors.text,
  },
  tileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tileDuration: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSubtle,
  },
  tileDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textSubtle,
  },
  tileStreams: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    color: colors.textSubtle,
    letterSpacing: 0.5,
  },
  tileCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: spacing.xs,
  },
  tileCtaText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.skyDeep,
  },
  directNote: {
    backgroundColor: colors.skyPale,
    borderWidth: 1,
    borderColor: 'rgba(31,95,160,0.15)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  directNoteText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },

  // ── Quiz nudge ───────────────────────────────────────────────────────────────
  quizNudge: {
    marginTop: spacing.x3l,
    backgroundColor: colors.skyPale,
    borderWidth: 1,
    borderColor: 'rgba(31,95,160,0.15)',
    borderRadius: radius.xl,
    padding: IS_NARROW ? spacing.xl : spacing.x2l + spacing.sm,
    flexDirection: IS_NARROW ? 'column' : 'row',
    alignItems: IS_NARROW ? 'flex-start' : 'center',
    gap: IS_NARROW ? spacing.lg : spacing.x2l,
  },
  quizNudgeText: {
    flex: 1,
  },
  quizNudgeTitle: {
    fontFamily: fontFamily.display,
    fontSize: IS_NARROW ? 18 : 22,
    letterSpacing: -0.5,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  quizNudgeSub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
  },
  quizNudgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.x2l,
    backgroundColor: colors.text,
    borderRadius: radius.pill,
  },
  quizNudgeBtnText: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.sm,
    color: colors.textInverse,
  },
});
