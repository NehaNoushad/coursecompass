import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { CourseCategoryId, Stream } from '@/types';
import { COURSES, COURSE_CATEGORIES, EXAMS, STREAM_LABELS } from '@/data';
import { colors, spacing } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/course-card';
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown';
import { Screen } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { Text } from '@/components/ui/text';

type CategoryFilter = 'all' | CourseCategoryId;
type StreamFilter = 'all' | Stream;
type ExamFilter = 'all' | string;

const CATEGORY_OPTIONS: DropdownOption<CategoryFilter>[] = [
  { value: 'all', label: 'All categories' },
  ...COURSE_CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
];

const STREAM_OPTIONS: DropdownOption<StreamFilter>[] = [
  { value: 'all', label: 'Any stream' },
  { value: 'pcm', label: STREAM_LABELS.pcm },
  { value: 'pcb', label: STREAM_LABELS.pcb },
  { value: 'commerce', label: STREAM_LABELS.commerce },
  { value: 'arts', label: STREAM_LABELS.arts },
];

const EXAM_OPTIONS: DropdownOption<ExamFilter>[] = [
  { value: 'all', label: 'Any exam' },
  ...EXAMS.map((e) => ({ value: e.id, label: e.name })),
];

export default function CoursesScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [stream, setStream] = useState<StreamFilter>('all');
  const [exam, setExam] = useState<ExamFilter>('all');

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (category !== 'all' && c.categoryId !== category) return false;
      if (stream !== 'all' && !c.streams.includes(stream)) return false;
      if (exam !== 'all' && !c.examIds.includes(exam)) return false;
      return true;
    });
  }, [search, category, stream, exam]);

  function resetFilters() {
    setSearch('');
    setCategory('all');
    setStream('all');
    setExam('all');
  }

  return (
    <Screen>
      <Text variant="title">Browse courses</Text>
      <Text muted style={styles.intro}>
        {COURSES.length} courses you can take after 12th. Filter by category and your stream.
      </Text>

      <View style={styles.filters}>
        <TextInput
          label="Search by name"
          placeholder="e.g. B.Tech Computer Science"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        <View style={styles.dropdownRow}>
          <Dropdown
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
          />
          <Dropdown
            label="Your stream"
            options={STREAM_OPTIONS}
            value={stream}
            onChange={setStream}
          />
          <Dropdown
            label="Entrance exam"
            options={EXAM_OPTIONS}
            value={exam}
            onChange={setExam}
          />
        </View>
      </View>

      <Text variant="label" muted style={styles.count}>
        {results.length} {results.length === 1 ? 'result' : 'results'}
      </Text>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="subheading">No courses match these filters</Text>
          <Text muted style={{ marginVertical: spacing.md }}>
            Try removing a filter or searching a different name.
          </Text>
          <Button label="Clear all filters" variant="secondary" onPress={resetFilters} />
        </View>
      ) : (
        <View style={styles.grid}>
          {results.map((course) => (
            <View key={course.id} style={styles.cell}>
              <CourseCard course={course} />
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
  dropdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
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
