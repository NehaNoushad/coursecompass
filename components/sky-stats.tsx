/**
 * Sky stats — the home page's proof-strip below the hero. Four big
 * numbers in sky-pale cards on a paper background, matching prototype 4.
 *
 * Each number eases up from 0 to its target value the first time the
 * section scrolls into view. Uses IntersectionObserver on web to fire
 * exactly once when the section enters the viewport; on native the
 * observer doesn't exist, so the animation runs on mount as a fallback.
 */

import { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';
import { COLLEGES, COURSES, EXAMS } from '@/data';
import { supabase } from '@/lib/supabase';

const SESSION_KEY = 'cc.visitorCounted.v1';

const ANIM_DURATION_MS = 1600;

// Same narrow breakpoint as the rest of the mobile pass — see
// `components/site-header.tsx` for the rationale.
const IS_NARROW = Dimensions.get('window').width < 640;

export function SkyStats() {
  const sectionRef = useRef<View>(null);
  const inView = useInViewport(sectionRef);
  const visitors = useVisitorCount();

  // Stats are recomputed each render so visitor count flows in once
  // the RPC resolves. Catalogue counts come from the live seed.
  const stats = [
    { num: COLLEGES.length, label: 'Colleges' },
    { num: COURSES.length, label: 'Courses' },
    { num: EXAMS.length, label: 'Entrance exams' },
    { num: visitors ?? 0, label: 'Visitors' },
  ];

  return (
    <View ref={sectionRef} style={styles.section}>
      <View style={styles.row}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.card}>
            <CountUp target={stat.num} active={inView && stat.num > 0} />
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Reads + increments the site-wide visitor counter via two Supabase RPCs.
 * Increments once per browser session (sessionStorage gate prevents
 * inflating the number on every refresh / route change). Returns null
 * while the network call is in flight; the visitor card just stays at
 * 0 / unanimated until the real value arrives.
 *
 * Pre-DB-setup fallback: if the RPCs don't exist yet, we just keep
 * returning null silently. Visitor card shows 0 — better than a crash.
 */
function useVisitorCount(): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // sessionStorage is web-only; on native we just always read.
      const alreadyCounted =
        typeof window !== 'undefined' &&
        window.sessionStorage?.getItem(SESSION_KEY) === '1';
      const rpc = alreadyCounted ? 'get_visitor_count' : 'increment_visitors';
      const { data, error } = await supabase.rpc(rpc);
      if (cancelled) return;
      if (error) {
        // Function missing (pre-setup) or network blip — silent fallback.
        if (!/Could not find the function/i.test(error.message)) {
          console.warn(`${rpc} failed:`, error.message);
        }
        return;
      }
      if (!alreadyCounted && typeof window !== 'undefined') {
        try {
          window.sessionStorage?.setItem(SESSION_KEY, '1');
        } catch {
          // private mode — ignore
        }
      }
      if (typeof data === 'number') setCount(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return count;
}

/**
 * Renders a number that animates from 0 to `target` over ANIM_DURATION_MS
 * once `active` flips true. ease-out cubic so the count visibly slows as
 * it approaches the target rather than ticking linearly. Only runs once
 * per mount — repeat scrolls past the section don't retrigger.
 */
function CountUp({ target, active }: { target: number; active: boolean }) {
  const [value, setValue] = useState(0);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!active || ranRef.current) return;
    ranRef.current = true;

    const startedAt =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    let frameId: number;

    function tick(now: number) {
      const elapsed = now - startedAt;
      const t = Math.min(elapsed / ANIM_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [active, target]);

  return <Text style={styles.num}>{value.toLocaleString()}</Text>;
}

/**
 * Returns true once the element first enters the viewport. Uses
 * IntersectionObserver on web; on native falls back to "always true"
 * since we don't have a cross-platform native observer here and the
 * page layout means the stats section is visible after a short scroll
 * anyway.
 */
function useInViewport(ref: React.RefObject<View | null>): boolean {
  const [visible, setVisible] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const node = ref.current as unknown as Element | null;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect(); // one-shot
            break;
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.background,
    paddingVertical: spacing.x4l,
    paddingHorizontal: IS_NARROW ? layout.gutterNarrow : layout.gutter,
    alignItems: 'center',
  },
  row: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    flexGrow: 1,
    // Narrow: 140 basis lets two cards sit side-by-side at 390px
    // (instead of stacking into 4 tall rows). Desktop keeps 220.
    flexBasis: IS_NARROW ? 140 : 220,
    backgroundColor: colors.skyPale,
    borderRadius: radius.xl,
    paddingVertical: IS_NARROW ? spacing.xl : spacing.x2l,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  num: {
    fontFamily: fontFamily.displayHeavy,
    // 80px reads as imposing on desktop but eats half a phone screen
    // in vertical space when cards stack — 48 keeps the proof-strip
    // proportional to its surroundings.
    fontSize: IS_NARROW ? 48 : 80,
    lineHeight: IS_NARROW ? 48 : 80,
    color: colors.primary,
    letterSpacing: IS_NARROW ? -1.5 : -3,
  },
  label: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: spacing.md,
  },
});
