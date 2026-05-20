import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { CollegeType, CourseCategoryId, District, FeeBand } from '@/types';
import {
  COLLEGES,
  COURSE_CATEGORIES,
  DISTRICTS,
  FEE_BAND_LABELS,
  TYPE_LABELS,
} from '@/data';
import { colors, spacing } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { ChipRow, type ChipOption } from '@/components/ui/chip-row';
import { CollegeCard } from '@/components/college-card';
import { Screen } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { Text } from '@/components/ui/text';

type CategoryFilter = 'all' | CourseCategoryId;
type DistrictFilter = 'all' | District;
type TypeFilter = 'all' | CollegeType;
type FeeFilter = 'all' | FeeBand;

const CATEGORY_OPTIONS: ChipOption<CategoryFilter>[] = [
  { value: 'all', label: 'All courses' },
  ...COURSE_CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
];

const DISTRICT_OPTIONS: ChipOption<DistrictFilter>[] = [
  { value: 'all', label: 'All districts' },
  ...DISTRICTS.map((d) => ({ value: d, label: d })),
];

const TYPE_OPTIONS: ChipOption<TypeFilter>[] = [
  { value: 'all', label: 'Any type' },
  { value: 'government', label: TYPE_LABELS.government },
  { value: 'aided', label: TYPE_LABELS.aided },
  { value: 'private', label: TYPE_LABELS.private },
];

const FEE_OPTIONS: ChipOption<FeeFilter>[] = [
  { value: 'all', label: 'Any fees' },
  { value: 'low', label: FEE_BAND_LABELS.low },
  { value: 'medium', label: FEE_BAND_LABELS.medium },
  { value: 'high', label: FEE_BAND_LABELS.high },
];

export default function CollegesScreen() {
  const params = useLocalSearchParams<{ category?: string; district?: string }>();

  const initialCategory: CategoryFilter = CATEGORY_OPTIONS.some(
    (o) => o.value === params.category,
  )
    ? (params.category as CategoryFilter)
    : 'all';
  const initialDistrict: DistrictFilter = DISTRICT_OPTIONS.some(
    (o) => o.value === params.district,
  )
    ? (params.district as DistrictFilter)
    : 'all';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [district, setDistrict] = useState<DistrictFilter>(initialDistrict);
  const [type, setType] = useState<TypeFilter>('all');
  const [fee, setFee] = useState<FeeFilter>('all');

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COLLEGES.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (category !== 'all' && !c.categories.includes(category)) return false;
      if (district !== 'all' && c.district !== district) return false;
      if (type !== 'all' && c.type !== type) return false;
      if (fee !== 'all' && c.feeBand !== fee) return false;
      return true;
    });
  }, [search, category, district, type, fee]);

  function resetFilters() {
    setSearch('');
    setCategory('all');
    setDistrict('all');
    setType('all');
    setFee('all');
  }

  return (
    <Screen>
      <Text variant="title">Browse colleges</Text>
      <Text muted style={styles.intro}>
        {COLLEGES.length} colleges across Kerala. Filter by course, district, type and fees.
      </Text>

      <View style={styles.filters}>
        <TextInput
          label="Search by name"
          placeholder="e.g. Government Engineering College"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        <ChipRow label="Course" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
        <ChipRow label="District" options={DISTRICT_OPTIONS} value={district} onChange={setDistrict} />
        <ChipRow label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
        <ChipRow label="Fees" options={FEE_OPTIONS} value={fee} onChange={setFee} />
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
  filters: {
    gap: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
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
