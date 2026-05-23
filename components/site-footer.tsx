/**
 * Site footer — dark navy slab with the brand mark, the three primary
 * nav links, and a small "built in Kerala" + copyright line at the
 * bottom. Mirrors the SiteHeader's brand treatment in negative.
 *
 * Mounted by `components/ui/screen.tsx` (so every page that wraps in
 * `<Screen>` gets it for free) and once explicitly in `app/index.tsx`
 * after the SkyFinal section (the home page doesn't use Screen).
 */

import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { APP_NAME } from '@/constants/app';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  spacing,
} from '@/constants/theme';
import { Text } from '@/components/ui/text';

const LINKS = [
  { label: 'Colleges', href: '/colleges' as const },
  { label: 'Courses', href: '/courses' as const },
  { label: 'Quiz', href: '/quiz' as const },
] as const;

export function SiteFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.inner}>
        <View style={styles.top}>
          <Link href="/" asChild>
            <Pressable style={styles.brand}>
              <View style={styles.mark}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    stroke="white"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={styles.brandName}>{APP_NAME}</Text>
            </Pressable>
          </Link>
          <View style={styles.linkRow}>
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} asChild>
                <Pressable style={styles.linkPressable}>
                  <Text style={styles.linkText}>{link.label}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottom}>
          <Text style={styles.bottomText}>
            Built in Kerala for Class 12 students.
          </Text>
          <Text style={styles.bottomText}>© 2026 {APP_NAME}.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    // alignSelf:'stretch' so the dark slab spans the full width of its
    // parent even when the parent (Screen's ScrollView) uses
    // alignItems:'center' to centre the inner content column.
    alignSelf: 'stretch',
    backgroundColor: colors.text,
    paddingVertical: spacing.x2l,
    paddingHorizontal: spacing.xl,
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fontFamily.display,
    fontSize: 15,
    color: colors.textInverse,
    letterSpacing: -0.2,
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.x2l,
  },
  linkPressable: {
    paddingVertical: spacing.xs,
  },
  linkText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
    fontWeight: fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: spacing.lg,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bottomText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
  },
});
