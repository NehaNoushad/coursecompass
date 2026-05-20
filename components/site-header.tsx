import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { APP_NAME } from '@/constants/app';
import { colors, fontWeight, layout, radius, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/text';

const NAV_LINKS = [
  { label: 'Colleges', href: '/colleges' as const },
  { label: 'Courses', href: '/courses' as const },
  { label: 'Quiz', href: '/quiz' as const },
];

/** Top navigation bar shown on every page. */
export function SiteHeader() {
  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Link href="/" asChild>
          <Pressable style={styles.brand}>
            <View style={styles.mark}>
              <Text color={colors.textInverse} style={styles.markText}>
                C
              </Text>
            </View>
            <Text variant="subheading">{APP_NAME}</Text>
          </Pressable>
        </Link>

        <View style={styles.nav}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} asChild>
              <Pressable style={styles.navItem}>
                <Text variant="label" muted>
                  {link.label}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    fontWeight: fontWeight.bold,
    fontSize: 18,
  },
  nav: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
});
