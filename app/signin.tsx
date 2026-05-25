/**
 * Sign in / sign up screen — "Hatch" visual (Bprototype.html).
 *
 * Full-screen sky background with a real gradient (sky-pale → mid-blue →
 * sky-bright → mid-blue → sky-pale), a warm sun-glow radial in the
 * upper-right, 6 white cloud puffs, a distant paper-plane silhouette,
 * and a single floating white card centred on screen.
 *
 * Auth logic preserved from the original signin.tsx:
 *   - Magic-link flow via supabase.auth.signInWithOtp
 *   - Google OAuth via supabase.auth.signInWithOAuth
 *   - State machine: 'email' → 'sent' (with Resend + cooldown)
 */

import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

import { APP_NAME } from '@/constants/app';

import { Cloud } from '@/components/cloud';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import {
  colors,
  fontFamily,
  fontWeight,
  radius,
  spacing,
} from '@/constants/theme';
import { supabase } from '@/lib/supabase';

// ─── Layout breakpoint ────────────────────────────────────────────────────────
const IS_NARROW = Dimensions.get('window').width < 640;

// ─── Resend cooldown (seconds) ────────────────────────────────────────────────
const RESEND_COOLDOWN = 30;

// ─── Small inline helpers ─────────────────────────────────────────────────────

/** Standard 4-colour Google "G" mark. */
function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

/** Paper-plane brand mark (circle with plane icon). */
function CardMark() {
  return (
    <View style={styles.cardMark}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
          stroke="white"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

/** Small paper plane for the "Send the link" button interior. */
function ButtonPlane() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Distant paper-plane silhouette drifting in the sky background. */
function BackgroundPlane({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Polygon
        points="10,40 70,15 60,45"
        fill="white"
        stroke="rgba(13,40,64,0.25)"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <Polygon
        points="60,45 40,55 70,15"
        fill="#B8DCEF"
        stroke="rgba(13,40,64,0.25)"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Animated envelope icon for the "sent" confirmation state. */
function EnvelopeIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
      <Path
        d="M2 7h26a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H2a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3z"
        fill="rgba(255,255,255,0.2)"
        stroke="white"
        strokeWidth={1.8}
      />
      <Path
        d="M2 7l13 10 13-10"
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'email' | 'sent';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function SignInScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startResendCooldown() {
    setResendCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function sendLink() {
    setError(null);
    setEmailError(false);
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(true);
      setError("That doesn't look like a valid email.");
      return;
    }
    setBusy(true);
    const { error: supaErr } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo:
          Platform.OS === 'web' && typeof window !== 'undefined'
            ? window.location.origin
            : undefined,
      },
    });
    setBusy(false);
    if (supaErr) {
      setError(supaErr.message);
      return;
    }
    setStep('sent');
    startResendCooldown();
  }

  async function signInWithGoogle() {
    setError(null);
    setBusy(true);
    const { error: supaErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:
          Platform.OS === 'web' && typeof window !== 'undefined'
            ? window.location.origin
            : undefined,
      },
    });
    if (supaErr) {
      setBusy(false);
      setError(supaErr.message);
    }
  }

  async function resend() {
    if (resendCooldown > 0 || busy) return;
    setBusy(true);
    const { error: supaErr } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo:
          Platform.OS === 'web' && typeof window !== 'undefined'
            ? window.location.origin
            : undefined,
      },
    });
    setBusy(false);
    if (supaErr) {
      setError(supaErr.message);
    } else {
      startResendCooldown();
    }
  }

  // ─── Cloud positions ───────────────────────────────────────────────────────
  // On narrow screens we hide mid-left, mid-right, top-right, bottom-left
  // (same rule as prototype's @media max-width: 980px).

  return (
    // Full-screen sky — no Screen wrapper here; we draw everything ourselves.
    <View style={styles.root}>
      {/* ── Sky gradient background ── */}
      <LinearGradient
        colors={[
          colors.skyPale,
          '#b8dcef',
          colors.skyBright,
          '#b8dcef',
          colors.skyPale,
        ]}
        locations={[0, 0.22, 0.5, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Sun glow — upper right (simulate radial with a diagonal gradient) ── */}
      <LinearGradient
        colors={[
          'rgba(255,217,100,0.32)',
          'rgba(255,217,100,0.10)',
          'rgba(255,217,100,0)',
        ]}
        locations={[0, 0.4, 0.85]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.6 }}
        style={styles.sunGlow}
      />

      {/* ── Cloud TL — always visible ── */}
      <View
        style={[
          styles.bgCloud,
          styles.cloudTL,
          IS_NARROW && styles.cloudTLNarrow,
        ]}>
        <Cloud size={IS_NARROW ? 220 : 360} />
      </View>

      {/* ── Cloud TR — hidden on narrow ── */}
      {!IS_NARROW && (
        <View style={[styles.bgCloud, styles.cloudTR]}>
          <Cloud size={200} />
        </View>
      )}

      {/* ── Cloud mid-left — hidden on narrow ── */}
      {!IS_NARROW && (
        <View style={[styles.bgCloud, styles.cloudMidL]}>
          <Cloud size={280} />
        </View>
      )}

      {/* ── Cloud mid-right — hidden on narrow ── */}
      {!IS_NARROW && (
        <View style={[styles.bgCloud, styles.cloudMidR]}>
          <Cloud size={240} />
        </View>
      )}

      {/* ── Cloud BR — always visible ── */}
      <View
        style={[
          styles.bgCloud,
          styles.cloudBR,
          IS_NARROW && styles.cloudBRNarrow,
        ]}>
        <Cloud size={IS_NARROW ? 240 : 320} />
      </View>

      {/* ── Cloud BL — hidden on narrow ── */}
      {!IS_NARROW && (
        <View style={[styles.bgCloud, styles.cloudBL]}>
          <Cloud size={200} />
        </View>
      )}

      {/* ── Distant paper plane ── */}
      <View
        style={[styles.bgPlane, IS_NARROW && styles.bgPlaneNarrow]}>
        <BackgroundPlane size={IS_NARROW ? 40 : 64} />
      </View>

      {/* ── Scrollable page (centres the card vertically) ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* ── Card header: brand mark + headline ── */}
          <View style={styles.cardHead}>
            <CardMark />
            <Text style={styles.cardTitle}>{APP_NAME === 'Paper Plane' ? 'Sign in' : `Sign in to ${APP_NAME}`}</Text>
          </View>

          {/* ── Handwritten tagline ── */}
          <Text style={styles.tagline}>drop your email below ↓</Text>

          {step === 'email' ? (
            <>
              {/* ── Google button ── */}
              <Pressable
                onPress={signInWithGoogle}
                disabled={busy}
                style={({ pressed }) => [
                  styles.googleBtn,
                  pressed && styles.googlePressed,
                  busy && styles.dimmed,
                ]}>
                <GoogleMark size={20} />
                <Text style={styles.googleLabel}>Continue with Google</Text>
              </Pressable>

              {/* ── OR divider ── */}
              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              {/* ── Email input ── */}
              <View style={styles.fieldWrap}>
                <TextInput
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    if (emailError) setEmailError(false);
                    if (error) setError(null);
                  }}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  editable={!busy}
                  onSubmitEditing={sendLink}
                  returnKeyType="send"
                  style={emailError ? styles.inputError : undefined}
                />
              </View>

              {/* ── Error message ── */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* ── Send the link button (coral) ── */}
              <Pressable
                onPress={sendLink}
                disabled={busy}
                style={({ pressed }) => [
                  styles.sendBtn,
                  pressed && styles.sendBtnPressed,
                  busy && styles.dimmed,
                ]}>
                <Text style={styles.sendBtnLabel}>
                  {busy ? 'Sending…' : 'Send the link'}
                </Text>
                {!busy && (
                  <View style={styles.sendBtnPlane}>
                    <ButtonPlane />
                  </View>
                )}
              </Pressable>

              {/* ── Card footer: legal + back home ── */}
              <View style={styles.cardFooter}>
                <Text style={styles.legal}>
                  By continuing, you agree we may email you account-related
                  updates. We won&apos;t sell or share your address.
                </Text>
                {/* Layout lives on a View wrapper because Expo Router's
                    <Link> is text-typed on web (renders <a>) and rejects
                    flex/padding styles directly. */}
                <View style={styles.backHome}>
                  <Link href="/">
                    <Text style={styles.backHomeText}>← back home</Text>
                  </Link>
                </View>
              </View>
            </>
          ) : (
            /* ── "Link sent" confirmation state ── */
            <View style={styles.sentState}>
              {/* Envelope icon */}
              <LinearGradient
                colors={[colors.accent, colors.accentDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sentEnvelope}>
                <EnvelopeIcon />
              </LinearGradient>

              <Text style={styles.sentTitle}>Link on its way!</Text>
              <Text style={styles.sentBody}>
                We&apos;ve sent a one-click sign-in link to:
              </Text>

              {/* Email pill */}
              <View style={styles.sentEmailPill}>
                <Text style={styles.sentEmailText}>{email || 'your email address'}</Text>
              </View>

              <Text style={styles.sentHint}>
                It&apos;s valid for 15 minutes.{'\n'}
                Check your spam folder if it doesn&apos;t show up in a minute.
              </Text>

              {/* Resend button */}
              <Pressable
                onPress={resend}
                disabled={resendCooldown > 0 || busy}
                style={({ pressed }) => [
                  styles.resendBtn,
                  pressed && styles.resendPressed,
                  (resendCooldown > 0 || busy) && styles.dimmed,
                ]}>
                <Text style={styles.resendLabel}>
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : busy
                    ? 'Sending…'
                    : 'Resend'}
                </Text>
              </Pressable>

              <View style={styles.backHomeSent}>
                <Link href="/">
                  <Text style={styles.backHomeText}>← back home</Text>
                </Link>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_MAX_W = 440;
const NARROW_SIDE_MARGIN = 18;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // The sky gradient + clouds sit here; content is in the ScrollView.
  },

  // ── Sun glow ──
  sunGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '65%',
    height: '55%',
    pointerEvents: 'none',
  } as ViewStyle,

  // ── Background clouds (fixed positions, pointer-events none) ──
  bgCloud: {
    position: 'absolute',
    pointerEvents: 'none',
  } as ViewStyle,

  // TL: top: 90px left: -40px (desktop), slightly smaller + adjusted narrow
  cloudTL: {
    top: 90,
    left: -40,
    opacity: 0.85,
  },
  cloudTLNarrow: {
    top: 70,
    left: -20,
  },

  // TR: top: 110px right: 8%
  cloudTR: {
    top: 110,
    right: '8%' as unknown as number,
    opacity: 0.55,
  },

  // Mid-left: top: 42% left: 4%
  cloudMidL: {
    top: '42%' as unknown as number,
    left: '4%' as unknown as number,
    opacity: 0.6,
  },

  // Mid-right: top: 56% right: 6%
  cloudMidR: {
    top: '56%' as unknown as number,
    right: '6%' as unknown as number,
    opacity: 0.7,
  },

  // BR: bottom: 40px right: -30px
  cloudBR: {
    bottom: 40,
    right: -30,
    opacity: 0.8,
  },
  cloudBRNarrow: {
    bottom: 24,
    right: -30,
    opacity: 0.75,
  },

  // BL: bottom: 12% left: 18%
  cloudBL: {
    bottom: '12%' as unknown as number,
    left: '18%' as unknown as number,
    opacity: 0.45,
  },

  // ── Background paper plane ──
  bgPlane: {
    position: 'absolute',
    top: '22%' as unknown as number,
    left: '52%' as unknown as number,
    transform: [{ rotate: '-18deg' }],
    opacity: 0.6,
    pointerEvents: 'none',
  } as ViewStyle,
  bgPlaneNarrow: {
    top: '14%' as unknown as number,
    left: undefined,
    right: '8%' as unknown as number,
    opacity: 0.45,
  } as ViewStyle,

  // ── ScrollView ──
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.x4l,
    paddingHorizontal: IS_NARROW ? NARROW_SIDE_MARGIN : spacing.xl,
  },

  // ── Floating card ──
  card: {
    width: '100%',
    maxWidth: CARD_MAX_W,
    backgroundColor: colors.background,
    borderRadius: IS_NARROW ? 20 : radius.xl,
    padding: IS_NARROW ? 22 : 40,
    // "sticker peeling off the sky" shadow — asymmetric layers
    // boxShadow uses desktop values (18px/0.12/40px); IS_NARROW variants dropped — web is typically wider.
    // elevation stays for native parity.
    boxShadow: '0px 18px 40px rgba(31, 95, 160, 0.12)',
    elevation: 16,
    zIndex: 10,
  },

  // ── Card header ──
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  cardMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.skyDeep, // gradient approximation; not worth LinearGradient inside tiny circle
    alignItems: 'center',
    justifyContent: 'center',
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 4px 10px rgba(45, 125, 210, 0.28)',
    elevation: 6,
  },
  cardTitle: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: 27,
    letterSpacing: -0.9,
    lineHeight: 33,
    color: colors.text,
  },

  // ── Handwritten tagline ──
  tagline: {
    fontFamily: fontFamily.hand,
    fontSize: 22,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    marginTop: 10,
    marginBottom: 26,
    lineHeight: 29,
  },

  // ── Google button ──
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 50,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: `rgba(31,95,160,0.12)`,
    borderRadius: radius.md,
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 1px 4px rgba(31, 95, 160, 0.06)',
    elevation: 2,
  },
  googlePressed: {
    borderColor: colors.skyMid,
    // Full boxShadow override for pressed state (replaces partial shadow* props).
    boxShadow: '0px 1px 8px rgba(31, 95, 160, 0.15)',
  },
  googleLabel: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 14,
    color: colors.text,
  },

  // ── OR divider ──
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: `rgba(31,95,160,0.12)`,
  },
  orText: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: colors.textSubtle,
    letterSpacing: 1,
  },

  // ── Email field ──
  fieldWrap: {
    marginBottom: 12,
  },
  inputError: {
    borderColor: colors.accent,
    // RN Web doesn't support boxShadow in StyleSheet; skip the glow
  },
  errorText: {
    fontSize: 12,
    color: colors.accent,
    marginBottom: 8,
    marginTop: -6,
  },

  // ── Send the link button (coral) ──
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 6px 16px rgba(255, 140, 122, 0.38)',
    elevation: 8,
    marginTop: 2,
  },
  sendBtnPressed: {
    // Full boxShadow override for pressed state (replaces partial shadow* props).
    boxShadow: '0px 6px 20px rgba(255, 140, 122, 0.44)',
    opacity: 0.93,
  },
  sendBtnLabel: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 15,
    color: colors.textInverse,
    letterSpacing: -0.2,
  },
  sendBtnPlane: {
    // The plane icon sits beside the label; no hover nudge in RN
  },

  // ── Card footer ──
  cardFooter: {
    flexDirection: IS_NARROW ? 'column' : 'row',
    alignItems: IS_NARROW ? 'flex-start' : 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
    flexWrap: 'wrap',
  },
  legal: {
    fontSize: 11,
    color: colors.textSubtle,
    lineHeight: 16,
    flex: IS_NARROW ? undefined : 1,
    flexShrink: 1,
  },
  backHome: {
    flexShrink: 0,
    paddingTop: 1,
  },
  backHomeText: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    color: colors.textSubtle,
  },

  // ── Dimmed (disabled) state ──
  dimmed: {
    opacity: 0.6,
  },

  // ── Sent state ──
  sentState: {
    alignItems: 'center',
    paddingTop: 4,
  },
  sentEnvelope: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    // boxShadow because RN's shadow* props are deprecated on web; elevation stays for native parity
    boxShadow: '0px 8px 18px rgba(255, 140, 122, 0.36)',
    elevation: 10,
  },
  sentTitle: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: 24,
    letterSpacing: -0.7,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  sentBody: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  sentEmailPill: {
    backgroundColor: '#FFF0ED',
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginTop: 10,
    marginBottom: 16,
  },
  sentEmailText: {
    color: colors.accentDark,
    fontWeight: fontWeight.bold,
    fontSize: 13,
  },
  sentHint: {
    fontSize: 12,
    color: colors.textSubtle,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  resendBtn: {
    borderWidth: 1.5,
    borderColor: `rgba(31,95,160,0.12)`,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  resendPressed: {
    borderColor: colors.accent,
  },
  resendLabel: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  backHomeSent: {
    marginTop: 20,
  },
});
