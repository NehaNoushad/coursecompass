/**
 * Sky courses peek — a sample of 4 courses presented as gradient tiles
 * on a white paper background. Each tile is an aspect-ratio 3:4 panel
 * with decorative white-translucent circles in the top-right and the
 * course label + name pinned to the bottom-left. Matches prototype 4.
 */

import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import {
  colors,
  fontFamily,
  fontWeight,
  layout,
  radius,
  spacing,
} from '@/constants/theme';

type GradientStops = [ColorValue, ColorValue];

interface CourseTile {
  label: string;
  name: string;
  gradient: GradientStops;
  darkText?: boolean;
}

const TILES: CourseTile[] = [
  {
    label: 'Engineering',
    name: 'B.Tech Computer Science',
    gradient: [colors.skyBright, colors.skyMid],
  },
  {
    label: 'Pure Sciences',
    name: 'BS-MS Integrated Sciences',
    gradient: [colors.skyMid, colors.skyDeep],
  },
  {
    label: 'Design',
    name: 'B.Des Communication',
    gradient: [colors.sun, colors.accent],
    darkText: true,
  },
  {
    label: 'Hospitality',
    name: 'B.HMCT Hotel Management',
    gradient: [colors.skyDeep, colors.primaryDark],
  },
];

export function SkyCourses() {
  return (
    <View style={styles.section}>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>SOME OF THE 176 COURSES</Text>
        <Text style={styles.title}>
          {'There\'s more after 12th than "engineering or medicine."'}
        </Text>

        <View style={styles.grid}>
          {TILES.map((tile) => {
            const textColor = tile.darkText ? colors.text : colors.textInverse;
            const labelColor = tile.darkText
              ? 'rgba(13, 40, 64, 0.65)'
              : 'rgba(255, 255, 255, 0.85)';
            return (
              <View key={tile.name} style={styles.tile}>
                <LinearGradient
                  colors={tile.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                {/* Decorative translucent circles in the top-right */}
                <View style={styles.bigPuff} pointerEvents="none" />
                <View style={styles.smallPuff} pointerEvents="none" />
                <View style={styles.tileBody}>
                  <Text style={[styles.tileLabel, { color: labelColor }]}>
                    {tile.label.toUpperCase()}
                  </Text>
                  <Text style={[styles.tileName, { color: textColor }]}>
                    {tile.name}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.background,
    paddingVertical: spacing.x4l,
    paddingHorizontal: spacing.xl,
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    letterSpacing: 2,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.displayHeavy,
    fontSize: 44,
    lineHeight: 48,
    color: colors.text,
    letterSpacing: -1.5,
    marginBottom: spacing.x2l,
    maxWidth: 760,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    position: 'relative',
    flexGrow: 1,
    flexBasis: 220,
    aspectRatio: 3 / 4,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  bigPuff: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: -40,
    right: -40,
  },
  smallPuff: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: 30,
    right: 20,
  },
  tileBody: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.xl,
    zIndex: 1,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  tileName: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
});
