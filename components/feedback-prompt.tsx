/**
 * Feedback prompt — a soft bottom banner that appears after the visitor
 * has had the site open for an hour, nudging them to share feedback.
 * Mounted once in the root layout. Shows at most once per browser
 * session (a sessionStorage flag), and never again once dismissed or
 * acted on.
 *
 * "More than 1hr of use" is measured as wall-clock time since the page
 * loaded — a single timer that fires once. Good enough for a gentle
 * nudge; we deliberately don't track active vs idle time.
 */

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { LinkButton } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { colors, layout, radius, spacing } from '@/constants/theme';

const ONE_HOUR_MS = 60 * 60 * 1000;
const SESSION_KEY = 'pp_feedback_prompt_shown';

export function FeedbackPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Already shown this session → don't queue it again.
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // sessionStorage can throw in private modes — just proceed.
    }
    const t = setTimeout(() => setShow(true), ONE_HOUR_MS);
    return () => clearTimeout(t);
  }, []);

  function close() {
    setShow(false);
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }
  }

  if (!show) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.inner}>
        <View style={styles.card}>
          <View style={styles.text}>
            <Text variant="subheading">Been exploring for a while?</Text>
            <Text variant="bodySmall" muted>
              We&apos;d love to hear what&apos;s working and what isn&apos;t — it
              genuinely shapes this prototype.
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={close} style={styles.dismiss}>
              <Text style={styles.dismissText}>Not now</Text>
            </Pressable>
            <LinkButton href="/feedback" label="Give feedback" variant="primary" />
          </View>
          <Pressable onPress={close} style={styles.close} accessibilityLabel="Dismiss">
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 90,
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    pointerEvents: 'auto',
  },
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    paddingRight: spacing.x2l,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 10px 30px rgba(13, 40, 64, 0.16)',
    elevation: 10,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 260,
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dismiss: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dismissText: {
    fontSize: 14,
    color: colors.textSubtle,
    fontWeight: '500',
  },
  close: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: colors.textSubtle,
    fontSize: 16,
  },
});
