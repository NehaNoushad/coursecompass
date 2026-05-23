import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Course } from '@/types';
import { CATEGORY_BY_ID, STREAM_LABELS } from '@/data';
import { colors, radius, spacing } from '@/constants/theme';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

export function CourseCard({ course }: { course: Course }) {
  const category = CATEGORY_BY_ID[course.categoryId];
  const examCount = course.examIds.length;

  // NOTE: `<Link asChild>` clones onto an <a> on web and drops function-
  // and array-styles on the inner Pressable, leaving the card unstyled.
  // Pass a single object. See ui/button.tsx for the same fix.
  return (
    <Link href={`/courses/${course.id}`} asChild>
      <Pressable style={styles.card}>
        <Text variant="subheading" numberOfLines={2}>
          {course.name}
        </Text>
        <View style={styles.badges}>
          {category ? <Badge label={category.name} tone="primary" /> : null}
          <Badge label={`${course.durationYears} years`} />
          <Badge
            label={examCount > 0 ? `${examCount} entrance exam${examCount > 1 ? 's' : ''}` : 'Direct admission'}
            tone={examCount > 0 ? 'neutral' : 'success'}
          />
        </View>
        <Text variant="bodySmall" muted>
          Open to: {course.streams.map((s) => STREAM_LABELS[s]).join(', ')}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
