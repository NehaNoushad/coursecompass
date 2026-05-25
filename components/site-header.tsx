import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Dimensions, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { LinkButton } from '@/components/ui/button';
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
];

// One-shot snapshot at module load. The header needs the narrow
// breakpoint earlier than the hero (its right-hand block hits 406px
// of intrinsic width — fitting two text links + Sign in + CTA next
// to the brand mark forces the page wider than the viewport on phones).
// 640 is the shared "phone vs everything else" line for the mobile
// pass; bumping past it gets you the desktop header back.
const IS_NARROW = Dimensions.get('window').width < 640;

/**
 * Small clickable avatar — replaces the "Account" text link when the
 * user is signed in. Renders the Google profile picture when available
 * (Supabase stores it as user_metadata.avatar_url after Google OAuth),
 * falling back to an initial-letter circle that matches the home-page
 * brand mark's geometry.
 */
function HeaderAvatar() {
  const { user } = useAuth();
  if (!user) return null;
  const email = user.email ?? '';
  const initial = (email[0] ?? '?').toUpperCase();
  const photo =
    typeof user.user_metadata?.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata?.picture === 'string'
        ? user.user_metadata.picture
        : null;
  return (
    <Link href="/account" asChild>
      <Pressable style={styles.avatarWrap} accessibilityLabel="Account">
        {photo ? (
          <View
            style={StyleSheet.flatten([
              styles.avatar,
              {
                backgroundImage: `url(${photo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } as ViewStyle,
            ])}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

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
  const { session, hasTakenQuiz } = useAuth();

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
          {/* Nav links hide on narrow — the footer and home-page CTAs
              cover catalogue navigation, and a hamburger menu lands
              with the catalogue redesign. */}
          {!IS_NARROW ? (
            <View style={styles.nav}>
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} asChild>
                  <Pressable style={styles.navItem}>
                    <Text style={styles.navLink}>{link.label}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          ) : null}

          {session ? (
            <HeaderAvatar />
          ) : (
            // Plain Pressable + Text so the baseline matches the nav-item
            // pressables next to it. A LinkButton wraps padding + font-size
            // math differently and ends up shifted ~2px upward against the
            // grey nav links.
            <Link href="/signin" asChild>
              <Pressable style={styles.navItem}>
                <Text style={[styles.navLink, styles.signinLink]}>Sign in</Text>
              </Pressable>
            </Link>
          )}

          {/* Hide the quiz CTA once the signed-in user has taken it —
              the dashboard's "Retake" action takes over from here.
              On narrow we shrink the label to "Quiz →" so the button
              fits next to the brand mark + auth control. */}
          {!hasTakenQuiz ? (
            <LinkButton
              href="/quiz"
              label={IS_NARROW ? 'Quiz →' : 'Take the quiz'}
            />
          ) : null}
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
    // Tighter horizontal padding + outer gap on phones; the brand mark,
    // auth control and quiz CTA are otherwise pushed off the right edge.
    paddingHorizontal: IS_NARROW ? spacing.lg : spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: IS_NARROW ? spacing.md : spacing.lg,
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
    // Narrow: tighter gap because the row has fewer items.
    gap: IS_NARROW ? spacing.md : spacing.xl,
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
  signinLink: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  // Header avatar — sits where the "Account" text link used to.
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    // Soft border so the photo doesn't blend into a white header.
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    backgroundColor: colors.primary,
  },
  avatarInitial: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: 16,
    color: colors.textInverse,
    lineHeight: 16,
  },
});
