import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, layout, spacing } from '@/constants/theme';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

interface Props {
  children: ReactNode;
  /** Hide the top navigation bar. */
  noHeader?: boolean;
  /** Hide the footer. */
  noFooter?: boolean;
  /** Background colour of the scroll area. */
  background?: string;
  contentStyle?: ViewStyle;
}

/**
 * Page wrapper. Scrolls vertically, centres content within a max width
 * on wide screens, and renders the SiteFooter at the bottom. Both the
 * header and footer can be opted out of per-page if a page wants to
 * draw its own (the home page does).
 */
export function Screen({
  children,
  noHeader,
  noFooter,
  background,
  contentStyle,
}: Props) {
  return (
    <View style={[styles.root, { backgroundColor: background ?? colors.background }]}>
      {!noHeader && <SiteHeader />}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.inner, contentStyle]}>{children}</View>
        {!noFooter && <SiteFooter />}
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
