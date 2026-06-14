/**
 * /feedback — a single form where anyone can send a complaint, a
 * recommendation, or general feedback. Submissions go to the Supabase
 * `feedback` table (SQL in docs/supabase-setup.sql); if that table
 * doesn't exist yet the form fails gracefully and points the user at
 * email instead, so it's never a dead end.
 *
 * Draws its own SiteHeader / ScrollView / SiteFooter (like the other
 * full-bleed pages) rather than using <Screen>.
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SkyBandHero } from '@/components/sky-band-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type FeedbackType = 'feedback' | 'recommendation' | 'complaint';

const TYPES: { value: FeedbackType; label: string; hint: string }[] = [
  { value: 'feedback', label: 'General feedback', hint: 'Anything on your mind about the site.' },
  { value: 'recommendation', label: 'Recommendation', hint: 'An idea, a college we missed, a feature you want.' },
  { value: 'complaint', label: 'Complaint', hint: 'Something wrong, broken, or misleading.' },
];

// Where to reach us if the database isn't wired up yet.
const FALLBACK_EMAIL = 'noussssh@gmail.com';

export default function FeedbackScreen() {
  const { user } = useAuth();

  const [type, setType] = useState<FeedbackType>('feedback');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = message.trim().length >= 3 && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const { error: insErr } = await supabase.from('feedback').insert({
      type,
      message: message.trim(),
      name: name.trim() || null,
      email: email.trim() || null,
      user_id: user?.id ?? null,
    });

    setSubmitting(false);

    if (insErr) {
      // Table missing / RLS / network — don't lose the user's words.
      if (/relation .* does not exist/i.test(insErr.message)) {
        setError(
          `Our feedback inbox isn't fully set up yet. Please email it to ${FALLBACK_EMAIL} — sorry about that!`,
        );
      } else {
        setError(`Couldn't send that (${insErr.message}). You can also email ${FALLBACK_EMAIL}.`);
      }
      return;
    }
    setDone(true);
  }

  return (
    <View style={styles.root}>
      <SiteHeader />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SkyBandHero minHeight={220}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>WE&apos;RE LISTENING</Text>
          </View>
          <Text style={styles.heroTitle}>Tell us what you think</Text>
          <Text style={styles.heroSub}>
            Complaints, recommendations, or just feedback — it all helps us make this
            more useful. This is an early prototype, so your input genuinely shapes it.
          </Text>
        </SkyBandHero>

        <View style={styles.body}>
          {done ? (
            <View style={styles.card}>
              <Text style={styles.thanksEmoji}>🙏</Text>
              <Text variant="title" center style={{ marginBottom: spacing.sm }}>
                Thank you!
              </Text>
              <Text variant="body" muted center style={{ maxWidth: 420 }}>
                Your {TYPES.find((t) => t.value === type)?.label.toLowerCase()} has reached
                us. We read every message — thank you for helping us improve.
              </Text>
              <View style={{ marginTop: spacing.xl }}>
                <Button
                  label="Send another"
                  variant="secondary"
                  onPress={() => {
                    setDone(false);
                    setMessage('');
                  }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              {/* Type selector */}
              <Text style={styles.fieldLabel}>What kind of message is this?</Text>
              <View style={styles.typeRow}>
                {TYPES.map((t) => {
                  const on = type === t.value;
                  return (
                    <Pressable
                      key={t.value}
                      onPress={() => setType(t.value)}
                      style={[styles.typeChip, on && styles.typeChipOn]}>
                      <Text style={[styles.typeChipText, on && styles.typeChipTextOn]}>
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.typeHint}>{TYPES.find((t) => t.value === type)?.hint}</Text>

              {/* Message */}
              <View style={styles.field}>
                <TextInput
                  label="Your message"
                  placeholder="Tell us as much as you like…"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  style={styles.textarea}
                />
              </View>

              {/* Name + email (optional) */}
              <View style={styles.field}>
                <TextInput
                  label="Your name (optional)"
                  placeholder="So we know who to thank"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.field}>
                <TextInput
                  label="Email (optional)"
                  placeholder="If you'd like a reply"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={{ marginTop: spacing.lg }}>
                <Button
                  label={submitting ? 'Sending…' : 'Send feedback'}
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={submit}
                  disabled={!canSubmit}
                  style={!canSubmit ? { opacity: 0.5 } : undefined}
                />
                <Text style={styles.privacyNote}>
                  We only use your email to reply, if you leave one. Nothing is shared.
                </Text>
              </View>
            </View>
          )}
        </View>

        <SiteFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },

  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  eyebrowText: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.xs,
    letterSpacing: 2,
    color: colors.text,
  },
  heroTitle: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: 34,
    letterSpacing: -1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  heroSub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: fontSize.sm * 1.6,
    maxWidth: 540,
  },

  body: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: layout.gutterNarrow,
    paddingTop: spacing.x2l,
    paddingBottom: spacing.x3l,
  },
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.x2l,
    alignItems: 'stretch',
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 8px 28px rgba(31, 95, 160, 0.10)',
    elevation: 3,
  },
  fieldLabel: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  typeChipOn: {
    borderColor: colors.skyDeep,
    backgroundColor: colors.skyDeep,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  typeChipTextOn: { color: colors.textInverse },
  typeHint: {
    fontSize: fontSize.xs,
    color: colors.textSubtle,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  field: { marginBottom: spacing.lg },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: fontSize.sm * 1.5,
  },
  privacyNote: {
    fontSize: fontSize.xs,
    color: colors.textSubtle,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  thanksEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
