/**
 * App-level metadata. APP_NAME is the brand — change it here (one place)
 * and it ripples to the SiteHeader, SiteFooter, hero copy, browse-gate
 * overlay, and any other component that references it.
 */
export const APP_NAME = 'Paper Plane';

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

