/**
 * App-level metadata. The brand name is a working-title placeholder —
 * change it here (one place) once the real name is decided.
 */
export const APP_NAME = 'CourseCompass';
export const APP_TAGLINE = 'Find the right course and college after 12th — in Kerala.';

/**
 * Browse-gate thresholds.
 *
 * Only *active* browsing time counts — the timer pauses when the tab is
 * hidden (web) or the app is backgrounded (native). The progression is:
 *
 *   free                                  → nudge                  → firm
 *   (0 .. NUDGE_MINUTES)   reaches nudge   (NUDGE .. FIRM)    reaches firm
 *                          a dismissable                       blocking signup
 *                          signup prompt                       overlay
 *
 * NUDGE_MINUTES matches CLAUDE.md's "~10 minutes" rule. FIRM_MINUTES is the
 * grace period after the nudge before the gate becomes blocking, so a user
 * who dismisses the nudge still has a couple of minutes to finish what they
 * were reading.
 */
export const BROWSE_GATE_NUDGE_MINUTES = 10;
export const BROWSE_GATE_FIRM_MINUTES = 12;
/**
 * Extra browsing time granted once the user dismisses the firm modal via
 * the close (✕) button. The X is available only the first time the firm
 * modal appears; after this grace runs out the modal returns without an X
 * and signup is truly required.
 */
export const BROWSE_GATE_FIRM_GRACE_MINUTES = 2;

/**
 * Monetization master switch. CLAUDE.md mandates 2026 stays entirely free;
 * the paywall structure is built but inactive until 2027.
 */
export const MONETIZATION_ENABLED = false;
