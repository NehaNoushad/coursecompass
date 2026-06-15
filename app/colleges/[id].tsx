/**
 * /colleges/[id] — College detail page.
 *
 * Visual: "Brochure" direction (B-prototype) with A's hero.
 *   - SkyBandHero: breadcrumb, eyebrow chip, display name, accreditation pill
 *     row, handwritten quiz nudge.
 *   - Two-column body on desktop (≥ 980): left narrative column (~70%) +
 *     sticky right sidebar (~300 px). Single column on mobile.
 *   - Left: key-facts pills, About (derived tagline + pull-quote), What's on
 *     offer (courses per category), Getting in (exam pills), Where it is (map
 *     placeholder + address), closing quiz CTA.
 *   - Right sidebar: At a glance, Contact, Shortlist (phase-4 placeholder).
 *
 * Page does NOT use <Screen> — SkyBandHero needs to be full-bleed, so we
 * draw SiteHeader / ScrollView / SiteFooter directly (same pattern as
 * app/account.tsx and app/colleges/index.tsx).
 */

import { router, useLocalSearchParams } from 'expo-router';
import {
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

import {
  CATEGORY_BY_ID,
  COLLEGES,
  COLLEGE_BY_ID,
  EXAM_BY_ID,
  TYPE_LABELS,
  getCoursesForCollege,
} from '@/data';
import { Seo } from '@/components/seo';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';
import { Button, LinkButton } from '@/components/ui/button';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SkyBandHero } from '@/components/sky-band-hero';
import { Text } from '@/components/ui/text';

// ─── Breakpoint ──────────────────────────────────────────────────────────────

const WIN_W = Dimensions.get('window').width;
const IS_NARROW = WIN_W < 980;
const IS_PHONE = WIN_W < 640;

// ─── Routing helpers ─────────────────────────────────────────────────────────

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/colleges');
  }
}

function backLabel(from: string | undefined): string {
  if (from === 'quiz') return '← Back to your matches';
  return '← Browse colleges';
}

// ─── Derived content helpers ──────────────────────────────────────────────────

/**
 * Two-paragraph about text derived from structured college fields.
 * Deterministic — no randomness.
 */
function aboutParagraphs(college: NonNullable<(typeof COLLEGE_BY_ID)[string]>): [string, string] {
  const typeName = TYPE_LABELS[college.type].toLowerCase();
  const catNames = college.categories
    .slice(0, 3)
    .map((id) => CATEGORY_BY_ID[id]?.name)
    .filter((n): n is string => Boolean(n));
  const catExtra = Math.max(0, college.categories.length - 3);
  const catList = catNames.join(', ') + (catExtra > 0 ? ` and ${catExtra} more` : '');

  const prestige: string[] = [];
  if (college.naacGrade) prestige.push(`accredited ${college.naacGrade} by NAAC`);
  if (college.nirfRank) prestige.push(`ranked #${college.nirfRank} in the NIRF`);
  const prestigeLine =
    prestige.length > 0 ? ` The college is ${prestige.join(' and ')}.` : '';

  const estLine = college.established ? `Founded in ${college.established}, ` : '';

  const p1 = `${estLine}${college.name} is a ${typeName} college in ${college.district} district, Kerala.${prestigeLine} It offers programmes across ${college.categories.length} ${college.categories.length === 1 ? 'area' : 'areas'} including ${catList}.`;

  const seats = college.totalSeats
    ? `With approximately ${college.totalSeats.toLocaleString()} seats across its programmes, the college`
    : 'The college';
  const p2 = `${seats} serves students from ${college.district} and the surrounding districts. Admission to most programmes follows the Kerala CAP portal process; check the college website for management-quota and NRI-quota details.`;

  return [p1, p2];
}

/**
 * Pull-quote line derived from available prestige signals.
 * Deterministic — first matching pattern wins.
 */
function pullQuote(college: NonNullable<(typeof COLLEGE_BY_ID)[string]>): string {
  if (college.naacGrade && college.nirfRank)
    return `NAAC ${college.naacGrade} and NIRF #${college.nirfRank} — ${college.name} is among the benchmarked colleges in Kerala.`;
  if (college.naacGrade)
    return `Accredited ${college.naacGrade} by NAAC — ${college.name} meets the national quality bar for academics and infrastructure.`;
  if (college.nirfRank)
    return `Ranked #${college.nirfRank} in the NIRF — ${college.name} is a nationally benchmarked institution.`;
  if (college.established) {
    const age = 2026 - college.established;
    return `${age} years in operation — ${college.name} has built a track record serving students in ${college.district}.`;
  }
  return `${college.name} is a ${TYPE_LABELS[college.type].toLowerCase()} college in ${college.district} offering pathways across ${college.categories.length} subject areas.`;
}

/**
 * A Google-search link for a college's official website. Used as the
 * honest fallback when we don't have a verified URL on file — better to
 * send students to a fresh search than to a hardcoded link we can't
 * vouch for.
 */
function officialSearchHref(name: string, district: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(
    `${name} ${district} Kerala official website`,
  )}`;
}

// ─── Small icon components ────────────────────────────────────────────────────

function IconPhone() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 7.09 7.09l.98-1.08a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        stroke={colors.skyDeep}
        strokeWidth={2}
      />
    </Svg>
  );
}

function IconEmail() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        stroke={colors.skyDeep}
        strokeWidth={2}
      />
      <Polyline points="22,6 12,13 2,6" stroke={colors.skyDeep} strokeWidth={2} />
    </Svg>
  );
}

function IconGlobe() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={colors.skyDeep} strokeWidth={2} />
      <Line x1={2} y1={12} x2={22} y2={12} stroke={colors.skyDeep} strokeWidth={2} />
      <Path
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        stroke={colors.skyDeep}
        strokeWidth={2}
      />
    </Svg>
  );
}

function IconPin() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        stroke={colors.skyDeep}
        strokeWidth={2}
      />
      <Circle cx={12} cy={10} r={3} stroke={colors.skyDeep} strokeWidth={2} />
    </Svg>
  );
}

function IconBookmark() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        stroke={colors.textSubtle}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Pill in the hero's accreditation row. accent=true → dark ink background. */
function HeroPill({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[s.heroPill, accent && s.heroPillAccent]}>
      {!accent && <View style={s.heroPillDot} />}
      <Text
        style={[
          s.heroPillText,
          { color: accent ? colors.textInverse : colors.text },
        ]}>
        {label}
      </Text>
    </View>
  );
}

/** Small key-facts pill in the narrative column. */
function KFPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.kfPill}>
      <View style={s.kfDot} />
      <Text style={s.kfText}>
        <Text style={s.kfLabel}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

/** Editorial section label (line + uppercase caption). */
function EditLabel({ children }: { children: string }) {
  return (
    <View style={s.editLabelRow}>
      <View style={s.editLabelLine} />
      <Text style={s.editLabelText}>{children.toUpperCase()}</Text>
    </View>
  );
}

/** A row inside one of the sidebar cards (label · value). */
function SRow({
  label,
  value,
  badge,
  valueMuted,
}: {
  label: string;
  value?: string;
  badge?: string;
  valueMuted?: boolean;
}) {
  return (
    <View style={s.sRow}>
      <Text style={s.sRowLabel}>{label}</Text>
      {badge ? (
        <View style={s.sRowBadge}>
          <Text style={s.sRowBadgeText}>{badge}</Text>
        </View>
      ) : (
        <Text style={[s.sRowVal, valueMuted && s.sRowValMuted]} numberOfLines={2}>
          {value ?? '—'}
        </Text>
      )}
    </View>
  );
}

/** A tappable contact row (phone / email / website). */
function ContactLink({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <View style={s.contactLink}>
      <View style={s.contactIcon}>{icon}</View>
      <View>
        <Text style={s.contactLabel}>{label.toUpperCase()}</Text>
        <Text style={s.contactValue} onPress={() => Linking.openURL(href)}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/** The sidebar card stack — extracted so it renders once on desktop (right)
 *  and once on mobile (below the narrative). */
function SidebarCards({
  college,
  typeLabel,
}: {
  college: NonNullable<(typeof COLLEGE_BY_ID)[string]>;
  typeLabel: string;
}) {
  return (
    <>
      {/* At a glance */}
      <View style={s.sCard}>
        <View style={s.sCardTitle}>
          <Text style={s.sCardTitleText}>At a glance</Text>
          <View style={s.sCardDot} />
        </View>
        <SRow label="District" value={college.district} />
        <SRow label="Type" value={typeLabel} />
        {college.established ? (
          <SRow label="Established" value={String(college.established)} />
        ) : null}
        {college.totalSeats ? (
          <SRow label="Total seats" value={`~${college.totalSeats.toLocaleString()}`} />
        ) : null}
        {college.naacGrade ? <SRow label="NAAC grade" badge={college.naacGrade} /> : null}
        {college.nirfRank ? <SRow label="NIRF rank" badge={`#${college.nirfRank}`} /> : null}
      </View>

      {/* Contact — always rendered; the website row falls back to a
          Google search when we don't have a verified URL on file. */}
      <View style={[s.sCard, s.sCardGap]}>
        <View style={s.sCardTitle}>
          <Text style={s.sCardTitleText}>Contact</Text>
          <View style={s.sCardDot} />
        </View>
        {college.phone ? (
          <ContactLink
            icon={<IconPhone />}
            label="Phone"
            value={college.phone}
            href={`tel:${college.phone}`}
          />
        ) : null}
        {college.admissionsEmail ? (
          <ContactLink
            icon={<IconEmail />}
            label="Email"
            value={college.admissionsEmail}
            href={`mailto:${college.admissionsEmail}`}
          />
        ) : null}
        {college.website ? (
          <ContactLink
            icon={<IconGlobe />}
            label="Website"
            value={college.website.replace(/^https?:\/\//, '') + ' ↗'}
            href={college.website}
          />
        ) : (
          <ContactLink
            icon={<IconGlobe />}
            label="Official site"
            value="Find official website ↗"
            href={officialSearchHref(college.name, college.district)}
          />
        )}
      </View>

      {/* Shortlist — phase-4 placeholder */}
      <View style={[s.shortlistCard, s.sCardGap]}>
        <Text style={s.shortlistTitle}>Add to shortlist</Text>
        <View style={s.shortlistBtn}>
          <IconBookmark />
          <Text style={s.shortlistBtnText}>Save college</Text>
        </View>
        <Text style={s.shortlistHint}>Sign in to save — coming soon</Text>
      </View>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Pre-render one static HTML page per college at build time, so each of
 * the ~390 colleges is a real crawlable page (not a single empty shell).
 */
export function generateStaticParams(): { id: string }[] {
  return COLLEGES.map((c) => ({ id: c.id }));
}

export default function CollegeDetailScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const college = id ? COLLEGE_BY_ID[id] : undefined;
  const back = backLabel(from);

  // ── Not found ────────────────────────────────────────────────────────────
  if (!college) {
    return (
      <View style={pg.root}>
        <Seo title="College not found" noindex />
        <SiteHeader />
        <ScrollView contentContainerStyle={pg.scroll} showsVerticalScrollIndicator={false}>
          <View style={pg.body}>
            <Text variant="title">College not found</Text>
            <Text muted style={{ marginVertical: spacing.lg }}>
              We couldn&apos;t find that college. It may have been renamed or removed.
            </Text>
            <Button label={back} variant="secondary" onPress={goBack} />
          </View>
          <SiteFooter />
        </ScrollView>
      </View>
    );
  }

  // ── Data derivation ───────────────────────────────────────────────────────
  const { confirmed, courses } = getCoursesForCollege(college);

  // Group courses by category, preserving the college's category order.
  const groups = college.categories
    .map((catId) => {
      const category = CATEGORY_BY_ID[catId];
      if (!category) return null;
      const groupCourses = courses.filter((c) => c.categoryId === catId);
      if (groupCourses.length === 0) return null;
      return { category, courses: groupCourses };
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  // Collect unique entrance exam ids across all courses (cap at 12 pills).
  const examIds = Array.from(new Set(courses.flatMap((c) => c.examIds))).slice(0, 12);
  const exams = examIds.map((eid) => EXAM_BY_ID[eid]).filter(Boolean);

  const paragraphs = aboutParagraphs(college);
  const pq = pullQuote(college);

  const typeLabel = TYPE_LABELS[college.type];
  const eyebrow = `${college.district.toUpperCase()} · ${typeLabel.toUpperCase()} COLLEGE`;

  // Hero pills — skip any that don't have data.
  const heroPills: { label: string; accent?: boolean }[] = [];
  if (college.naacGrade) heroPills.push({ label: `NAAC ${college.naacGrade}` });
  if (college.nirfRank) heroPills.push({ label: `NIRF #${college.nirfRank}` });
  if (college.established) heroPills.push({ label: `Est. ${college.established}` });
  if (college.totalSeats)
    heroPills.push({ label: `~${college.totalSeats.toLocaleString()} seats`, accent: true });

  // Key-facts pills — same data, slightly different phrasing.
  const kfPills: { label: string; value: string }[] = [
    { label: 'District', value: college.district },
    { label: 'Type', value: typeLabel },
  ];
  if (college.naacGrade) kfPills.push({ label: 'Accreditation', value: `NAAC ${college.naacGrade}` });
  if (college.nirfRank) kfPills.push({ label: 'NIRF', value: `#${college.nirfRank}` });
  if (college.established) kfPills.push({ label: 'Est.', value: String(college.established) });
  if (college.totalSeats)
    kfPills.push({ label: 'Seats', value: `~${college.totalSeats.toLocaleString()}` });

  // ── SEO ───────────────────────────────────────────────────────────────────
  const courseCount = courses.length;
  const seoTitle = `${college.name} — courses, admission & contact`;
  const seoDesc = `${college.name} is a ${typeLabel.toLowerCase()} college in ${college.district}, Kerala${
    college.naacGrade ? ` (NAAC ${college.naacGrade})` : ''
  }. Explore ${courseCount > 0 ? `${courseCount} courses` : 'courses'} on offer, entrance exams, and how to apply.`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={pg.root}>
      <Seo
        title={seoTitle}
        description={seoDesc}
        path={`/colleges/${college.id}`}
        type="article"
      />
      <SiteHeader />
      <ScrollView contentContainerStyle={pg.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero — full-bleed sky strip ──────────────────── */}
        <SkyBandHero minHeight={IS_PHONE ? 260 : 320}>
          {/* Breadcrumb */}
          <View style={s.breadcrumb}>
            <Text style={s.breadcrumbLink} onPress={goBack}>
              {from === 'quiz' ? '← Matches' : '← Colleges'}
            </Text>
            <Text style={s.breadcrumbSep}>/</Text>
            <Text style={s.breadcrumbCurrent} numberOfLines={1}>
              {college.name}
            </Text>
          </View>

          {/* Eyebrow chip */}
          <View style={s.eyebrow}>
            <View style={s.eyebrowDot} />
            <Text style={s.eyebrowText}>{eyebrow}</Text>
          </View>

          {/* College name */}
          <Text level={1} style={s.heroName}>{college.name}</Text>

          {/* Accreditation pill row */}
          <View style={s.heroPills}>
            {heroPills.map((p) => (
              <HeroPill key={p.label} label={p.label} accent={p.accent} />
            ))}
          </View>

          {/* Handwritten nudge */}
          <Text style={s.heroNudge}>✈ Take the quiz to see if this matches you</Text>
        </SkyBandHero>

        {/* ── Two-column body ──────────────────────────────── */}
        <View style={[pg.body, IS_NARROW && pg.bodyNarrow]}>

          {/* ── LEFT: narrative column ─────────────────────── */}
          <View style={[s.narrative, IS_NARROW && s.narrativeNarrow]}>

            {/* Key facts pill row */}
            <View style={s.keyFacts}>
              {kfPills.map((p) => (
                <KFPill key={p.label} label={p.label} value={p.value} />
              ))}
            </View>

            {/* ── About ────────────────────────────────────── */}
            <View style={s.section}>
              <EditLabel>About the college</EditLabel>
              <Text style={s.editH2}>{college.name}</Text>
              <Text style={s.editPara}>{paragraphs[0]}</Text>
              {pq ? (
                <View style={s.pullQuote}>
                  <Text style={s.pullQuoteText}>&ldquo;{pq}&rdquo;</Text>
                  <Text style={s.pullQuoteSource}>— Paper Plane profile</Text>
                </View>
              ) : null}
              <Text style={s.editPara}>{paragraphs[1]}</Text>
            </View>

            {/* ── What's on offer ──────────────────────────── */}
            <View style={s.section}>
              <EditLabel>What&apos;s on offer</EditLabel>
              <Text style={s.editH2}>Programmes</Text>

              {!confirmed ? (
                <View style={s.disclaimer}>
                  <Text style={s.disclaimerText}>
                    Exact programmes not confirmed — currently offered across:{' '}
                    {college.categories
                      .map((id) => CATEGORY_BY_ID[id]?.name)
                      .filter(Boolean)
                      .join(', ')}
                    . Courses shown below are typical for each category; check with the
                    college directly.
                  </Text>
                </View>
              ) : null}

              {groups.map(({ category, courses: gc }, i) => (
                <View key={category.id}>
                  {i > 0 ? <View style={s.progDivider} /> : null}
                  <View style={s.progGroup}>
                    <View style={s.progGroupHeader}>
                      <Text style={s.progGroupLabel}>{category.name}</Text>
                      <View style={s.progGroupCount}>
                        <Text style={s.progGroupCountText}>{gc.length} courses</Text>
                      </View>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={s.progScroll}>
                      {gc.map((course) => (
                        <View
                          key={course.id}
                          style={[s.pPill, confirmed && s.pPillConfirmed]}>
                          <Text
                            style={[s.pPillText, confirmed && s.pPillTextConfirmed]}>
                            {course.name}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              ))}

              {confirmed ? (
                <Text style={s.progNote}>
                  Courses shown are confirmed from the college&apos;s published list.
                </Text>
              ) : null}
            </View>

            {/* ── Getting in ───────────────────────────────── */}
            <View style={s.section}>
              <EditLabel>Admissions</EditLabel>
              <Text style={s.editH2}>Getting in</Text>

              <View style={[s.giGrid, IS_PHONE && s.giGridPhone]}>
                <View style={s.giBlock}>
                  <Text style={s.giLabel}>Application window</Text>
                  <Text style={s.giValue}>
                    Typically May – June, via the Kerala CAP portal (hscap.kerala.gov.in).
                    Management quota seats are filled directly by the college.
                  </Text>
                </View>
                <View style={s.giBlock}>
                  <Text style={s.giLabel}>Eligibility</Text>
                  <Text style={s.giValue}>
                    Class 12 pass with relevant stream. Minimum marks vary by programme
                    and quota.
                  </Text>
                </View>
                <View style={[s.giBlock, s.giBlockWide]}>
                  <Text style={s.giLabel}>Entrance exams accepted</Text>
                  <Text style={s.giValue}>
                    Most UG programmes admit on Class 12 merit. Entrance exams apply for
                    professional courses.
                  </Text>
                  <View style={s.giExamPills}>
                    {exams.length > 0 ? (
                      exams.map((exam) => (
                        <View key={exam.id} style={s.giExamPill}>
                          <Text style={s.giExamPillText}>{exam.name}</Text>
                        </View>
                      ))
                    ) : (
                      <View style={s.giExamPill}>
                        <Text style={s.giExamPillText}>Class 12 merit</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* ── Where it is ──────────────────────────────── */}
            <View style={s.section}>
              <EditLabel>Location</EditLabel>
              <Text style={s.editH2}>Where it is</Text>

              {/* Map placeholder */}
              <View style={s.mapPlaceholder}>
                <View style={s.mapIcon}>
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                      stroke="white"
                      strokeWidth={2}
                    />
                    <Circle cx={12} cy={10} r={3} stroke="white" strokeWidth={2} />
                  </Svg>
                </View>
                <Text style={s.mapLabel}>{college.district} — map coming soon</Text>
              </View>

              {/* Address block */}
              <View style={s.addressBlock}>
                <View style={{ paddingTop: 1 }}>
                  <IconPin />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.addressName}>{college.name}</Text>
                  <Text style={s.addressLine}>{college.district} district, Kerala.</Text>
                  {college.website ? (
                    <Text
                      style={s.addressWebsite}
                      onPress={() =>
                        college.website && Linking.openURL(college.website)
                      }>
                      {college.website.replace(/^https?:\/\//, '')} ↗
                    </Text>
                  ) : (
                    <Text
                      style={s.addressWebsite}
                      onPress={() =>
                        Linking.openURL(officialSearchHref(college.name, college.district))
                      }>
                      Find official website ↗
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* ── Closing quiz CTA ─────────────────────────── */}
            <View style={s.quizStrip}>
              <View style={s.quizOrb1} />
              <View style={s.quizOrb2} />
              <View style={s.quizStripLeft}>
                <Text style={s.quizStripTitle}>
                  Does {college.name} fit your picture?
                </Text>
                <Text style={s.quizStripSub}>
                  Answer 6 quick questions — stream, district, college type, goals —
                  and we&apos;ll rank your top colleges and courses in under a minute.
                </Text>
              </View>
              <LinkButton
                href="/quiz"
                label="Take the quiz →"
                variant="secondary"
                size="lg"
                style={s.quizStripBtn}
              />
            </View>

          </View>
          {/* end narrative */}

          {/* ── RIGHT: sticky sidebar (desktop only) ─────── */}
          {!IS_NARROW ? (
            <View style={s.sidebar}>
              <View
                style={
                  Platform.OS === 'web'
                    ? ([
                        s.sidebarInner,
                        { position: 'sticky' as ViewStyle['position'], top: 24 },
                      ] as ViewStyle[])
                    : s.sidebarInner
                }>
                <SidebarCards
                  college={college}
                  typeLabel={typeLabel}
                />
              </View>
            </View>
          ) : null}

        </View>
        {/* end two-column body */}

        {/* ── Mobile sidebar — below narrative on narrow screens ── */}
        {IS_NARROW ? (
          <View style={pg.mobileSidebar}>
            <SidebarCards
              college={college}
              typeLabel={typeLabel}
            />
          </View>
        ) : null}

        {/* Back button footer */}
        <View style={pg.pageFooter}>
          <Button label={back} variant="secondary" onPress={goBack} />
        </View>

        <SiteFooter />
      </ScrollView>
    </View>
  );
}

// ─── Page-level styles ────────────────────────────────────────────────────────

const SIDEBAR_W = 300;

const pg = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    // Don't `alignItems: 'center'` here — that would shrink the hero
    // and the footer to fit the centred body. Instead the body block
    // below sets its own `alignSelf: 'center'` + maxWidth, while hero
    // and footer keep the full ScrollView width.
  },
  /** Centred two-column body below the hero. */
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 48,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.x3l,
    paddingBottom: spacing.x4l,
  },
  bodyNarrow: {
    flexDirection: 'column',
    gap: 0,
    paddingHorizontal: IS_PHONE ? layout.gutterNarrow : layout.gutter,
    paddingTop: spacing.xl,
  },
  mobileSidebar: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    paddingHorizontal: IS_PHONE ? layout.gutterNarrow : layout.gutter,
    paddingBottom: spacing.x2l,
  },
  pageFooter: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    paddingHorizontal: IS_PHONE ? layout.gutterNarrow : layout.gutter,
    paddingBottom: spacing.x2l,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

// ─── Component-level styles ───────────────────────────────────────────────────

const s = StyleSheet.create({
  // ─── Hero content ────────────────────────────────────────────────────────
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  breadcrumbLink: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  breadcrumbSep: {
    fontSize: 13,
    color: colors.textSubtle,
  },
  breadcrumbCurrent: {
    fontSize: 13,
    color: colors.textSubtle,
    flexShrink: 1,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 2,
    color: colors.text,
  },
  heroName: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_PHONE ? 34 : 54,
    lineHeight: IS_PHONE ? 38 : 58,
    letterSpacing: IS_PHONE ? -1.2 : -2,
    color: colors.text,
    maxWidth: 800,
    marginBottom: spacing.xl,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  heroPillAccent: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  heroPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  heroPillText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
  },
  heroNudge: {
    fontFamily: fontFamily.hand,
    fontSize: 22,
    color: colors.skyAnchor,
    marginTop: 4,
  },

  // ─── Narrative column ────────────────────────────────────────────────────
  narrative: {
    flex: 1,
    minWidth: 0,
  },
  narrativeNarrow: {
    flex: undefined,
    width: '100%',
  },

  // Key facts
  keyFacts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 40,
  },
  kfPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
  },
  kfDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.skyMid,
    flexShrink: 0,
  },
  kfText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  kfLabel: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  // Editorial sections
  section: {
    marginBottom: 56,
  },
  editLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  editLabelLine: {
    width: 28,
    height: 2,
    backgroundColor: colors.skyDeep,
    borderRadius: 2,
  },
  editLabelText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    letterSpacing: 2.5,
    color: colors.skyDeep,
  },
  editH2: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_PHONE ? 26 : 34,
    lineHeight: IS_PHONE ? 30 : 38,
    letterSpacing: -1,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  editPara: {
    fontSize: 16,
    lineHeight: 16 * 1.8,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },

  // Pull quote
  pullQuote: {
    marginVertical: 28,
    paddingVertical: 24,
    paddingHorizontal: 28,
    borderLeftWidth: 4,
    borderLeftColor: colors.skyBright,
    backgroundColor: colors.skyPale,
    borderRadius: radius.lg,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  pullQuoteText: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 19,
    lineHeight: 19 * 1.4,
    letterSpacing: -0.3,
    color: colors.text,
    fontStyle: 'italic',
  },
  pullQuoteSource: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSubtle,
  },

  // Disclaimer (unconfirmed courses)
  disclaimer: {
    backgroundColor: colors.skyPale,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 13 * 1.6,
    color: colors.textMuted,
  },

  // Programmes
  progGroup: {
    marginBottom: 4,
  },
  progGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  progGroupLabel: {
    fontFamily: fontFamily.display,
    fontSize: 15,
    color: colors.text,
  },
  progGroupCount: {
    backgroundColor: colors.skyPale,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  progGroupCountText: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  progScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: 6,
  },
  pPill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  pPillConfirmed: {
    borderColor: 'rgba(79, 163, 224, 0.4)',
    backgroundColor: 'rgba(79, 163, 224, 0.05)',
  },
  pPillText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  pPillTextConfirmed: {
    color: colors.skyAnchor,
  },
  progDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  progNote: {
    marginTop: 18,
    fontSize: 13,
    color: colors.textSubtle,
  },

  // Getting in
  giGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  giGridPhone: {
    flexDirection: 'column',
  },
  giBlock: {
    flex: 1,
    minWidth: IS_PHONE ? '100%' : 200,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  giBlockWide: {
    flexBasis: '100%',
    flex: undefined,
  },
  giLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.5,
    color: colors.textSubtle,
    marginBottom: spacing.sm,
  },
  giValue: {
    fontSize: 15,
    lineHeight: 15 * 1.6,
    color: colors.textMuted,
  },
  giExamPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  giExamPill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: colors.skyPale,
    borderWidth: 1,
    borderColor: 'rgba(79, 163, 224, 0.3)',
    borderRadius: radius.pill,
  },
  giExamPillText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.skyAnchor,
  },

  // Where it is
  mapPlaceholder: {
    backgroundColor: colors.skyPale,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  mapIcon: {
    width: 44,
    height: 44,
    backgroundColor: colors.skyDeep,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 4px 8px rgba(45, 125, 210, 0.35)',
    elevation: 4,
  },
  mapLabel: {
    fontSize: 13,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  addressBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  addressName: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  addressWebsite: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 4,
  },

  // Quiz CTA strip
  quizStrip: {
    backgroundColor: colors.skyDeep,
    borderRadius: 24,
    padding: IS_PHONE ? 26 : 36,
    paddingHorizontal: IS_PHONE ? 24 : 40,
    flexDirection: IS_PHONE ? 'column' : 'row',
    alignItems: IS_PHONE ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    gap: 28,
    overflow: 'hidden',
    marginTop: 12,
    position: 'relative',
  },
  quizOrb1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    right: -60,
    top: -80,
    pointerEvents: 'none',
  },
  quizOrb2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    bottom: -40,
    left: '40%',
    pointerEvents: 'none',
  },
  quizStripLeft: {
    flex: 1,
    zIndex: 1,
  },
  quizStripTitle: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: IS_PHONE ? 18 : 22,
    color: colors.textInverse,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  quizStripSub: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255, 255, 255, 0.75)',
    maxWidth: 380,
  },
  quizStripBtn: {
    backgroundColor: colors.background,
    flexShrink: 0,
    zIndex: 1,
  },

  // ─── Sidebar ─────────────────────────────────────────────────────────────
  sidebar: {
    width: SIDEBAR_W,
    flexShrink: 0,
  },
  sidebarInner: {
    gap: 0, // gap handled per-card via sCardGap
  },
  sCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 22,
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 8px 20px rgba(31, 95, 160, 0.08)',
    elevation: 2,
  },
  sCardGap: {
    marginTop: 16,
  },
  sCardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sCardTitleText: {
    fontFamily: fontFamily.display,
    fontSize: 13,
    letterSpacing: 0.2,
    color: colors.text,
  },
  sCardDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.skyBright,
  },
  sRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sRowLabel: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: fontWeight.medium,
  },
  sRowVal: {
    fontSize: 13,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
    maxWidth: '60%',
  },
  sRowValMuted: {
    color: colors.textSubtle,
    fontWeight: fontWeight.regular,
    fontSize: 12,
  },
  sRowBadge: {
    backgroundColor: colors.skyPale,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  sRowBadgeText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.skyAnchor,
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.skyPale,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactLabel: {
    fontSize: 10,
    color: colors.textSubtle,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.8,
  },
  contactValue: {
    fontSize: 13,
    color: colors.textMuted,
  },
  shortlistCard: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.skyPale,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    opacity: 0.75,
  },
  shortlistTitle: {
    fontFamily: fontFamily.display,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  shortlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    marginTop: 4,
  },
  shortlistBtnText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.textSubtle,
  },
  shortlistHint: {
    fontFamily: fontFamily.hand,
    fontSize: 15,
    color: colors.textSubtle,
    marginTop: spacing.sm,
  },
});
