/**
 * Account dashboard — `/account`. Shows the signed-in user their profile
 * info (email + optional phone), their profile picture, a summary of
 * their last quiz attempt (if any), and lets them sign out or delete
 * their account.
 *
 * Visual: sky-band hero (via SkyBandHero) with 96 px avatar, Caveat
 * greeting, and ghost action buttons. Body is a single-column stack:
 * quiz results → shortlist (coming soon) → profile → account controls.
 *
 * Data layer note: phone + profile picture + quiz history live in a
 * Supabase `profiles` table that needs to exist. The SQL to create it
 * is in `docs/supabase-setup.sql` — paste into the Supabase SQL editor
 * once. Until then the editable fields will show "Database not set up
 * yet — paste docs/supabase-setup.sql into Supabase SQL editor" and the
 * Save buttons will be inert.
 */

import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SkyBandHero } from '@/components/sky-band-hero';
import { TextInput } from '@/components/ui/text-input';
import { Text } from '@/components/ui/text';
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

const IS_NARROW = Dimensions.get('window').width < 980;

// ─── token shortcuts that match the prototype CSS vars ───────────────
const skyPale    = colors.skyPale;
const skyMid     = colors.skyMid;
const skyDeep    = colors.skyDeep;
const skyAnchor  = colors.skyAnchor;
const coralDeep  = colors.accentDark;
const inkMuted   = colors.textSubtle;
const line       = colors.border;

// ─── helpers ─────────────────────────────────────────────────────────

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── types ───────────────────────────────────────────────────────────

interface Profile {
  phone: string | null;
  avatar_url: string | null;
}

interface QuizSummary {
  taken_at: string;
  top_course_name: string | null;
  top_college_name: string | null;
}

// ─── sub-components ──────────────────────────────────────────────────

/** Section header: small-caps label + a full-width rule on the right. */
function SectionLabel({ label }: { label: string }) {
  return (
    <View style={sl.row}>
      <Text style={sl.text}>{label}</Text>
      <View style={sl.rule} />
    </View>
  );
}
const sl = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.lg },
  text: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: inkMuted,
  },
  rule: { flex: 1, height: 1, backgroundColor: line },
});

/** The 96 px hero avatar — photo if available, else gradient + initial. */
function HeroAvatar({ avatarUrl, initial }: { avatarUrl: string | null; initial: string }) {
  if (avatarUrl) {
    return (
      <View
        style={StyleSheet.flatten([
          ha.circle,
          {
            backgroundImage: `url(${avatarUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } as ViewStyle,
        ])}
      />
    );
  }
  return (
    <View style={ha.circle}>
      <Text style={ha.initial}>{initial}</Text>
    </View>
  );
}
const ha = StyleSheet.create({
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: skyMid,
    alignItems: 'center',
    justifyContent: 'center',
    // outer ring
    borderWidth: 4,
    borderColor: skyPale,
    // shadow
    shadowColor: skyAnchor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 8,
    // break slightly out of hero bottom boundary
    marginBottom: IS_NARROW ? -24 : -32,
    flexShrink: 0,
  },
  initial: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: 38,
    color: colors.textInverse,
    lineHeight: 38,
  },
});

/** A ghost pill button rendered inside the sky hero. */
function GhostBtn({
  label,
  onPress,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        gb.btn,
        danger && gb.danger,
        pressed && gb.pressed,
      ]}
    >
      <Text style={[gb.label, danger && gb.dangerLabel]}>{label}</Text>
    </Pressable>
  );
}
const gb = StyleSheet.create({
  btn: {
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.pill,
  },
  danger: {
    borderColor: 'rgba(230,110,90,0.30)',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  pressed: { opacity: 0.85 },
  label: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    color: colors.text,
  },
  dangerLabel: {
    color: coralDeep,
  },
});

// ─── main screen ─────────────────────────────────────────────────────

export default function AccountScreen() {
  const { session, user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [dbReady, setDbReady] = useState(true);

  const [phone, setPhone] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Redirect to /signin if not logged in (after the initial auth check resolves).
  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/signin');
    }
  }, [authLoading, session]);

  // Load profile + quiz history. If the tables don't exist yet, the
  // queries fail cleanly and we surface the "DB not set up" hint
  // without blowing up the page.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const [profileRes, quizRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('phone, avatar_url')
          .eq('id', session.user.id)
          .maybeSingle(),
        supabase
          .from('quiz_results')
          .select('taken_at, top_course_name, top_college_name')
          .eq('user_id', session.user.id)
          .order('taken_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      // If both tables 404, the DB isn't set up.
      if (profileRes.error && /relation .* does not exist/i.test(profileRes.error.message)) {
        setDbReady(false);
        return;
      }
      if (profileRes.data) {
        setProfile(profileRes.data);
        setPhone(profileRes.data.phone ?? '');
      }
      if (quizRes.data) setQuiz(quizRes.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function savePhone() {
    if (!session) return;
    setSavingPhone(true);
    setPhoneSaved(false);
    const cleaned = phone.trim();
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, phone: cleaned || null });
    setSavingPhone(false);
    if (!error) {
      setPhoneSaved(true);
      setEditingPhone(false);
      setTimeout(() => setPhoneSaved(false), 2000);
    } else {
      if (typeof window !== 'undefined') {
        window.alert(`Couldn't save: ${error.message}`);
      } else {
        Alert.alert('Save failed', error.message);
      }
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    // The RPC `delete_user` runs as SECURITY DEFINER so the user can
    // delete their own auth.users row. Defined in the SQL setup file.
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      setDeleting(false);
      setDeleteError(error.message);
      return;
    }
    await supabase.auth.signOut();
    router.replace('/');
  }

  // Pre-mount and mid-redirect: render nothing rather than a flash of
  // the dashboard for an unauthenticated user.
  if (authLoading || !session || !user) return null;

  const email = user.email ?? 'No email';
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    email.split('@')[0];
  const initial = (email[0] ?? '?').toUpperCase();
  // Prefer an uploaded avatar from our profiles table, then fall back
  // to the OAuth picture (Google fills user_metadata.avatar_url on
  // signup), then to the initial-letter circle.
  const oauthAvatar =
    typeof user.user_metadata?.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata?.picture === 'string'
        ? user.user_metadata.picture
        : null;
  const avatarUrl = profile?.avatar_url ?? oauthAvatar;

  const phoneValue = profile?.phone ?? '';

  // ─── HERO content ─────────────────────────────────────────────────
  const heroContent = (
    <View style={IS_NARROW ? hero.colLayout : hero.rowLayout}>
      <HeroAvatar avatarUrl={avatarUrl} initial={initial} />

      <View style={IS_NARROW ? hero.textNarrow : hero.textWide}>
        <Text style={hero.greeting}>{`Hi, ${displayName} 👋`}</Text>
        <Text style={hero.email}>{email}</Text>
      </View>

      <View style={IS_NARROW ? hero.actionsNarrow : hero.actionsWide}>
        {/* Scroll down to the profile section */}
        <GhostBtn label="Edit profile" onPress={() => {/* no-op; user scrolls */}} />
        <GhostBtn label="Sign out" danger onPress={signOut} />
      </View>
    </View>
  );

  return (
    <View style={page.root}>
      <SiteHeader />
      <ScrollView
        contentContainerStyle={page.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Sky hero — full-width, no horizontal padding constraint */}
        <SkyBandHero minHeight={IS_NARROW ? 220 : 200}>
          {heroContent}
        </SkyBandHero>

        {/* Body — max-width centred, same as Screen inner */}
        <View style={page.body}>

          {/* ONE-TIME SETUP warning — show above sections if DB not ready */}
          {!dbReady ? (
            <Card style={warn.card}>
              <Text variant="label" color={colors.accentDark}>
                ONE-TIME SETUP NEEDED
              </Text>
              <Text style={warn.body}>
                The Supabase tables that store profile + quiz data don&apos;t
                exist yet. Paste the SQL from{' '}
                <Text style={warn.code}>docs/supabase-setup.sql</Text> into
                Supabase&apos;s SQL editor to create them. Until then phone +
                quiz history won&apos;t persist.
              </Text>
            </Card>
          ) : null}

          {/* ── MY QUIZ RESULTS ──────────────────────────────────── */}
          <View style={page.section}>
            <SectionLabel label="My quiz results" />
            {quiz ? (
              <Card style={qz.card}>
                <View style={IS_NARROW ? qz.colLayout : qz.rowLayout}>
                  <View style={qz.left}>
                    {/* Meta dot + date */}
                    <View style={qz.metaRow}>
                      <View style={qz.dot} />
                      <Text style={qz.meta}>
                        {`Taken ${daysAgo(quiz.taken_at)} day${daysAgo(quiz.taken_at) !== 1 ? 's' : ''} ago · ${fmtDate(quiz.taken_at)}`}
                      </Text>
                    </View>
                    {quiz.top_course_name ? (
                      <View style={qz.dataRow}>
                        <Text style={qz.rowLabel}>YOUR TOP COURSE</Text>
                        <Text style={[qz.rowValue, { color: coralDeep }]}>
                          {quiz.top_course_name}
                        </Text>
                      </View>
                    ) : null}
                    {quiz.top_college_name ? (
                      <View style={qz.dataRow}>
                        <Text style={qz.rowLabel}>YOUR TOP COLLEGE</Text>
                        <Text style={qz.rowValue}>{quiz.top_college_name}</Text>
                      </View>
                    ) : null}
                    {/* See full results → */}
                    <Link href="/quiz" asChild>
                      <Pressable style={qz.linkRow}>
                        <Text style={qz.linkText}>See full results</Text>
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M5 12h14M13 6l6 6-6 6"
                            stroke={skyDeep}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </Pressable>
                    </Link>
                  </View>

                  <View style={IS_NARROW ? qz.rightNarrow : qz.rightWide}>
                    <LinkButton
                      href="/quiz"
                      label="Take the quiz again"
                      variant="ghost"
                    />
                  </View>
                </View>
              </Card>
            ) : (
              /* Empty state */
              <Card style={qz.emptyCard} muted>
                <Text style={qz.emptyText}>
                  You haven&apos;t taken the quiz yet.
                </Text>
                <View style={{ marginTop: spacing.lg }}>
                  <LinkButton href="/quiz" label="Take the 6-question quiz →" />
                </View>
              </Card>
            )}
          </View>

          {/* ── MY SHORTLIST ─────────────────────────────────────── */}
          <View style={page.section}>
            <SectionLabel label="My shortlist" />
            <View style={sl2.card}>
              {/* Paper-plane icon box */}
              <View style={sl2.iconBox}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    stroke={skyDeep}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View style={sl2.text}>
                <View style={sl2.titleRow}>
                  <Text style={sl2.title}>Save colleges you like</Text>
                  <View style={sl2.pill}>
                    <Text style={sl2.pillText}>COMING SOON</Text>
                  </View>
                </View>
                <Text style={sl2.body}>
                  Shortlist colleges as you browse, compare them side-by-side,
                  and walk away with a clear answer. Launching with Phase 4.
                </Text>
              </View>
            </View>
          </View>

          {/* ── PROFILE ──────────────────────────────────────────── */}
          <View style={page.section} id="profile">
            <SectionLabel label="Profile" />
            <View style={pf.grid}>
              {/* Email row */}
              <View style={pf.row}>
                <View style={pf.iconBox}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"
                      stroke={skyMid}
                      strokeWidth={1.5}
                    />
                    <Path
                      d="M22 6L12 13 2 6"
                      stroke={skyMid}
                      strokeWidth={1.5}
                    />
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={pf.rowLabel}>EMAIL ADDRESS</Text>
                  <Text style={pf.rowValue}>{email}</Text>
                  <Text style={pf.hint}>Sign in is tied to this address</Text>
                </View>
                <View style={pf.badge}>
                  <Text style={pf.badgeText}>Read-only</Text>
                </View>
              </View>

              {/* Phone row */}
              <View style={[pf.row, { borderBottomWidth: 0 }]}>
                <View style={pf.iconBox}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.04 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                      stroke={skyMid}
                      strokeWidth={1.5}
                    />
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={pf.rowLabel}>PHONE NUMBER</Text>
                  {editingPhone ? (
                    <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                      <TextInput
                        placeholder="+91 9876543210"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        editable={!savingPhone && dbReady}
                      />
                      <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        <Button
                          label={savingPhone ? 'Saving…' : phoneSaved ? 'Saved ✓' : 'Save'}
                          onPress={savePhone}
                          disabled={savingPhone || !dbReady}
                          style={!dbReady ? { opacity: 0.5 } : undefined}
                        />
                        <Button
                          label="Cancel"
                          variant="ghost"
                          onPress={() => {
                            setEditingPhone(false);
                            setPhone(profile?.phone ?? '');
                          }}
                        />
                      </View>
                    </View>
                  ) : phoneValue ? (
                    <Text style={pf.rowValue}>{phoneValue}</Text>
                  ) : (
                    <Text style={[pf.rowValue, { color: inkMuted }]}>Not added yet</Text>
                  )}
                </View>
                {!editingPhone ? (
                  <Pressable
                    onPress={() => setEditingPhone(true)}
                    style={pf.addCta}
                    disabled={!dbReady}
                  >
                    <Text style={pf.addCtaText}>
                      {phoneValue ? 'Edit' : '+ Add'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* Disclosure */}
            <View style={pf.disclosure}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 } as ViewStyle}>
                <Circle cx={12} cy={12} r={10} stroke={inkMuted} strokeWidth={1.5} />
                <Path
                  d="M12 8v4M12 16h.01"
                  stroke={inkMuted}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={pf.disclosureText}>
                Your email is used only for sign-in. Your phone number, if added,
                is used only for login via OTP. We never share your details.
              </Text>
            </View>
          </View>

          {/* ── ACCOUNT & SETTINGS ───────────────────────────────── */}
          <View style={page.section}>
            <SectionLabel label="Account" />
            <View style={ac.list}>
              {/* Sign out row */}
              <Pressable
                onPress={signOut}
                style={({ pressed }) => [ac.row, pressed && ac.rowPressed]}
              >
                <View style={ac.rowLeft}>
                  <View style={ac.dot} />
                  <Text style={ac.rowText}>Sign out</Text>
                </View>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                    stroke={inkMuted}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>

              {/* Delete account row */}
              {!confirmDelete ? (
                <Pressable
                  onPress={() => setConfirmDelete(true)}
                  style={({ pressed }) => [
                    ac.row,
                    ac.rowDanger,
                    { borderBottomWidth: 0 },
                    pressed && ac.rowPressed,
                  ]}
                >
                  <View style={ac.rowLeft}>
                    <View style={[ac.dot, ac.dotDanger]} />
                    <Text style={ac.rowTextDanger}>Delete account</Text>
                  </View>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
                      stroke={coralDeep}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Pressable>
              ) : (
                /* Inline confirm card */
                <View style={[ac.row, { borderBottomWidth: 0, flexDirection: 'column', alignItems: 'flex-start', gap: spacing.md }]}>
                  <Text style={ac.confirmText}>
                    Are you sure? This will permanently remove your account,
                    phone number, and quiz history. This cannot be undone.
                  </Text>
                  {deleteError ? (
                    <Text variant="bodySmall" color={colors.danger}>
                      {deleteError}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
                    <Pressable
                      onPress={handleDelete}
                      disabled={deleting}
                      style={({ pressed }) => [
                        ac.deleteBtn,
                        pressed && { opacity: 0.85 },
                        deleting && { opacity: 0.5 },
                      ]}
                    >
                      <Text style={ac.deleteBtnLabel}>
                        {deleting ? 'Deleting…' : 'Yes, delete forever'}
                      </Text>
                    </Pressable>
                    <Button
                      label="Cancel"
                      variant="ghost"
                      onPress={() => {
                        setConfirmDelete(false);
                        setDeleteError(null);
                      }}
                      disabled={deleting}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>

        </View>{/* /body */}

        <SiteFooter />
      </ScrollView>
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────

const page = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // No `alignItems: 'center'` — the hero (SkyBandHero) needs to span
  // the full ScrollView width. The body block below sets its own
  // alignSelf:center + maxWidth.
  scroll: { flexGrow: 1 },
  body: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: IS_NARROW ? spacing.xl : spacing.x2l,
    paddingTop: spacing.x3l + spacing.lg, // extra room for the avatar overlap
    paddingBottom: spacing.x3l,
    gap: spacing.x3l,
  },
  section: {},
});

const warn = StyleSheet.create({
  card: {
    borderColor: colors.accent,
    borderWidth: 2,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  body: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  code: {
    fontFamily: 'ui-monospace',
    fontSize: 13,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

const hero = StyleSheet.create({
  rowLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.x2l,
  },
  colLayout: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  textWide: { flex: 1 },
  textNarrow: {},
  actionsWide: {
    flexDirection: 'row',
    gap: 10,
    flexShrink: 0,
  },
  actionsNarrow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  greeting: {
    fontFamily: fontFamily.hand,
    fontSize: IS_NARROW ? 28 : 36,
    color: colors.text,
    lineHeight: IS_NARROW ? 28 : 36,
    marginBottom: 4,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});

const qz = StyleSheet.create({
  card: { padding: spacing.xl },
  rowLayout: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.x2l },
  colLayout: { flexDirection: 'column', gap: spacing.lg },
  left: { flex: 1 },
  rightWide: { flexShrink: 0, alignItems: 'flex-end', paddingTop: 2 },
  rightNarrow: { alignItems: 'flex-start' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    flexShrink: 0,
  },
  meta: {
    fontSize: fontSize.xs,
    color: inkMuted,
  },
  dataRow: { marginBottom: 10 },
  rowLabel: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: inkMuted,
    marginBottom: 2,
  },
  rowValue: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.text,
    letterSpacing: -0.3,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  linkText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: skyDeep,
  },
  emptyCard: {
    padding: spacing.xl,
  },
  emptyText: {
    color: inkMuted,
    fontSize: fontSize.sm,
  },
});

// shortlist card
const sl2 = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'rgba(31,95,160,0.2)',
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    padding: IS_NARROW ? spacing.xl : spacing.x2l + spacing.sm,
    flexDirection: IS_NARROW ? 'column' : 'row',
    alignItems: IS_NARROW ? 'flex-start' : 'center',
    gap: IS_NARROW ? spacing.lg : spacing.x2l,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: skyPale,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  pill: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: skyPale,
    borderWidth: 1,
    borderColor: 'rgba(31,95,160,0.18)',
    borderRadius: radius.pill,
  },
  pillText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.2,
    color: skyAnchor,
  },
  body: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.6,
    maxWidth: 480,
  },
});

// profile grid
const pf = StyleSheet.create({
  grid: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: line,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: skyAnchor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: line,
    gap: spacing.lg,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: skyPale,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: inkMuted,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  hint: {
    fontSize: fontSize.xs,
    color: inkMuted,
    marginTop: 2,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: skyPale,
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: inkMuted,
  },
  addCta: {
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    backgroundColor: skyPale,
    borderWidth: 1,
    borderColor: 'rgba(31,95,160,0.18)',
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  addCtaText: {
    fontSize: 12,
    fontWeight: fontWeight.bold,
    color: skyAnchor,
  },
  disclosure: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.md,
  },
  disclosureText: {
    fontSize: fontSize.xs,
    color: inkMuted,
    flex: 1,
    lineHeight: fontSize.xs * 1.6,
  },
});

// account list
const ac = StyleSheet.create({
  list: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: line,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: skyAnchor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: line,
  },
  rowDanger: {},
  rowPressed: { backgroundColor: skyPale },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: line,
    flexShrink: 0,
  },
  dotDanger: { backgroundColor: 'rgba(192,57,43,0.25)' },
  rowText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  rowTextDanger: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: '#c0392b',
  },
  confirmText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * 1.5,
  },
  deleteBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: '#c0392b',
  },
  deleteBtnLabel: {
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
    fontSize: 15,
  },
});
