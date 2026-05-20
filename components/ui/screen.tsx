import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, layout, spacing } from '@/constants/theme';
import { SiteHeader } from '@/components/site-header';

interface Props {
  children: ReactNode;
  /** Hide the top navigation bar. */
  noHeader?: boolean;
  /** Background colour of the scroll area. */
  background?: string;
  contentStyle?: ViewStyle;
}

/**
 * Page wrapper. Scrolls vertically and centres content within a max width
 * on wide screens so the layout doesn't stretch on desktop.
 */
export function Screen({ children, noHeader, background, contentStyle }: Props) {
  return (
    <View style={[styles.root, { backgroundColor: background ?? colors.background }]}>
      {!noHeader && <SiteHeader />}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.inner, contentStyle]}>{children}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.x2l,
  },
});
