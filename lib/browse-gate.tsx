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
  BROWSE_GATE_FIRM_GRACE_MINUTES,
  BROWSE_GATE_FIRM_MINUTES,
  BROWSE_GATE_NUDGE_MINUTES,
} from '@/constants/app';

// Bumped to v2 because the persisted schema gained two fields below.
// Older v1 payloads (which lack firmGraceClaimed/firmGraceClaimedAtMs)
// are still readable — the load step just defaults the new fields.
const STORAGE_KEY = 'cc.browseGate.v1';
const TICK_MS = 1000;

export type BrowseGateState = 'free' | 'nudge' | 'firm';

type Persisted = {
  activeMs: number;
  nudgeDismissed: boolean;
  /** True once the user has spent their one-time firm-modal close (✕). */
  firmGraceClaimed: boolean;
  /** Snapshot of activeMs at the moment the ✕ was clicked. */
  firmGraceClaimedAtMs: number | null;
};

export interface BrowseGateValue {
  /** Current gate state derived from `activeMs` + dismissal flags. */
  state: BrowseGateState;
  /** Cumulative active-browsing time, in milliseconds. */
  activeMs: number;
  /** Threshold values (ms) — exposed so UI can show progress / "X min left". */
  thresholds: { nudgeMs: number; firmMs: number; firmGraceMs: number };
  /** True once the user has dismissed the soft nudge. */
  nudgeDismissed: boolean;
  /** True once the firm-modal close (✕) has been spent. */
  firmGraceClaimed: boolean;
  /** Dismiss the soft nudge; the firm gate still applies after the grace period. */
  dismissNudge: () => void;
  /**
   * Spend the one-time firm-modal close (✕). Hides firm for
   * BROWSE_GATE_FIRM_GRACE_MINUTES of active time, then it returns
   * without a close button.
   */
  claimFirmGrace: () => void;
  /** Reset everything (e.g. after successful signup). */
  reset: () => void;
}

const NUDGE_MS = BROWSE_GATE_NUDGE_MINUTES * 60_000;
const FIRM_MS = BROWSE_GATE_FIRM_MINUTES * 60_000;
const FIRM_GRACE_MS = BROWSE_GATE_FIRM_GRACE_MINUTES * 60_000;

const defaultValue: BrowseGateValue = {
  state: 'free',
  activeMs: 0,
  thresholds: { nudgeMs: NUDGE_MS, firmMs: FIRM_MS, firmGraceMs: FIRM_GRACE_MS },
  nudgeDismissed: false,
  firmGraceClaimed: false,
  dismissNudge: () => {},
  claimFirmGrace: () => {},
  reset: () => {},
};

const BrowseGateContext = createContext<BrowseGateValue>(defaultValue);

function isWeb() {
  return Platform.OS === 'web' && typeof window !== 'undefined';
}

const EMPTY: Persisted = {
  activeMs: 0,
  nudgeDismissed: false,
  firmGraceClaimed: false,
  firmGraceClaimedAtMs: null,
};

function loadPersisted(): Persisted {
  if (!isWeb()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      activeMs: typeof parsed.activeMs === 'number' ? parsed.activeMs : 0,
      nudgeDismissed: Boolean(parsed.nudgeDismissed),
      firmGraceClaimed: Boolean(parsed.firmGraceClaimed),
      firmGraceClaimedAtMs:
        typeof parsed.firmGraceClaimedAtMs === 'number'
          ? parsed.firmGraceClaimedAtMs
          : null,
    };
  } catch {
    return EMPTY;
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
  firmGraceClaimed: boolean,
  firmGraceClaimedAtMs: number | null,
): BrowseGateState {
  if (activeMs >= FIRM_MS) {
    // If they claimed the one-time grace and we're still inside it, stay free.
    if (
      firmGraceClaimed &&
      firmGraceClaimedAtMs !== null &&
      activeMs - firmGraceClaimedAtMs < FIRM_GRACE_MS
    ) {
      return 'free';
    }
    return 'firm';
  }
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
  const [firmGraceClaimed, setFirmGraceClaimed] = useState(false);
  const [firmGraceClaimedAtMs, setFirmGraceClaimedAtMs] = useState<number | null>(null);
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
    setFirmGraceClaimed(p.firmGraceClaimed);
    setFirmGraceClaimedAtMs(p.firmGraceClaimedAtMs);
    setHydrated(true);
  }, [loggedIn]);

  // Persist whenever values change (after hydration, to avoid clobbering on load).
  useEffect(() => {
    if (!hydrated || loggedIn) return;
    savePersisted({ activeMs, nudgeDismissed, firmGraceClaimed, firmGraceClaimedAtMs });
  }, [hydrated, loggedIn, activeMs, nudgeDismissed, firmGraceClaimed, firmGraceClaimedAtMs]);

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
        // Cap high enough to let firm-grace fully expire. If we cap at
        // FIRM_MS itself, the timer freezes the moment firm fires and the
        // post-grace state computation (activeMs - firmGraceClaimedAtMs >=
        // FIRM_GRACE_MS) can never become true. FIRM_MS + FIRM_GRACE_MS +
        // a minute of buffer is enough; once the user is firmly gated
        // there's no value in accumulating further.
        setActiveMs((ms) => Math.min(ms + delta, FIRM_MS + FIRM_GRACE_MS + 60_000));
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

  // Use the functional setter form so we snapshot the *current* activeMs
  // (not a stale closure value) when the user clicks the ✕.
  const claimFirmGrace = useCallback(() => {
    setFirmGraceClaimed(true);
    setActiveMs((ms) => {
      setFirmGraceClaimedAtMs(ms);
      return ms;
    });
  }, []);

  const reset = useCallback(() => {
    setActiveMs(0);
    setNudgeDismissed(false);
    setFirmGraceClaimed(false);
    setFirmGraceClaimedAtMs(null);
    clearPersisted();
  }, []);

  const state: BrowseGateState = loggedIn
    ? 'free'
    : computeState(activeMs, nudgeDismissed, firmGraceClaimed, firmGraceClaimedAtMs);

  const value: BrowseGateValue = {
    state,
    activeMs,
    thresholds: { nudgeMs: NUDGE_MS, firmMs: FIRM_MS, firmGraceMs: FIRM_GRACE_MS },
    nudgeDismissed,
    firmGraceClaimed,
    dismissNudge,
    claimFirmGrace,
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
