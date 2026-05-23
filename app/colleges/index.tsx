import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { CollegeType, CourseCategoryId, District, FeeBand } from '@/types';
import {
  COLLEGES,
  COURSE_BY_ID,
  COURSE_CATEGORIES,
  DISTRICTS,
  FEE_BAND_LABELS,
  TYPE_LABELS,
  getCollegesForCourse,
} from '@/data';
import { colors, spacing } from '@/constants/theme';
import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CollegeCard } from '@/components/college-card';
import { Dropdown, MultiSelectDropdown, type DropdownOption } from '@/components/ui/dropdown';
import { Screen } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { Text } from '@/components/ui/text';

type CategoryFilter = 'all' | CourseCategoryId;
type TypeFilter = 'all' | CollegeType;
type FeeFilter = 'all' | FeeBand;

const CATEGORY_OPTIONS: DropdownOption<CategoryFilter>[] = [
  { value: 'all', label: 'All courses' },
  ...COURSE_CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
];

const TYPE_OPTIONS: DropdownOption<TypeFilter>[] = [
  { value: 'all', label: 'Any type' },
  { value: 'government', label: TYPE_LABELS.government },
  { value: 'aided', label: TYPE_LABELS.aided },
  { value: 'private', label: TYPE_LABELS.private },
];

const FEE_OPTIONS: DropdownOption<FeeFilter>[] = [
  { value: 'all', label: 'Any fees' },
  { value: 'low', label: FEE_BAND_LABELS.low },
  { value: 'medium', label: FEE_BAND_LABELS.medium },
  { value: 'high', label: FEE_BAND_LABELS.high },
];

const DISTRICT_OPTIONS: DropdownOption<District>[] = DISTRICTS.map((d) => ({
  value: d,
  label: d,
}));

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
  // Districts is multi-select. URL `?district=` is honoured as a single
  // initial pick; the user can add more on the page.
  const initialDistricts: District[] = DISTRICTS.includes(params.district as District)
    ? [params.district as District]
    : [];

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [type, setType] = useState<TypeFilter>('all');
  const [fee, setFee] = useState<FeeFilter>('all');

  const results = useMemo(() => {
    const base = courseParam ? getCollegesForCourse(courseParam) : COLLEGES;
    const q = search.trim().toLowerCase();
    return base.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (category !== 'all' && !c.categories.includes(category)) return false;
      if (districts.length > 0 && !districts.includes(c.district)) return false;
      if (type !== 'all' && c.type !== type) return false;
      if (fee !== 'all' && c.feeBand !== fee) return false;
      return true;
    });
  }, [search, category, districts, type, fee, courseParam]);

  function toggleDistrict(d: District) {
    setDistricts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  function resetFilters() {
    setSearch('');
    setCategory('all');
    setDistricts([]);
    setType('all');
    setFee('all');
  }

  return (
    <Screen>
      <Text variant="title">Browse colleges</Text>
      <Text muted style={styles.intro}>
        {COLLEGES.length} colleges across Kerala. Filter by course, district, type and fees.
      </Text>

      {activeCourse ? (
        <Card muted style={styles.courseBanner}>
          <Text variant="label" color={colors.primary}>
            SHOWING COLLEGES THAT OFFER
          </Text>
          <Text variant="subheading" style={{ marginTop: spacing.xs }}>
            {activeCourse.name}
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <LinkButton href="/colleges" label="Browse all colleges instead" variant="secondary" />
          </View>
        </Card>
      ) : null}

      <View style={styles.filters}>
        <TextInput
          label="Search by name"
          placeholder="e.g. Government Engineering College"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        <View style={styles.dropdownRow}>
          <Dropdown
            label="Course"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
          />
          <MultiSelectDropdown
            label="District"
            options={DISTRICT_OPTIONS}
            selected={districts}
            onToggle={toggleDistrict}
            onClear={() => setDistricts([])}
            allLabel="All districts"
            pluralNoun="districts"
          />
          <Dropdown
            label="Type"
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
          />
          <Dropdown
            label="Fees"
            options={FEE_OPTIONS}
            value={fee}
            onChange={setFee}
          />
        </View>
      </View>

      <Text variant="label" muted style={styles.count}>
        {results.length} {results.length === 1 ? 'result' : 'results'}
      </Text>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="subheading">No colleges match these filters</Text>
          <Text muted style={{ marginVertical: spacing.md }}>
            Try removing a filter or searching a different name.
          </Text>
          <Button label="Clear all filters" variant="secondary" onPress={resetFilters} />
        </View>
      ) : (
        <View style={styles.grid}>
          {results.map((college) => (
            <View key={college.id} style={styles.cell}>
              <CollegeCard college={college} />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginTop: spacing.sm,
  },
  courseBanner: {
    marginTop: spacing.lg,
    borderColor: colors.primary,
  },
  filters: {
    gap: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  dropdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    // When a dropdown panel opens it needs to paint above the college
    // grid below. `position: 'relative'` is required for zIndex to take
    // effect — without it, zIndex on a non-positioned element is
    // silently ignored and the cards below paint over the panel.
    position: 'relative',
    zIndex: 100,
  },
  count: {
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cell: {
    flexGrow: 1,
    flexBasis: 320,
    maxWidth: 540,
  },
  empty: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.x2l,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
  },
});
