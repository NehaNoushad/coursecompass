import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
  /** Use the subtle grey surface instead of white. */
  muted?: boolean;
}

/** A bordered content container. */
export function Card({ children, style, muted }: Props) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: muted ? colors.surface : colors.background },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
});
