import { StyleSheet, View } from 'react-native';

import { APP_TAGLINE } from '@/constants/app';
import { colors, layout, spacing } from '@/constants/theme';
import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';

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

export default function HomeScreen() {
  return (
    <Screen>
      {/* Hero */}
      <View style={styles.hero}>
        <Text variant="label" color={colors.primary}>
          FOR KERALA 12TH-PASS STUDENTS
        </Text>
        <Text variant="display" style={styles.headline}>
          Confused about what to do after 12th?
        </Text>
        <Text variant="subheading" muted style={styles.sub}>
          {APP_TAGLINE}
        </Text>
        <View style={styles.heroCtas}>
          <LinkButton href="/quiz" label="Take the quiz" size="lg" />
          <LinkButton href="/colleges" label="Browse colleges" size="lg" variant="ghost" />
        </View>
      </View>

      {/* Two paths */}
      <View style={styles.paths}>
        {PATHS.map((path) => (
          <Card key={path.title} style={styles.pathCard}>
            <Text variant="label" color={colors.accentDark}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingVertical: spacing.x2l,
    maxWidth: 720,
  },
  headline: {
    marginTop: spacing.md,
  },
  sub: {
    marginTop: spacing.md,
  },
  heroCtas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  paths: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.lg,
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
