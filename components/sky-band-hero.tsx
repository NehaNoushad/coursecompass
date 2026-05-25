/**
 * SkyBandHero — the standardised sky-strip hero band used as the
 * top-of-page treatment across the catalogue, detail pages, /courses,
 * and /account. Centralises the:
 *
 *   - sky-bright → sky-mid vertical gradient
 *   - three white cloud puffs at canonical sizes + positions
 *   - 60px transparent → paper fade at the lower edge (so the band
 *     doesn't end on a hard line against the page body)
 *   - max-content-width centring and consistent horizontal padding
 *
 * Pages render whatever content they need as children — eyebrow chips,
 * headlines, breadcrumbs, avatars, action buttons, tabs. Only the body
 * varies; the sky around it stays identical so the product reads as a
 * single visual family.
 *
 * To allow narrow-screen tuning without forking the component, the
 * cloud sizes shrink on phones via the same `IS_NARROW` snapshot used
 * elsewhere in the codebase. Three cloud `positions` keep the puffs in
 * canonical spots so two adjacent pages don't have visually shifted
 * skies.
 */

import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { Cloud } from '@/components/cloud';
import { colors, layout, spacing } from '@/constants/theme';

const IS_NARROW = Dimensions.get('window').width < 640;

interface Props {
  children: ReactNode;
  /** Optional override for the band's min-height. Defaults to a value
   * that comfortably fits ~2 lines of headline + eyebrow + pill row. */
  minHeight?: number;
}

export function SkyBandHero({ children, minHeight }: Props) {
  return (
    <View
      style={[
        styles.band,
        { minHeight: minHeight ?? (IS_NARROW ? 240 : 300) },
      ]}
    >
      <LinearGradient
        colors={[colors.skyBright, colors.skyMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Three canonical cloud positions — same across every page so
          the sky reads as continuous when the user navigates. */}
      <View style={[styles.cloud, styles.cloud1]}>
        <Cloud size={IS_NARROW ? 200 : 260} />
      </View>
      <View style={[styles.cloud, styles.cloud2]}>
        <Cloud size={IS_NARROW ? 140 : 180} />
      </View>
      <View style={[styles.cloud, styles.cloud3]}>
        <Cloud size={IS_NARROW ? 160 : 220} />
      </View>

      {/* Soft fade into the body — same on every page. */}
      <LinearGradient
        colors={['transparent', colors.background]}
        style={styles.fade}
      />

      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'relative',
    overflow: 'hidden',
    paddingTop: IS_NARROW ? spacing.x3l : spacing.x4l,
    paddingBottom: IS_NARROW ? spacing.x3l : spacing.x4l + spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    pointerEvents: 'none',
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    zIndex: 1,
  },

  // Canonical cloud positions — kept in sync with components/colleges-hero.tsx
  // and the design_prototypes. Percentage-based so they hold across widths.
  cloud: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  cloud1: {
    top: 24,
    right: '5%',
    opacity: 0.9,
  },
  cloud2: {
    bottom: '30%',
    right: '22%',
    opacity: 0.65,
  },
  cloud3: {
    bottom: -10,
    left: '-2%',
    opacity: 0.6,
  },
});
