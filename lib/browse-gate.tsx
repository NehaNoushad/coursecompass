/**
 * Browse gate — tracks cumulative *active* browsing time and reports a
 * three-state signup-gate status (`free` → `nudge` → `firm`).
 *
 * Active time only: ticking pauses when the tab is hidden (web) or the app
 * is backgrounded (native), so a user who leaves the tab open overnight
 * isn't gated instantly the next morning.
 *
 * Persistence: on web we write to `localStorage` synchronously so the gate
 * survives page reloads. On native there's no persistence yet — AsyncStorage
 * will be wired in alongside the Supabase auth step; until then the timer
 * resets on app restart, which is fine for development.
 *
 * Logged-in users bypass the gate entirely. Pass `loggedIn` from whichever
 * auth provider eventually wraps this one.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';

import {
  BROWSE_GATE_FIRM_MINUTES,
  BROWSE_GATE_NUDGE_MINUTES,
} from '@/constants/app';

const STORAGE_KEY = 'cc.browseGate.v1';
const TICK_MS = 1000;

export type BrowseGateState = 'free' | 'nudge' | 'firm';

type Persisted = {
  activeMs: number;
  nudgeDismissed: boolean;
};

export interface BrowseGateValue {
  /** Current gate state derived from `activeMs` + `nudgeDismissed`. */
  state: BrowseGateState;
  /** Cumulative active-browsing time, in milliseconds. */
  activeMs: number;
  /** Threshold values (ms) — exposed so UI can show progress / "X min left". */
  thresholds: { nudgeMs: number; firmMs: number };
  /** True once the user has dismissed the soft nudge. */
  nudgeDismissed: boolean;
  /** Dismiss the soft nudge; the firm gate still applies after the grace period. */
  dismissNudge: () => void;
  /** Reset everything (e.g. after successful signup). */
  reset: () => void;
}

const NUDGE_MS = BROWSE_GATE_NUDGE_MINUTES * 60_000;
const FIRM_MS = BROWSE_GATE_FIRM_MINUTES * 60_000;

const defaultValue: BrowseGateValue = {
  state: 'free',
  activeMs: 0,
  thresholds: { nudgeMs: NUDGE_MS, firmMs: FIRM_MS },
  nudgeDismissed: false,
  dismissNudge: () => {},
  reset: () => {},
};

const BrowseGateContext = createContext<BrowseGateValue>(defaultValue);

function isWeb() {
  return Platform.OS === 'web' && typeof window !== 'undefined';
}

function loadPersisted(): Persisted {
  if (!isWeb()) return { activeMs: 0, nudgeDismissed: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { activeMs: 0, nudgeDismissed: false };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      activeMs: typeof parsed.activeMs === 'number' ? parsed.activeMs : 0,
      nudgeDismissed: Boolean(parsed.nudgeDismissed),
    };
  } catch {
    return { activeMs: 0, nudgeDismissed: false };
  }
}

function savePersisted(p: Persisted) {
  if (!isWeb()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Quota exceeded or privacy-mode storage rejection — non-fatal.
  }
}

function clearPersisted() {
  if (!isWeb()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function isDocumentVisible() {
  if (typeof document === 'undefined') return true;
  return document.visibilityState === 'visible';
}

function computeState(
  activeMs: number,
  nudgeDismissed: boolean,
): BrowseGateState {
  if (activeMs >= FIRM_MS) return 'firm';
  if (activeMs >= NUDGE_MS && !nudgeDismissed) return 'nudge';
  return 'free';
}

export function BrowseGateProvider({
  children,
  loggedIn = false,
}: {
  children: React.ReactNode;
  loggedIn?: boolean;
}) {
  const [activeMs, setActiveMs] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const lastTickAt = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate persisted state once on mount.
  useEffect(() => {
    if (loggedIn) {
      setHydrated(true);
      return;
    }
    const p = loadPersisted();
    setActiveMs(p.activeMs);
    setNudgeDismissed(p.nudgeDismissed);
    setHydrated(true);
  }, [loggedIn]);

  // Persist whenever values change (after hydration, to avoid clobbering on load).
  useEffect(() => {
    if (!hydrated || loggedIn) return;
    savePersisted({ activeMs, nudgeDismissed });
  }, [hydrated, loggedIn, activeMs, nudgeDismissed]);

  // Tick while foregrounded.
  useEffect(() => {
    if (!hydrated || loggedIn) return;

    const startTicking = () => {
      if (intervalRef.current !== null) return;
      lastTickAt.current = Date.now();
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const last = lastTickAt.current ?? now;
        lastTickAt.current = now;
        // Cap the delta so a throttled background interval (browsers can
        // stretch setInterval in hidden tabs even before visibilitychange
        // fires) can't add more than a tick's worth.
        const delta = Math.min(now - last, TICK_MS * 2);
        setActiveMs((ms) => Math.min(ms + delta, FIRM_MS + 60_000));
      }, TICK_MS);
    };

    const stopTicking = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastTickAt.current = null;
    };

    if (Platform.OS === 'web') {
      if (isDocumentVisible()) startTicking();
      const onVisibility = () => {
        if (isDocumentVisible()) startTicking();
        else stopTicking();
      };
      document.addEventListener('visibilitychange', onVisibility);
      return () => {
        document.removeEventListener('visibilitychange', onVisibility);
        stopTicking();
      };
    }

    if (AppState.currentState === 'active') startTicking();
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') startTicking();
      else stopTicking();
    });
    return () => {
      sub.remove();
      stopTicking();
    };
  }, [hydrated, loggedIn]);

  const dismissNudge = useCallback(() => setNudgeDismissed(true), []);

  const reset = useCallback(() => {
    setActiveMs(0);
    setNudgeDismissed(false);
    clearPersisted();
  }, []);

  const state: BrowseGateState = loggedIn
    ? 'free'
    : computeState(activeMs, nudgeDismissed);

  const value: BrowseGateValue = {
    state,
    activeMs,
    thresholds: { nudgeMs: NUDGE_MS, firmMs: FIRM_MS },
    nudgeDismissed,
    dismissNudge,
    reset,
  };

  return (
    <BrowseGateContext.Provider value={value}>
      {children}
    </BrowseGateContext.Provider>
  );
}

export function useBrowseGate(): BrowseGateValue {
  return useContext(BrowseGateContext);
}
