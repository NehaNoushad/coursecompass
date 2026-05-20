import { Pressable, StyleSheet } from 'react-native';

import { colors, fontWeight, radius, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/text';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/** A pill-shaped, optionally-selectable tag. */
export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && onPress && styles.pressed,
      ]}>
      <Text
        variant="bodySmall"
        color={selected ? colors.textInverse : colors.text}
        style={{ fontWeight: fontWeight.medium }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
});
