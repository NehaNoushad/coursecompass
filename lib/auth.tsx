/**
 * Auth context — wraps the Supabase session into a React context so any
 * component can read `useAuth().user` cheaply, and the BrowseGateProvider
 * can flip into bypass mode whenever a session exists.
 *
 * Lifecycle:
 *   1. On mount: call `supabase.auth.getSession()` to hydrate from
 *      AsyncStorage (the session is persisted across page loads).
 *   2. Subscribe to `onAuthStateChange` so any sign-in / sign-out
 *      anywhere in the app propagates here automatically.
 *   3. Unsubscribe on unmount.
 */

import type { Session, User } from '@supabase/supabase-js';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';

interface AuthValue {
  session: Session | null;
  user: User | null;
  /** True until the initial getSession() call resolves. */
  loading: boolean;
  /**
   * True if the signed-in user has at least one row in quiz_results.
   * Drives "hide the Take-the-quiz CTA from the header" and the
   * "Take it again" relabel across the site.
   */
  hasTakenQuiz: boolean;
  /**
   * Refetches the quiz-history flag. Call this from /quiz after a
   * successful insert so the UI updates without a page reload.
   */
  refreshQuizHistory: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  loading: true,
  hasTakenQuiz: false,
  refreshQuizHistory: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTakenQuiz, setHasTakenQuiz] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Hydrate the initial session from persisted storage.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    // Listen for any subsequent auth-state changes.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Whenever the session changes (sign-in / sign-out), refetch the
  // quiz-history flag. Anonymous users always have hasTakenQuiz=false.
  useEffect(() => {
    if (!session) {
      setHasTakenQuiz(false);
      return;
    }
    let cancelled = false;
    supabase
      .from('quiz_results')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        // If the table doesn't exist yet (pre-setup), silently
        // treat the user as quiz-less — no console noise.
        if (error && !/relation .* does not exist/i.test(error.message)) {
          console.warn('quiz_results lookup failed:', error.message);
        }
        setHasTakenQuiz(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      hasTakenQuiz,
      refreshQuizHistory: async () => {
        if (!session) {
          setHasTakenQuiz(false);
          return;
        }
        const { data } = await supabase
          .from('quiz_results')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1)
          .maybeSingle();
        setHasTakenQuiz(!!data);
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading, hasTakenQuiz],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  return useContext(AuthContext);
}
