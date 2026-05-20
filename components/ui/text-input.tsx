import { useState } from 'react';
import { StyleSheet, TextInput as RNTextInput, type TextInputProps, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/text';

interface Props extends TextInputProps {
  label?: string;
}

/** A labelled text field. */
export function TextInput({ label, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" muted>
          {label}
        </Text>
      ) : null}
      <RNTextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, focused && styles.focused, style]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  focused: {
    borderColor: colors.primary,
  },
});
