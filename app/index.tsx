import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SkyHero } from '@/components/sky-hero';
import { Text } from '@/components/ui/text';
import { colors, layout, spacing } from '@/constants/theme';

const PATHS = [
  {
    eyebrow: 'Not sure where to start?',
    title: 'Take the quiz',
    body: 'Answer a few questions about your stream, marks, interests and budget. Get a shortlist of courses and colleges that actually fit you.',
    cta: 'Start the quiz',
    href: '/quiz' as const,
  },
  {
    eyebrow: 'Know what you want?',
    title: 'Browse colleges',
    body: 'Explore Kerala colleges and courses directly. Filter by district, course, entrance exam and fees.',
    cta: 'Browse the catalogue',
    href: '/colleges' as const,
  },
];

/**
 * Home page. The hero is full-bleed sky (see components/sky-hero.tsx);
 * the two-paths section below is the existing layout, kept in place
 * until Step 5 of the design port rebuilds the rest of the page
 * (stats / features / how-it-works / courses / final CTA).
 */
export default function HomeScreen() {
  return (
    <View style={styles.root}>
      <SiteHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SkyHero />

        <View style={styles.belowHero}>
          <View style={styles.paths}>
            {PATHS.map((path) => (
              <Card key={path.title} style={styles.pathCard}>
                <Text variant="label" color={colors.primary}>
                  {path.eyebrow}
                </Text>
                <Text variant="heading" style={styles.pathTitle}>
                  {path.title}
                </Text>
                <Text muted style={styles.pathBody}>
                  {path.body}
                </Text>
                <LinkButton href={path.href} label={path.cta} variant="secondary" />
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  belowHero: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.x2l,
  },
  paths: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  pathCard: {
    flexGrow: 1,
    flexBasis: 320,
    maxWidth: layout.maxContentWidth,
    gap: spacing.sm,
  },
  pathTitle: {
    marginTop: spacing.xs,
  },
  pathBody: {
    marginBottom: spacing.lg,
  },
});
