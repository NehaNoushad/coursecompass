/**
 * Browse-gate overlay — renders the nudge banner and the firm signup modal
 * on top of every page, driven by `useBrowseGate()`.
 *
 *   state === 'free'   → renders nothing
 *   state === 'nudge'  → soft banner pinned to the bottom of the viewport,
 *                        dismissable via "Not now"
 *   state === 'firm'   → blocking full-screen modal with backdrop
 *
 * Signup buttons are stubs for now — they'll route to `/signup` once those
 * screens exist (Phase 3 Step 4). Until then `onSignupPress` is a no-op the
 * parent can swap in.
 */

import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { APP_NAME } from '@/constants/app';
import { colors, fontSize, layout, radius, spacing } from '@/constants/theme';
import { useBrowseGate } from '@/lib/browse-gate';

interface Props {
  /** Called when the user taps "Sign up". Stub until signup screens land. */
  onSignupPress?: () => void;
  /** Called when the user taps "Log in" on the firm modal. */
  onLoginPress?: () => void;
}

export function BrowseGateOverlay({ onSignupPress, onLoginPress }: Props) {
  const { state, dismissNudge, claimFirmGrace, firmGraceClaimed } = useBrowseGate();

  if (state === 'free') return null;

  if (state === 'nudge') {
    return (
      <View style={styles.nudgeWrap} pointerEvents="box-none">
        <View style={styles.nudgeInner} pointerEvents="auto">
          <Card style={styles.nudgeCard}>
            <View style={styles.nudgeRow}>
              <View style={styles.nudgeText}>
                <Text variant="subheading">Enjoying {APP_NAME}?</Text>
                <Text variant="bodySmall" muted>
                  Create a free account to save shortlists and keep browsing.
                </Text>
              </View>
              <View style={styles.nudgeActions}>
                <Button
                  label="Not now"
                  variant="ghost"
                  onPress={dismissNudge}
                />
                <Button
                  label="Sign up free"
                  variant="primary"
                  onPress={onSignupPress}
                />
              </View>
            </View>
          </Card>
        </View>
      </View>
    );
  }

  // state === 'firm'
  // The ✕ close button only appears the first time firm fires — claimFirmGrace()
  // spends the one-time grace, hiding the modal for FIRM_GRACE_MS of active
  // time. On its second appearance there's no escape but signup.
  return (
    <View style={styles.firmWrap} pointerEvents="auto">
      <View style={styles.backdrop} />
      <View style={styles.firmInner}>
        <Card style={styles.firmCard}>
          {!firmGraceClaimed ? (
            <Pressable
              style={styles.closeButton}
              onPress={claimFirmGrace}
              accessibilityRole="button"
              accessibilityLabel="Close — give me a couple more minutes">
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          ) : null}
          <Text variant="title" center>
            Create a free account to keep going
          </Text>
          <Text
            variant="body"
            muted
            center
            style={{ marginTop: spacing.md }}>
            You&apos;ve been browsing for a while. Sign up to save your progress,
            shortlist colleges, and take the recommendation quiz.
          </Text>

          <View style={styles.firmActions}>
            <Button
              label="Sign up free"
              variant="primary"
              size="lg"
              fullWidth
              onPress={onSignupPress}
            />
            <Button
              label="I already have an account"
              variant="ghost"
              size="lg"
              fullWidth
              onPress={onLoginPress}
            />
          </View>

          <Text
            variant="caption"
            muted
            center
            style={{ marginTop: spacing.lg }}>
            No payment required. Always free to browse and take the quiz.
          </Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Nudge — sticks to the bottom, lets the rest of the page stay interactive.
  nudgeWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    padding: spacing.lg,
  },
  nudgeInner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
  },
  nudgeCard: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    padding: spacing.lg,
  },
  nudgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  nudgeText: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 240,
    gap: spacing.xs,
  },
  nudgeActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },

  // Firm — full-screen blocking modal.
  firmWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  firmInner: {
    width: '100%',
    maxWidth: 460,
  },
  firmCard: {
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.x2l,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16,
    // `position: relative` so the absolute-positioned ✕ anchors to the card.
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
  firmActions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
});
