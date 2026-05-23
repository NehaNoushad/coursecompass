import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button, LinkButton } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { APP_NAME } from '@/constants/app';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';
import { useAuth } from '@/lib/auth';

const NAV_LINKS = [
  { label: 'Colleges', href: '/colleges' as const },
  { label: 'Courses', href: '/courses' as const },
  { label: 'Quiz', href: '/quiz' as const },
];

/**
 * Top navigation bar — paper-plane circle mark + Sora wordmark + nav
 * links + auth controls + "Take the quiz" CTA on the right.
 *
 * Auth controls depend on session state:
 *   - signed out → "Sign in" link
 *   - signed in  → "Sign out" link (and we surface the email on hover
 *                   via the title attribute on web)
 */
export function SiteHeader() {
  const { session, signOut } = useAuth();

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Link href="/" asChild>
          <Pressable style={styles.brand}>
            <View style={styles.mark}>
              <LinearGradient
                colors={[colors.skyBright, colors.skyDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.markIcon}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    stroke="white"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>
            <Text style={styles.brandName}>{APP_NAME}</Text>
          </Pressable>
        </Link>

        <View style={styles.right}>
          <View style={styles.nav}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} asChild>
                <Pressable style={styles.navItem}>
                  <Text style={styles.navLink}>{link.label}</Text>
                </Pressable>
              </Link>
            ))}
          </View>

          {session ? (
            <Button
              label="Sign out"
              variant="ghost"
              onPress={signOut}
              style={styles.authBtn}
            />
          ) : (
            <LinkButton
              href="/signin"
              label="Sign in"
              variant="ghost"
              style={styles.authBtn}
            />
          )}

          <LinkButton href="/quiz" label="Take the quiz" />
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
    gap: spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // Paper-plane brand mark. The gradient is rendered via LinearGradient
  // absoluteFill so the circle clip + the multi-stop gradient combine
  // cleanly (single-colour backgroundColor won't give the sky-bright →
  // sky-deep wash the prototype calls for).
  mark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // Soft shadow matching the prototype.
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  markIcon: {
    // zIndex so the SVG paints above the absolutely-positioned gradient
    // sibling (same RN-web stacking gotcha we hit in sky-features).
    zIndex: 1,
  },
  brandName: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.4,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  nav: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  navLink: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  authBtn: {
    // Tighter padding than the default ghost button so the bar stays compact.
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 0,
  },
});
