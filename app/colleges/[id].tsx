import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  CATEGORY_BY_ID,
  COLLEGE_BY_ID,
  FEE_BAND_LABELS,
  TYPE_LABELS,
  getCoursesForCollege,
} from '@/data';
import { colors, spacing } from '@/constants/theme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CourseCard } from '@/components/course-card';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';

/**
 * Goes back to whatever the user came from — quiz results, the
 * filtered catalogue, search, etc. — rather than hard-navigating to
 * `/colleges` and discarding the previous page's state. Falls back
 * to `/colleges` only when there's no history to go back to (e.g.
 * the user landed on the detail page directly via URL).
 */
function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/colleges');
  }
}

/** Pretty label for the back button based on where the user came from. */
function backLabel(from: string | undefined): string {
  if (from === 'quiz') return '← Back to your matches';
  return '← Back';
}

export default function CollegeDetailScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const college = id ? COLLEGE_BY_ID[id] : undefined;
  const back = backLabel(from);

  if (!college) {
    return (
      <Screen>
        <Text variant="title">College not found</Text>
        <Text muted style={{ marginVertical: spacing.lg }}>
          We couldn&apos;t find that college. It may have been renamed or removed.
        </Text>
        <Button label={back} variant="secondary" onPress={goBack} />
      </Screen>
    );
  }

  const { confirmed, courses } = getCoursesForCollege(college);

  // Group the courses by category, keeping the college's category order.
  const groups = college.categories
    .map((catId) => {
      const category = CATEGORY_BY_ID[catId];
      if (!category) return null;
      const groupCourses = courses.filter((c) => c.categoryId === catId);
      if (groupCourses.length === 0) return null;
      return { category, courses: groupCourses };
    })
    .filter((g) => g !== null);

  return (
    <Screen>
      <Text variant="title">{college.name}</Text>
      <View style={styles.badges}>
        <Badge label={college.district} tone="primary" />
        <Badge label={TYPE_LABELS[college.type]} />
        <Badge label={FEE_BAND_LABELS[college.feeBand]} tone="accent" />
      </View>

      <Card muted style={styles.note}>
        <Text variant="bodySmall" muted>
          Fee band is an indicative guide ({TYPE_LABELS[college.type].toLowerCase()} colleges
          tend to be {FEE_BAND_LABELS[college.feeBand].toLowerCase()}). Check the college
          directly for exact figures.
        </Text>
      </Card>

      <Text variant="heading" style={styles.sectionTitle}>
        {confirmed ? 'Courses offered here' : 'Course fields offered'}
      </Text>

      {!confirmed ? (
        <Card muted style={styles.disclaimer}>
          <Text variant="bodySmall" muted>
            This college offers courses in the fields below. We&apos;re still confirming its
            exact list of programmes — treat these as the typical courses in each field, and
            check with the college directly.
          </Text>
        </Card>
      ) : null}

      {groups.map(({ category, courses: groupCourses }) => (
        <View key={category.id} style={styles.categoryBlock}>
          <Text variant="subheading">{category.name}</Text>
          {!confirmed ? (
            <Text variant="bodySmall" muted style={styles.categoryDesc}>
              {category.description}
            </Text>
          ) : null}
          <View style={styles.grid}>
            {groupCourses.map((course) => (
              <View key={course.id} style={styles.cell}>
                <CourseCard course={course} />
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Button label={back} variant="secondary" onPress={goBack} />
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
  note: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    marginTop: spacing.x2l,
    marginBottom: spacing.md,
  },
  disclaimer: {
    marginBottom: spacing.lg,
    borderColor: colors.accent,
  },
  categoryBlock: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  categoryDesc: {
    marginBottom: spacing.sm,
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
  footer: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xl,
  },
});
