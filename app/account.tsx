/**
 * Account dashboard — `/account`. Shows the signed-in user their profile
 * info (email + optional phone), their profile picture, a summary of
 * their last quiz attempt (if any), and lets them sign out or delete
 * their account.
 *
 * Data layer note: phone + profile picture + quiz history live in a
 * Supabase `profiles` table that needs to exist. The SQL to create it
 * is in `docs/supabase-setup.sql` — paste into the Supabase SQL editor
 * once. Until then the editable fields will show "Database not set up
 * yet — paste docs/supabase-setup.sql into Supabase SQL editor" and the
 * Save buttons will be inert.
 */

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { Text } from '@/components/ui/text';
import { APP_NAME } from '@/constants/app';
import {
  colors,
  fontFamily,
  fontWeight,
  radius,
  spacing,
} from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface Profile {
  phone: string | null;
  avatar_url: string | null;
}

interface QuizSummary {
  taken_at: string;
  top_course_name: string | null;
  top_college_name: string | null;
}

export default function AccountScreen() {
  const { session, user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [dbReady, setDbReady] = useState(true);

  const [phone, setPhone] = useState('');
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
      setTimeout(() => setPhoneSaved(false), 2000);
    } else {
      // Best-effort: surface via alert.
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
  const initial = (email[0] ?? '?').toUpperCase();
  // Prefer an uploaded avatar from our profiles table, then fall back
  // to the OAuth picture (Google fills user_metadata.avatar_url on
  // signup), then to the initial-letter circle below.
  const oauthAvatar =
    typeof user.user_metadata?.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata?.picture === 'string'
        ? user.user_metadata.picture
        : null;
  const avatarUrl = profile?.avatar_url ?? oauthAvatar;

  return (
    <Screen>
      <View style={styles.frame}>
        <Text variant="title">Your account</Text>
        <Text muted style={styles.subtitle}>
          Manage your {APP_NAME} profile, see your quiz results, and update your
          contact details.
        </Text>

        {!dbReady ? (
          <Card style={styles.warning}>
            <Text variant="label" color={colors.accentDark}>
              ONE-TIME SETUP NEEDED
            </Text>
            <Text style={styles.warningBody}>
              The Supabase tables that store profile + quiz data don&apos;t
              exist yet. Paste the SQL from{' '}
              <Text style={styles.code}>docs/supabase-setup.sql</Text> into
              Supabase&apos;s SQL editor to create them. Until then phone +
              quiz history won&apos;t persist.
            </Text>
          </Card>
        ) : null}

        {/* Profile card — avatar + email + phone */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatarWrap}>
              {avatarUrl ? (
                <View
                  style={StyleSheet.flatten([
                    styles.avatar,
                    {
                      backgroundImage: `url(${avatarUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    } as ViewStyle,
                  ])}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </View>
              )}
              {!avatarUrl ? (
                <Text variant="caption" muted style={styles.avatarHint}>
                  Photo upload coming
                </Text>
              ) : null}
            </View>
            <View style={styles.identity}>
              <Text variant="label" muted>
                EMAIL
              </Text>
              <Text style={styles.email}>{email}</Text>
              <Text variant="caption" muted style={styles.emailHint}>
                Your email is your sign-in method. To change it, contact us.
              </Text>
            </View>
          </View>
        </Card>

        {/* Phone — editable */}
        <Card style={styles.card}>
          <Text variant="heading" style={styles.sectionTitle}>
            Phone (optional)
          </Text>
          <Text muted style={styles.sectionBody}>
            We&apos;ll only ever message you about your application — never
            spam, never share.
          </Text>
          <TextInput
            label="Phone number"
            placeholder="+91 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={!savingPhone && dbReady}
            style={styles.input}
          />
          <View style={styles.row}>
            <Button
              label={savingPhone ? 'Saving…' : phoneSaved ? 'Saved ✓' : 'Save phone'}
              onPress={savePhone}
              disabled={savingPhone || !dbReady}
              style={!dbReady ? styles.disabled : undefined}
            />
          </View>
        </Card>

        {/* Quiz summary */}
        <Card style={styles.card}>
          <Text variant="heading" style={styles.sectionTitle}>
            Your quiz
          </Text>
          {quiz ? (
            <>
              <Text muted style={styles.sectionBody}>
                Last taken{' '}
                {new Date(quiz.taken_at).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                .
              </Text>
              {quiz.top_course_name ? (
                <View style={styles.quizRow}>
                  <Text variant="label" muted>
                    TOP COURSE
                  </Text>
                  <Text style={styles.quizValue}>{quiz.top_course_name}</Text>
                </View>
              ) : null}
              {quiz.top_college_name ? (
                <View style={styles.quizRow}>
                  <Text variant="label" muted>
                    TOP COLLEGE
                  </Text>
                  <Text style={styles.quizValue}>{quiz.top_college_name}</Text>
                </View>
              ) : null}
              <View style={[styles.row, { marginTop: spacing.md }]}>
                <LinkButton href="/quiz" label="Retake the quiz" variant="secondary" />
              </View>
            </>
          ) : (
            <>
              <Text muted style={styles.sectionBody}>
                You haven&apos;t taken the quiz yet. Five minutes to get a
                shortlist of courses and colleges that fit you.
              </Text>
              <View style={styles.row}>
                <LinkButton href="/quiz" label="Take the quiz →" />
              </View>
            </>
          )}
        </Card>

        {/* Sign out */}
        <Card style={styles.card}>
          <Text variant="heading" style={styles.sectionTitle}>
            Sign out
          </Text>
          <Text muted style={styles.sectionBody}>
            Signs you out on this browser. Your data stays.
          </Text>
          <View style={styles.row}>
            <Button label="Sign out" variant="secondary" onPress={signOut} />
          </View>
        </Card>

        {/* Danger zone */}
        <Card style={StyleSheet.flatten([styles.card, styles.danger])}>
          <Text variant="heading" style={[styles.sectionTitle, { color: colors.danger }]}>
            Delete account
          </Text>
          <Text muted style={styles.sectionBody}>
            Permanently deletes your {APP_NAME} account, your phone number,
            and your quiz history. Cannot be undone.
          </Text>
          {!confirmDelete ? (
            <View style={styles.row}>
              <Pressable
                onPress={() => setConfirmDelete(true)}
                style={({ pressed }) => [
                  styles.dangerBtn,
                  pressed && styles.dangerBtnPressed,
                ]}
              >
                <Text style={styles.dangerBtnLabel}>Delete my account</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text style={styles.dangerConfirm}>
                Are you sure? This will permanently remove your account and all
                associated data.
              </Text>
              {deleteError ? (
                <Text variant="bodySmall" color={colors.danger} style={{ marginBottom: spacing.md }}>
                  {deleteError}
                </Text>
              ) : null}
              <View style={[styles.row, { gap: spacing.md }]}>
                <Pressable
                  onPress={handleDelete}
                  disabled={deleting}
                  style={({ pressed }) => [
                    styles.dangerBtn,
                    pressed && styles.dangerBtnPressed,
                    deleting && styles.disabled,
                  ]}
                >
                  <Text style={styles.dangerBtnLabel}>
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
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  warning: {
    borderColor: colors.accent,
    borderWidth: 2,
    gap: spacing.sm,
  },
  warningBody: {
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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },

  // Profile card
  avatarWrap: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: 40,
    color: colors.primaryDark,
    lineHeight: 40,
  },
  avatarHint: {
    fontSize: 11,
  },
  identity: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 200,
    gap: spacing.xs,
  },
  email: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    color: colors.text,
  },
  emailHint: {
    marginTop: spacing.xs,
  },

  // Section blocks
  sectionTitle: {
    marginBottom: 0,
  },
  sectionBody: {
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  input: {
    marginTop: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },

  // Quiz rows
  quizRow: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  quizValue: {
    fontFamily: fontFamily.display,
    fontSize: 17,
    color: colors.text,
  },

  // Danger zone
  danger: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  dangerBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
  },
  dangerBtnPressed: {
    opacity: 0.85,
  },
  dangerBtnLabel: {
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
    fontSize: 15,
  },
  dangerConfirm: {
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: fontWeight.medium,
  },
});
