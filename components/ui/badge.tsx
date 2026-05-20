import { StyleSheet, View } from 'react-native';

import { colors, fontWeight, radius, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/text';

type Tone = 'neutral' | 'primary' | 'accent' | 'success';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
  primary: { bg: colors.primaryLight, fg: colors.primaryDark },
  accent: { bg: '#FEF3C7', fg: colors.accentDark },
  success: { bg: '#DCFCE7', fg: colors.success },
};

interface Props {
  label: string;
  tone?: Tone;
}

/** A small, non-interactive status label. */
export function Badge({ label, tone = 'neutral' }: Props) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text variant="caption" color={t.fg} style={{ fontWeight: fontWeight.semibold }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
});
