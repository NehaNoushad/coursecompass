import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { College } from '@/types';
import { CATEGORY_BY_ID, FEE_BAND_LABELS, TYPE_LABELS } from '@/data';
import { colors, radius, spacing } from '@/constants/theme';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

const MAX_CATEGORIES = 3;

export function CollegeCard({ college }: { college: College }) {
  const categoryNames = college.categories
    .map((id) => CATEGORY_BY_ID[id]?.name)
    .filter(Boolean);
  const shown = categoryNames.slice(0, MAX_CATEGORIES);
  const extra = categoryNames.length - shown.length;

  // NOTE: `<Link asChild>` clones onto an <a> on web and drops function-
  // and array-styles on the inner Pressable, leaving the card unstyled
  // (no border, no padding, no radius). Pass a single object so the
  // styles actually reach the DOM. See ui/button.tsx for the same fix.
  return (
    <Link href={`/colleges/${college.id}`} asChild>
      <Pressable style={styles.card}>
        <Text variant="subheading" numberOfLines={2}>
          {college.name}
        </Text>
        <View style={styles.badges}>
          <Badge label={college.district} tone="primary" />
          <Badge label={TYPE_LABELS[college.type]} />
          <Badge label={FEE_BAND_LABELS[college.feeBand]} tone="accent" />
        </View>
        <Text variant="bodySmall" muted>
          {shown.join(' · ')}
          {extra > 0 ? ` · +${extra} more` : ''}
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
