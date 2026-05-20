import { ScrollView, StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';
import { Chip } from '@/components/ui/chip';
import { Text } from '@/components/ui/text';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label?: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * A horizontally-scrolling row of single-select chips. `value` is matched
 * against each option; pass an "all" sentinel option to represent no filter.
 */
export function ChipRow<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" muted style={styles.label}>
          {label}
        </Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {options.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            selected={opt.value === value}
            onPress={() => onChange(opt.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
});
