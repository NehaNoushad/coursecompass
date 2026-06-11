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
import { Dimensions, Platform, ScrollView, StyleSheet, View } from 'react-native';

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

const MAX_PATH_COURSES = IS_NARROW ? 3 : 5;
const MAX_PATH_EXAMS = IS_NARROW ? 4 : 6;
// Cap the bottom evidence grids to avoid infinite-scroll on phones.
const MAX_GRID_COURSES = IS_NARROW ? 6 : 30;
const MAX_GRID_COLLEGES = IS_NARROW ? 4 : 30;

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
            {path.careers.slice(0, IS_NARROW ? 2 : 3).map((c) => (
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
    maxWidth: IS_NARROW ? 220 : 300,
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

// ─── PDF report generation ───────────────────────────────────────────────────

/**
 * Opens a new browser tab with a formatted A4 HTML report and immediately
 * triggers the print dialog so the student can save it as a PDF. Zero
 * dependencies — the browser does all the heavy lifting.
 */
function buildReportHtml(answers: QuizAnswers, result: Recommendation): string {
  const chips = profileChips(answers);

  const blockedHtml = result.blocked.map((b) => `
    <div class="blocked-card">
      <strong>About ${b.category.name}</strong>
      <p>${b.note}</p>
    </div>`).join('');

  const pathsHtml = result.paths.map((p, i) => `
    <div class="path-card">
      <div class="path-header">
        <span class="rank">${i + 1}</span>
        <div class="path-title">
          <h3>${p.category.name}</h3>
          <p class="desc">${p.category.description}</p>
        </div>
        ${i === 0 ? '<span class="badge-top">Top match</span>' : ''}
      </div>
      <div class="section-label">WHY IT FITS YOU</div>
      <ul class="bullets">${p.whyItFits.map((r) => `<li>${r}</li>`).join('')}</ul>
      ${p.cautions.length > 0 ? `
        <div class="caution-box">
          ${p.cautions.map((c) => `<p>⚠ ${c}</p>`).join('')}
        </div>` : ''}
      <div class="section-label">THE GATE</div>
      <div class="pills">
        ${p.exams.length === 0
          ? '<span class="pill pill-ok">No entrance exam — direct admission</span>'
          : p.exams.slice(0, 6).map((e) =>
              `<span class="pill ${e.attempted ? 'pill-ok' : ''}">${e.attempted ? '✓ ' : ''}${e.exam.name}</span>`
            ).join('')
        }
        ${p.directAdmissionCount > 0 && p.exams.length > 0
          ? `<span class="pill pill-ok">+${plural(p.directAdmissionCount, 'course')} direct admission</span>`
          : ''}
      </div>
      ${p.careers.length > 0 ? `
        <div class="section-label">WHERE IT CAN LEAD</div>
        <div class="careers">
          ${p.careers.map((c) => `
            <div class="career-row">
              <strong>${c.role}</strong>
              <span>${c.scope}</span>
            </div>`).join('')}
        </div>` : ''}
    </div>`).join('');

  const discoveriesHtml = result.discoveries.length > 0 ? `
    <h2>Worth a look — fields you didn't pick</h2>
    <div class="discoveries">
      ${result.discoveries.map((d) => `
        <div class="discovery-card">
          <div class="eyebrow">HAVE YOU CONSIDERED</div>
          <h4>${d.category.name}</h4>
          <p>${d.reason}</p>
        </div>`).join('')}
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Your CollegeDash Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
         color: #0D2840; background: #fff; }
  @page { margin: 1.5cm; size: A4 portrait; }
  h1  { font-size: 22px; font-weight: 800; }
  h2  { font-size: 17px; font-weight: 700; color: #1F5FA0;
        border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;
        margin: 28px 0 14px; }
  h3  { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
  h4  { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  p   { font-size: 13px; color: #4A5A6E; line-height: 1.55; margin-top: 3px; }
  .report-header { background: linear-gradient(135deg,#87CEEB,#2D7DD2);
                   padding: 20px 24px; color: #fff; }
  .report-header h1 { color: #fff; margin-bottom: 10px; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip  { background: rgba(255,255,255,0.88); padding: 3px 11px;
           border-radius: 999px; font-size: 12px; color: #0D2840; font-weight: 500; }
  .body  { padding: 20px 24px; }
  .marks-note { background: #F2F6FB; border-radius: 8px; padding: 11px 14px;
                font-size: 13px; color: #4A5A6E; margin-bottom: 18px; }
  .blocked-card { background: #FFFBEB; border-left: 3px solid #FFD93D;
                  padding: 9px 13px; border-radius: 7px; margin-bottom: 10px; }
  .blocked-card strong { font-size: 13px; }
  .path-card { border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px;
               margin-bottom: 16px; page-break-inside: avoid; }
  .path-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
  .rank  { width: 28px; height: 28px; border-radius: 14px; background: #2D7DD2;
           color: #fff; display: flex; align-items: center; justify-content: center;
           font-size: 13px; font-weight: 700; flex-shrink: 0; }
  .path-title { flex: 1; }
  .desc  { font-size: 12px; color: #8895A6; margin-top: 1px; }
  .badge-top { background: #DCFCE7; color: #16A34A; font-size: 11px; font-weight: 700;
               padding: 2px 9px; border-radius: 999px; white-space: nowrap;
               align-self: flex-start; }
  .section-label { font-size: 10px; letter-spacing: 1.5px; color: #8895A6;
                   font-weight: 700; text-transform: uppercase; margin: 12px 0 6px; }
  .bullets { padding-left: 18px; }
  .bullets li { font-size: 13px; color: #4A5A6E; margin-bottom: 4px; line-height: 1.5; }
  .caution-box { background: #FFFBEB; border-left: 3px solid #FFD93D;
                 padding: 8px 12px; border-radius: 6px; margin: 8px 0; }
  .caution-box p { font-size: 12px; }
  .pills { display: flex; flex-wrap: wrap; gap: 6px; }
  .pill  { border: 1px solid #E2E8F0; padding: 3px 10px; border-radius: 999px;
           font-size: 12px; color: #4A5A6E; }
  .pill-ok { border-color: #16A34A; background: #DCFCE7; color: #16A34A; font-weight: 600; }
  .careers { display: flex; flex-direction: column; gap: 7px; }
  .career-row { border-left: 3px solid #4FA3E0; background: #E8F4FD;
                padding: 7px 11px; border-radius: 6px; }
  .career-row strong { font-size: 13px; display: block; }
  .career-row span   { font-size: 12px; color: #4A5A6E; }
  .discoveries { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px; }
  .discovery-card { background: #E8F4FD; border-radius: 10px; padding: 13px;
                    flex: 1; min-width: 180px; page-break-inside: avoid; }
  .eyebrow { font-size: 10px; letter-spacing: 1.5px; color: #1F5FA0;
             font-weight: 700; text-transform: uppercase; margin-bottom: 5px; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #E2E8F0;
            font-size: 11px; color: #8895A6; text-align: center; }
</style>
</head>
<body>
<div class="report-header">
  <h1>Your CollegeDash Report</h1>
  <div class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join('')}</div>
</div>
<div class="body">
  <div class="marks-note">${marksNote(answers.marksBand)}</div>
  ${blockedHtml ? `<h2>Honest heads-up</h2>${blockedHtml}` : ''}
  <h2>Your best-fit paths</h2>
  ${pathsHtml || '<p>No paths matched. Try retaking the quiz with broader interests.</p>'}
  ${discoveriesHtml}
  <p class="footer">Generated by CollegeDash · collegedash.in</p>
</div>
<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;
}

function downloadReport(answers: QuizAnswers, result: Recommendation) {
  if (Platform.OS !== 'web') return;
  const html = buildReportHtml(answers, result);
  const win = typeof window !== 'undefined' ? window.open('', '_blank') : null;
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

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

          {/* Quick-access download — visible without scrolling on desktop */}
          {Platform.OS === 'web' ? (
            <View style={rs.downloadRow}>
              <Button
                label="⬇ Download Report as PDF"
                variant="primary"
                onPress={() => downloadReport(answers, result)}
              />
              <Text variant="caption" muted style={{ alignSelf: 'center' }}>
                Opens in a new tab → save with browser print → PDF
              </Text>
            </View>
          ) : null}

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

          {/* Supporting evidence — match grids (capped on mobile). */}
          <SectionHead
            title="Every course that fits you"
            sub={`${Math.min(result.courses.length, MAX_GRID_COURSES)} of ${result.courses.length} matches, best first.`}
          />
          <View style={rs.grid}>
            {result.courses.slice(0, MAX_GRID_COURSES).map((m) => (
              <View key={m.course.id} style={rs.cell}>
                <CourseCard course={m.course} from="quiz" />
                <MatchReasons reasons={m.reasons} />
              </View>
            ))}
          </View>
          {result.courses.length > MAX_GRID_COURSES ? (
            <LinkButton
              href="/courses"
              label={`Browse all ${result.courses.length} matching courses →`}
              variant="ghost"
            />
          ) : null}

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
            <>
              <View style={rs.grid}>
                {result.colleges.slice(0, MAX_GRID_COLLEGES).map((m) => (
                  <View key={m.college.id} style={rs.cell}>
                    <CollegeCard college={m.college} from="quiz" />
                    <MatchReasons reasons={m.reasons} />
                  </View>
                ))}
              </View>
              {result.colleges.length > MAX_GRID_COLLEGES ? (
                <LinkButton
                  href="/colleges"
                  label={`Browse all ${result.colleges.length} matching colleges →`}
                  variant="ghost"
                />
              ) : null}
            </>
          )}

          <View style={rs.nav}>
            <Button label="Retake the quiz" variant="secondary" onPress={onRestart} />
            <Button
              label="⬇ Download as PDF"
              variant="primary"
              onPress={() => downloadReport(answers, result)}
            />
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
    paddingHorizontal: IS_NARROW ? spacing.lg : spacing.xl,
    paddingVertical: IS_NARROW ? spacing.xl : spacing.x2l,
  },
  marksCard: {
    marginTop: spacing.lg,
  },
  downloadRow: {
    flexDirection: IS_NARROW ? 'column' : 'row',
    alignItems: IS_NARROW ? 'flex-start' : 'center',
    gap: spacing.md,
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
