import { ScrollView, StyleSheet, View } from 'react-native';

import { SiteHeader } from '@/components/site-header';
import { SkyCourses } from '@/components/sky-courses';
import { SkyFeatures } from '@/components/sky-features';
import { SkyFinal } from '@/components/sky-final';
import { SkyHero } from '@/components/sky-hero';
import { SkyHow } from '@/components/sky-how';
import { SkyStats } from '@/components/sky-stats';
import { colors } from '@/constants/theme';

/**
 * Home page — narrative flow:
 *   1. Hero (sky / paper-plane / "Look up. Way up.")
 *   2. Stats (382 colleges, 176 courses, 37 exams, 6 quiz questions)
 *   3. Features ("Three ways to figure out what fits")
 *   4. How it works (4 steps along a flight path)
 *   5. Courses peek (4 sample tiles from the 176-course catalogue)
 *   6. Final CTA ("Where will you go?")
 *
 * Each section is its own component under `components/sky-*.tsx` so the
 * page reads top-to-bottom without the visual logic crowding this file.
 */
export default function HomeScreen() {
  return (
    <View style={styles.root}>
      <SiteHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SkyHero />
        <SkyStats />
        <SkyFeatures />
        <SkyHow />
        <SkyCourses />
        <SkyFinal />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
