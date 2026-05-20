import { Link, type Href } from 'expo-router';
import { Pressable, type PressableProps, StyleSheet, type ViewStyle } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/text';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

interface BaseProps {
  label: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const BG: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.surfaceAlt,
  ghost: 'transparent',
};

const FG: Record<Variant, string> = {
  primary: colors.textInverse,
  secondary: colors.text,
  ghost: colors.primary,
};

function buttonStyle(variant: Variant, size: Size, fullWidth?: boolean): ViewStyle {
  return {
    backgroundColor: BG[variant],
    paddingVertical: size === 'lg' ? spacing.lg : spacing.md,
    paddingHorizontal: size === 'lg' ? spacing.xl : spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: variant === 'ghost' ? 1 : 0,
    borderColor: colors.border,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  };
}

/** A button that navigates to a route. */
export function LinkButton({
  href,
  label,
  variant = 'primary',
  size = 'md',
  fullWidth,
  style,
}: BaseProps & { href: Href }) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => [
          buttonStyle(variant, size, fullWidth),
          pressed && styles.pressed,
          style,
        ]}>
        <Text
          color={FG[variant]}
          style={{ fontSize: size === 'lg' ? fontSize.md : fontSize.sm, fontWeight: fontWeight.semibold }}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

/** A button that runs an action. */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth,
  style,
  ...rest
}: BaseProps & Omit<PressableProps, 'style'>) {
  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyle(variant, size, fullWidth),
        pressed && styles.pressed,
        style,
      ]}
      {...rest}>
      <Text
        color={FG[variant]}
        style={{ fontSize: size === 'lg' ? fontSize.md : fontSize.sm, fontWeight: fontWeight.semibold }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
});
