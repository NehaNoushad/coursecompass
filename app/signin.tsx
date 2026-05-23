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
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { Text } from '@/components/ui/text';
import { APP_NAME } from '@/constants/app';
import { colors, fontFamily, fontWeight, radius, spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

/** Standard 4-colour Google "G" mark, rendered inline so we don't need a font. */
function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <Path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <Path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <Path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </Svg>
  );
}

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

  async function signInWithGoogle() {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // After Google redirects back to Supabase, Supabase redirects
        // here. On web we want to land on the home page with the
        // session live; AuthProvider's onAuthStateChange will fire.
        redirectTo:
          Platform.OS === 'web' && typeof window !== 'undefined'
            ? window.location.origin
            : undefined,
      },
    });
    // On web, signInWithOAuth navigates the browser to Google — control
    // doesn't return until the user is redirected back. Only set busy
    // back to false if it actually errored before redirecting.
    if (error) {
      setBusy(false);
      setError(error.message);
    }
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
              {/* Google goes first — one-click, no inbox check. */}
              <Pressable
                onPress={signInWithGoogle}
                disabled={busy}
                style={({ pressed }) => [
                  styles.googleBtn,
                  pressed && styles.googlePressed,
                  busy && styles.disabled,
                ]}
              >
                <GoogleMark size={20} />
                <Text style={styles.googleLabel}>Continue with Google</Text>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or with email</Text>
                <View style={styles.dividerLine} />
              </View>

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
  // Google button — white background with a thin border, matches the
  // standard Google-brand-style sign-in button most users recognise.
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  googlePressed: {
    backgroundColor: colors.surface,
  },
  googleLabel: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 15,
    color: colors.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
