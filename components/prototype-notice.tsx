/**
 * Prototype notice — a one-look disclaimer modal shown on top of every
 * page when the site first loads. It lives in the root layout, which
 * mounts once per full page load, so the notice appears every time the
 * site is opened or refreshed but does NOT nag on in-app navigation.
 *
 * Plain-language on purpose: the audience is Class 12 students and
 * parents, so it says what "prototype" means for them — the data can be
 * wrong, double-check the important stuff — without jargon.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { APP_NAME } from '@/constants/app';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';

export function PrototypeNotice() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.backdrop} />
      <View style={styles.inner}>
        <View style={styles.card}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>

          {/* Paper-plane brand mark */}
          <View style={styles.mark}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke={colors.textInverse}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={styles.eyebrow}>EARLY PREVIEW</Text>
          <Text variant="title" center style={styles.title}>
            Heads up — this is a prototype
          </Text>

          <Text variant="body" muted center style={styles.body}>
            {APP_NAME} is an early version we&apos;re still building. The college,
            course, exam and fee details here can be incomplete, out of date, or
            sometimes just wrong.
          </Text>
          <Text variant="body" muted center style={styles.bodyLast}>
            Please use it as a starting point — and always double-check anything
            important, like deadlines, fees and eligibility, on the official
            college or exam website before you rely on it.
          </Text>

          <View style={styles.actions}>
            <Button
              label="Got it — let me explore"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => setVisible(false)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    pointerEvents: 'auto',
    zIndex: 100,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  inner: {
    width: '100%',
    maxWidth: 460,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.x2l,
    alignItems: 'center',
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.25)',
    elevation: 16,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: colors.textMuted,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl,
    fontWeight: '500',
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.skyDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 6px 18px rgba(31, 95, 160, 0.30)',
    elevation: 6,
  },
  eyebrow: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentDark,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.md,
  },
  body: {
    marginBottom: spacing.md,
    maxWidth: 380,
  },
  bodyLast: {
    maxWidth: 380,
  },
  actions: {
    marginTop: spacing.xl,
    width: '100%',
  },
});
