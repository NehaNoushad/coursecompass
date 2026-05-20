import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  CATEGORY_BY_ID,
  COURSE_BY_ID,
  STREAM_LABELS,
  getCollegesForCategory,
  getExamsForCourse,
} from '@/data';
import { colors, spacing } from '@/constants/theme';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CollegeCard } from '@/components/college-card';
import { LinkButton } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';

const COLLEGE_PREVIEW_COUNT = 6;

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = id ? COURSE_BY_ID[id] : undefined;

  if (!course) {
    return (
      <Screen>
        <Text variant="title">Course not found</Text>
        <Text muted style={{ marginVertical: spacing.lg }}>
          We couldn&apos;t find that course.
        </Text>
        <LinkButton href="/courses" label="Back to all courses" variant="secondary" />
      </Screen>
    );
  }

  const category = CATEGORY_BY_ID[course.categoryId];
  const exams = getExamsForCourse(course.id);
  const colleges = getCollegesForCategory(course.categoryId);
  const previewColleges = colleges.slice(0, COLLEGE_PREVIEW_COUNT);
  const remaining = colleges.length - previewColleges.length;

  return (
    <Screen>
      <Text variant="title">{course.name}</Text>
      <View style={styles.badges}>
        {category ? <Badge label={category.name} tone="primary" /> : null}
        <Badge label={`${course.durationYears} years`} />
      </View>

      <Text variant="heading" style={styles.sectionTitle}>
        Who can apply
      </Text>
      <Text muted>
        Open to students from: {course.streams.map((s) => STREAM_LABELS[s]).join(', ')}.
      </Text>

      <Text variant="heading" style={styles.sectionTitle}>
        Entrance exams
      </Text>
      {exams.length === 0 ? (
        <Card muted>
          <Badge label="Direct admission" tone="success" />
          <Text muted style={{ marginTop: spacing.sm }}>
            No entrance exam needed — admission is usually on 12th marks or merit.
          </Text>
        </Card>
      ) : (
        <View style={styles.examList}>
          {exams.map((exam) => (
            <Card key={exam.id}>
              <Text variant="subheading">{exam.name}</Text>
              <Text variant="bodySmall" muted style={{ marginTop: spacing.xs }}>
                {exam.fullName}
              </Text>
              <Text style={{ marginTop: spacing.sm }}>{exam.scope}</Text>
            </Card>
          ))}
        </View>
      )}

      <Text variant="heading" style={styles.sectionTitle}>
        Where to study
      </Text>
      <Text muted style={{ marginBottom: spacing.md }}>
        {colleges.length} colleges in Kerala offer {category?.name ?? 'this'} courses.
      </Text>
      <View style={styles.grid}>
        {previewColleges.map((college) => (
          <View key={college.id} style={styles.cell}>
            <CollegeCard college={college} />
          </View>
        ))}
      </View>
      {remaining > 0 ? (
        <View style={styles.seeAll}>
          <LinkButton
            href={{ pathname: '/colleges', params: { category: course.categoryId } }}
            label={`See all ${colleges.length} colleges`}
          />
        </View>
      ) : null}

      <View style={styles.footer}>
        <LinkButton href="/courses" label="Back to all courses" variant="secondary" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.x2l,
    marginBottom: spacing.sm,
  },
  examList: {
    gap: spacing.md,
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
  },
  seeAll: {
    marginTop: spacing.lg,
  },
  footer: {
    marginTop: spacing.x2l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xl,
  },
});
