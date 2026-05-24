/**
 * Sign in / sign up screen. One screen handles both — Supabase email
 * OTP doesn't distinguish between "new user" and "returning user" at
 * the API level; if the email exists we sign them in, if it doesn't
 * we create the account.
 *
 * The flow uses the magic-link side of signInWithOtp:
 *   1. User enters email → "Send sign-in link"
 *   2. Page shows "Check your email" confirmation
 *   3. User clicks the link in their inbox
 *   4. The link redirects to redirectTo with #access_token=... in the URL
 *   5. supabase-js detectSessionInUrl parses the hash → creates session
 *   6. AuthProvider's onAuthStateChange picks it up; user is logged in
 *
 * Why magic link instead of typed OTP code: simpler UX (one click vs
 * copy-paste), one fewer state machine step, and we avoid the OTP
 * verifyOtp() type-mismatch dance.
 */

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

type Step = 'email' | 'sent';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink() {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError("That doesn't look like a valid email.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // shouldCreateUser:true means the same call works for both new
        // and returning users — no separate signup endpoint. The link
        // in the email redirects here on click; supabase-js
        // detectSessionInUrl picks up the tokens from the URL hash.
        shouldCreateUser: true,
        emailRedirectTo:
          Platform.OS === 'web' && typeof window !== 'undefined'
            ? window.location.origin
            : undefined,
      },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep('sent');
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

  return (
    <Screen noFooter>
      <View style={styles.frame}>
        <Card style={styles.card}>
          <Text variant="title">
            {step === 'email' ? `Sign in to ${APP_NAME}` : 'Check your email'}
          </Text>
          <Text muted style={styles.sub}>
            {step === 'email'
              ? "We'll send a one-click sign-in link. No password to remember."
              : `We sent a sign-in link to ${email}. Click the link in the email — you'll be signed in instantly.`}
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
                onSubmitEditing={sendLink}
                returnKeyType="send"
                style={styles.input}
              />
              <Button
                label={busy ? 'Sending…' : 'Send sign-in link →'}
                onPress={sendLink}
                disabled={busy}
                fullWidth
                size="lg"
                style={busy ? styles.disabled : undefined}
              />
            </>
          ) : (
            <>
              <Text variant="bodySmall" muted style={styles.tip}>
                Don&apos;t see it? Check your spam folder. The link expires in
                an hour — if it does, come back and request a fresh one.
              </Text>
              <Button
                label="← Use a different email"
                variant="ghost"
                onPress={() => {
                  setStep('email');
                  setError(null);
                }}
                style={styles.secondary}
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
  tip: {
    paddingVertical: spacing.sm,
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
