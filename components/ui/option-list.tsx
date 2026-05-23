import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/text';

export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SingleProps<T extends string> {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
}

interface MultiProps<T extends string> {
  options: Option<T>[];
  selected: T[];
  onToggle: (value: T) => void;
}

/** A vertical list of large, single-select option rows. */
export function OptionList<T extends string>({ options, value, onChange }: SingleProps<T>) {
  return (
    <View style={styles.list}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.row,
              selected && styles.rowSelected,
              pressed && styles.pressed,
            ]}>
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.radioDot} /> : null}
            </View>
            <View style={styles.text}>
              <Text variant="subheading">{opt.label}</Text>
              {opt.description ? (
                <Text variant="bodySmall" muted style={{ marginTop: 2 }}>
                  {opt.description}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Multi-select variant. Same visual style as OptionList but renders
 * a rounded-square checkbox affordance instead of a radio circle to
 * signal that more than one is allowed.
 */
export function MultiOptionList<T extends string>({
  options,
  selected,
  onToggle,
}: MultiProps<T>) {
  return (
    <View style={styles.list}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <Pressable
            key={opt.value}
            onPress={() => onToggle(opt.value)}
            style={({ pressed }) => [
              styles.row,
              isSelected && styles.rowSelected,
              pressed && styles.pressed,
            ]}>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <View style={styles.text}>
              <Text variant="subheading">{opt.label}</Text>
              {opt.description ? (
                <Text variant="bodySmall" muted style={{ marginTop: 2 }}>
                  {opt.description}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pressed: {
    opacity: 0.85,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 13,
  },
  text: {
    flex: 1,
  },
});
