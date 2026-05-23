/**
 * Sign in / sign up screen. One screen handles both — Supabase email
 * OTP doesn't distinguish between "new user" and "returning user" at
 * the API level; if the email exists we sign them in, if it doesn't
 * we create the account. From the user's perspective: type email,
 * receive a 6-digit code, type it in, you're in.
 *
 * Two steps managed by local state:
 *   - 'email' → field for the email + "Send code" button
 *   - 'otp'   → field for the 6-digit code + "Verify" button
 *
 * After successful verify, the AuthProvider's onAuthStateChange fires
 * and `router.replace('/')` sends them home with a session live.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { Text } from '@/components/ui/text';
import { APP_NAME } from '@/constants/app';
import { colors, spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type Step = 'email' | 'otp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError("That doesn't look like a valid email.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // We want the OTP code flow, not the magic-link flow. Setting
        // shouldCreateUser:true means the same call works for both
        // new and returning users — no separate signup endpoint.
        shouldCreateUser: true,
      },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep('otp');
  }

  async function verifyCode() {
    setError(null);
    const cleaned = code.replace(/\s/g, '');
    if (!/^\d{6}$/.test(cleaned)) {
      setError('The code should be 6 digits.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: cleaned,
      type: 'email',
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    // AuthProvider's onAuthStateChange will fire — send them home.
    router.replace('/');
  }

  return (
    <Screen>
      <View style={styles.frame}>
        <Card style={styles.card}>
          <Text variant="title">
            {step === 'email' ? `Sign in to ${APP_NAME}` : 'Check your email'}
          </Text>
          <Text muted style={styles.sub}>
            {step === 'email'
              ? "We'll send a 6-digit code. No password to remember."
              : `We sent a 6-digit code to ${email}. It might take a minute.`}
          </Text>

          {step === 'email' ? (
            <>
              <TextInput
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                editable={!busy}
                onSubmitEditing={sendCode}
                returnKeyType="send"
                style={styles.input}
              />
              <Button
                label={busy ? 'Sending…' : 'Send code →'}
                onPress={sendCode}
                disabled={busy}
                fullWidth
                size="lg"
                style={busy ? styles.disabled : undefined}
              />
            </>
          ) : (
            <>
              <TextInput
                label="6-digit code"
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!busy}
                onSubmitEditing={verifyCode}
                returnKeyType="done"
                style={styles.input}
              />
              <Button
                label={busy ? 'Verifying…' : 'Verify and continue →'}
                onPress={verifyCode}
                disabled={busy}
                fullWidth
                size="lg"
                style={busy ? styles.disabled : undefined}
              />
              <Button
                label="← Use a different email"
                variant="ghost"
                onPress={() => {
                  setStep('email');
                  setCode('');
                  setError(null);
                }}
                style={styles.secondary}
                disabled={busy}
              />
            </>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text variant="bodySmall" color={colors.danger}>
                {error}
              </Text>
            </View>
          ) : null}

          <Text variant="caption" muted style={styles.legal}>
            By continuing, you agree we may email you account-related
            updates. We won&apos;t sell or share your address.
          </Text>
        </Card>

        <View style={styles.cancel}>
          <LinkButton href="/" label="← Back home" variant="ghost" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 460,
    paddingVertical: spacing.x2l,
  },
  card: {
    gap: spacing.lg,
  },
  sub: {
    marginTop: -spacing.sm,
  },
  input: {
    marginTop: spacing.xs,
  },
  disabled: {
    opacity: 0.6,
  },
  secondary: {
    marginTop: spacing.xs,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: spacing.md,
  },
  legal: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  cancel: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
});
