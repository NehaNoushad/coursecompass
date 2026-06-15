/**
 * /colleges — editorial-layout catalogue port of prototype 6.
 *
 * The earlier version was a linear top-to-bottom utility: title →
 * search → 4 dropdowns → result list. This version reframes the page
 * as an editorial spread:
 *
 *   1. Full-bleed sky-gradient hero band at the top (count + handwritten
 *      pointer to the quiz as an alternative).
 *   2. Two-column body with a sticky filter panel on the left and a
 *      magazine-style result grid on the right. On narrow screens the
 *      sidebar collapses above the results.
 *   3. SiteFooter at the bottom.
 *
 * Because the hero needs to span the full width while the body needs
 * to stay inside the 1120px content max, this page does NOT use
 * `<Screen>` — it draws its own SiteHeader / ScrollView / SiteFooter
 * trio, the same way the home page does.
 */

import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import type { CollegeType, CourseCategoryId, District } from '@/types';
import {
  COLLEGES,
  COURSE_BY_ID,
  COURSE_CATEGORIES,
  DISTRICTS,
  TYPE_LABELS,
  getCollegesForCourse,
} from '@/data';
import { LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CollegesHero } from '@/components/colleges-hero';
import { CollegesMagazineCard } from '@/components/colleges-magazine-card';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Seo } from '@/components/seo';
import { Text } from '@/components/ui/text';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';

const IS_NARROW = Dimensions.get('window').width < 980;

type CategoryFilter = 'all' | CourseCategoryId;
type TypeFilter = 'all' | CollegeType;

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All courses' },
  ...COURSE_CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Any type' },
  { value: 'government', label: TYPE_LABELS.government },
  { value: 'aided', label: TYPE_LABELS.aided },
  { value: 'private', label: TYPE_LABELS.private },
];

export default function CollegesScreen() {
  const params = useLocalSearchParams<{
    category?: string;
    district?: string;
    course?: string;
  }>();

  // A `?course=` param restricts the catalogue to colleges offering that course.
  const courseParam =
    params.course && COURSE_BY_ID[params.course] ? params.course : undefined;
  const activeCourse = courseParam ? COURSE_BY_ID[courseParam] : undefined;

  const initialCategory: CategoryFilter = CATEGORY_OPTIONS.some(
    (o) => o.value === params.category,
  )
    ? (params.category as CategoryFilter)
    : 'all';
  const initialDistricts: District[] = DISTRICTS.includes(params.district as District)
    ? [params.district as District]
    : [];

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [type, setType] = useState<TypeFilter>('all');

  // Counts per category — shown next to each row so users can see how
  // much each filter would narrow the list before clicking.
  const categoryCounts = useMemo(() => {
    const base = courseParam ? getCollegesForCourse(courseParam) : COLLEGES;
    const counts: Partial<Record<CategoryFilter, number>> = { all: base.length };
    for (const c of base) {
      for (const cat of c.categories) {
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
    }
    return counts;
  }, [courseParam]);

  const results = useMemo(() => {
    const base = courseParam ? getCollegesForCourse(courseParam) : COLLEGES;
    const q = search.trim().toLowerCase();
    return base.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (category !== 'all' && !c.categories.includes(category)) return false;
      if (districts.length > 0 && !districts.includes(c.district)) return false;
      if (type !== 'all' && c.type !== type) return false;
      return true;
    });
  }, [search, category, districts, type, courseParam]);

  function toggleDistrict(d: District) {
    setDistricts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  function clearAll() {
    setSearch('');
    setCategory('all');
    setDistricts([]);
    setType('all');
  }

  const anyFilterActive =
    !!search ||
    category !== 'all' ||
    districts.length > 0 ||
    type !== 'all';

  return (
    <View style={styles.root}>
      <Seo
        title="Browse colleges in Kerala — by district, course & type"
        description="Explore 390+ Kerala colleges — government, aided and private — filtered by district, course and type. Find what each offers and how to apply."
        path="/colleges"
      />
      <SiteHeader />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <CollegesHero
          eyebrow="EVERY KERALA COLLEGE, IN ONE PLACE"
          prefix="Browse"
          count={COLLEGES.length}
          suffix="colleges."
          sub="Filter by district, course and type."
          handAccent="or take the quiz →"
        />

        <View style={styles.layout}>
          {activeCourse ? (
            <Card muted style={styles.courseBanner}>
              <Text variant="label" color={colors.primary}>
                SHOWING COLLEGES THAT OFFER
              </Text>
              <Text variant="subheading" style={{ marginTop: spacing.xs }}>
                {activeCourse.name}
              </Text>
              <View style={{ marginTop: spacing.md }}>
                <LinkButton
                  href="/colleges"
                  label="Browse all colleges instead"
                  variant="secondary"
                />
              </View>
            </Card>
          ) : null}

          <View style={styles.twoCol}>
            {/* ─── Sticky sidebar (filters) ─── */}
            <View style={styles.sidebarWrap}>
              {/* On desktop the panel is pinned (sticky) AND capped to the
                  viewport height with its own scroll, so it travels with the
                  college list and every filter — including District/Type at
                  the bottom — stays reachable without scrolling the page. */}
              <View
                style={[
                  styles.sidebar,
                  !IS_NARROW &&
                    ({
                      maxHeight: 'calc(100vh - 48px)',
                      overflow: 'auto',
                      scrollbarWidth: 'thin',
                    } as unknown as ViewStyle),
                ]}>
                <View style={styles.sidebarHead}>
                  <Text style={styles.sidebarTitle}>Filters</Text>
                  {anyFilterActive ? (
                    <Pressable onPress={clearAll}>
                      <Text style={styles.sidebarClear}>Clear</Text>
                    </Pressable>
                  ) : null}
                </View>

                <input
                  // RN doesn't have a styled <input> with the right native chrome on web,
                  // and `TextInput`'s focus ring conflicts with the sidebar's compact look.
                  // Using a raw <input> on web (this page is web-only for now) gives us full
                  // control. On native this branch would need a TextInput swap.
                  className="cl-search"
                  placeholder="Search by name…"
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />

                <FilterSection label="Course category">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <FilterRow
                      key={opt.value}
                      label={opt.label}
                      pill={String(categoryCounts[opt.value] ?? 0)}
                      active={category === opt.value}
                      onPress={() => setCategory(opt.value)}
                    />
                  ))}
                </FilterSection>

                <FilterSection label="District" hint="pick any">
                  <View style={styles.chipRow}>
                    {DISTRICTS.map((d) => {
                      const active = districts.includes(d);
                      return (
                        <Pressable
                          key={d}
                          onPress={() => toggleDistrict(d)}
                          style={[styles.chip, active && styles.chipActive]}>
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>
                            {d}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </FilterSection>

                <FilterSection label="Type">
                  {TYPE_OPTIONS.map((opt) => (
                    <FilterRow
                      key={opt.value}
                      label={opt.label}
                      active={type === opt.value}
                      onPress={() => setType(opt.value)}
                    />
                  ))}
                  <Text style={styles.filterNote}>
                    Government / aided / private is the honest cost signal — what
                    you actually pay also depends on your seat type (merit /
                    management / NRI) and any scholarships.
                  </Text>
                </FilterSection>
              </View>
            </View>

            {/* ─── Results grid ─── */}
            <View style={styles.results}>
              <View style={styles.resultsHead}>
                <Text style={styles.resultsCount}>
                  <Text style={styles.resultsCountAccent}>{results.length}</Text>
                  {' '}
                  {results.length === 1 ? 'college' : 'colleges'}
                </Text>
                <Text style={styles.resultsHint}>
                  {anyFilterActive ? ' — matching your filters' : ' — across Kerala'}
                </Text>
              </View>

              {results.length === 0 ? (
                <View style={styles.empty}>
                  <Text variant="subheading">No colleges match these filters</Text>
                  <Text muted style={{ marginVertical: spacing.md }}>
                    Try removing a filter or searching a different name.
                  </Text>
                  <Pressable onPress={clearAll} style={styles.emptyBtn}>
                    <Text style={styles.emptyBtnText}>Clear all filters</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.grid}>
                  {results.map((college) => (
                    <View key={college.id} style={styles.cell}>
                      <CollegesMagazineCard college={college} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        <SiteFooter />

        {/* Inline CSS for the raw <input>. Cheap web-only style scope. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .cl-search {
                width: 100%;
                height: 42px;
                padding: 0 14px;
                border: 1px solid ${colors.border};
                border-radius: 12px;
                background: ${colors.surface};
                font-family: inherit;
                font-size: 14px;
                color: ${colors.text};
                outline: none;
                margin-bottom: 24px;
                box-sizing: border-box;
                transition: border-color 0.15s, background 0.15s;
              }
              .cl-search::placeholder { color: ${colors.textSubtle}; }
              .cl-search:focus {
                border-color: ${colors.primary};
                background: ${colors.background};
              }
            `,
          }}
        />
      </ScrollView>
    </View>
  );
}

// ───────── Sidebar filter section ─────────

function FilterSection({
  label,
  hint,
  badge,
  children,
}: {
  label: string;
  hint?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.filterSection}>
      <View style={styles.filterLabel}>
        <Text style={styles.filterLabelText}>{label.toUpperCase()}</Text>
        {badge ? (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{badge}</Text>
          </View>
        ) : null}
        {hint ? <Text style={styles.filterHint}>{hint}</Text> : null}
      </View>
      <View>{children}</View>
    </View>
  );
}

// ───────── Sidebar filter row (radio-style) ─────────

function FilterRow({
  label,
  pill,
  active,
  onPress,
}: {
  label: string;
  pill?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterRow, active && styles.filterRowActive]}>
      <View style={[styles.filterDot, active && styles.filterDotActive]} />
      <Text style={[styles.filterRowLabel, active && styles.filterRowLabelActive]}>
        {label}
      </Text>
      {pill ? (
        <View style={[styles.filterRowPill, active && styles.filterRowPillActive]}>
          <Text style={[styles.filterRowPillText, active && styles.filterRowPillTextActive]}>
            {pill}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
  },

  // ─── Layout shell ───
  layout: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: IS_NARROW ? layout.gutterNarrow : layout.gutter,
    paddingTop: IS_NARROW ? spacing.xl : 0,
    // Negative top margin so the layout floats over the hero's fade —
    // stitches the band into the rest of the page rather than reading
    // as a hero + a separate body.
    marginTop: IS_NARROW ? 0 : -spacing.x2l,
    paddingBottom: spacing.x4l,
  },
  courseBanner: {
    marginBottom: spacing.xl,
    borderColor: colors.primary,
  },

  twoCol: {
    flexDirection: IS_NARROW ? 'column' : 'row',
    gap: spacing.x2l,
  },

  // ─── Sidebar ───
  sidebarWrap: {
    width: IS_NARROW ? '100%' : 280,
    flexShrink: 0,
    // Sticky on web; ignored on native. `as ViewStyle` cast because
    // RN's typings don't include 'sticky' but RN-web supports it.
    ...((!IS_NARROW
      ? { position: 'sticky' as ViewStyle['position'], top: 24, alignSelf: 'flex-start' }
      : {}) as ViewStyle),
  },
  sidebar: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 12px 24px rgba(31, 95, 160, 0.12)',
    elevation: 4,
  },
  sidebarHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },
  sidebarTitle: {
    fontFamily: fontFamily.display,
    fontSize: 17,
    letterSpacing: -0.3,
    color: colors.text,
  },
  sidebarClear: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: fontWeight.semibold,
  },

  // ─── Filter section ───
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterLabelText: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textSubtle,
  },
  filterBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    color: colors.textSubtle,
    letterSpacing: 0.3,
  },
  filterHint: {
    fontSize: 11,
    color: colors.textSubtle,
    fontStyle: 'italic',
  },
  filterNote: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.sm,
    padding: spacing.sm,
    paddingLeft: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },

  // ─── Filter row (radio) ───
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  filterRowActive: {
    backgroundColor: colors.skyPale,
  },
  filterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.textSubtle,
  },
  filterDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    // Inset white ring to mimic a filled radio. RN doesn't support
    // inset box-shadow on native, so fake it with a small inner View
    // via borderColor/Width trick? Simpler: rely on filled colour +
    // small size delta — visually distinct enough.
  },
  filterRowLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
  },
  filterRowLabelActive: {
    color: colors.primaryDark,
    fontWeight: fontWeight.semibold,
  },
  filterRowPill: {
    paddingVertical: 1,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  filterRowPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  filterRowPillText: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  filterRowPillTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },

  // ─── District chip row ───
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
  },

  // ─── Results pane ───
  results: {
    flex: 1,
    minWidth: 0,
  },
  resultsHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  resultsCount: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    letterSpacing: -0.3,
    color: colors.text,
  },
  resultsCountAccent: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    letterSpacing: -0.3,
    color: colors.primary,
  },
  resultsHint: {
    fontSize: 14,
    color: colors.textSubtle,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  cell: {
    flexGrow: 1,
    flexBasis: 320,
    maxWidth: 520,
  },

  empty: {
    padding: spacing.x3l,
    alignItems: 'flex-start',
    backgroundColor: colors.skyPale,
    borderRadius: radius.xl,
  },
  emptyBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  emptyBtnText: {
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
    fontSize: 14,
  },
});
