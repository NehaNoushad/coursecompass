/**
 * Sky stats — the home page's proof-strip below the hero. Four big
 * numbers in sky-pale cards on a paper background, matching prototype 4.
 *
 * The numbers themselves use a solid `skyDeep` colour because RN doesn't
 * have native gradient text the way CSS does. A gradient version via
 * react-native-svg `<Text>` is on the polish list but not blocking.
 */

import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';

const STATS = [
  { num: '382', label: 'Colleges' },
  { num: '176', label: 'Courses' },
  { num: '37',  label: 'Entrance exams' },
  { num: '6',   label: 'Quiz questions' },
];

export function SkyStats() {
  return (
    <View style={styles.section}>
      <View style={styles.row}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.card}>
            <Text style={styles.num}>{stat.num}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.background,
    paddingVertical: spacing.x4l,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  row: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: colors.skyPale,
    borderRadius: radius.xl,
    paddingVertical: spacing.x2l,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  num: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: 80,
    lineHeight: 80,
    color: colors.primary,
    letterSpacing: -3,
  },
  label: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: spacing.md,
  },
});
