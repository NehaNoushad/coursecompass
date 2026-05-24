import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { CollegeType, CourseCategoryId, District, Stream } from '@/types';
import {
  COURSE_CATEGORIES,
  DISTRICTS,
  EXAMS,
  STREAM_LABELS,
} from '@/data';
import { useAuth } from '@/lib/auth';
import {
  marksNote,
  recommend,
  type MarksBand,
  type QuizAnswers,
  type Recommendation,
} from '@/lib/recommend';
import { supabase } from '@/lib/supabase';
import { colors, radius, spacing } from '@/constants/theme';
import { Badge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { CollegeCard } from '@/components/college-card';
import { CourseCard } from '@/components/course-card';
import { MultiOptionList, OptionList, type Option } from '@/components/ui/option-list';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';

const TOTAL_STEPS = 6;

const STREAM_OPTIONS: Option<Stream>[] = [
  { value: 'pcm', label: STREAM_LABELS.pcm, description: 'Physics, Chemistry, Maths' },
  { value: 'pcb', label: STREAM_LABELS.pcb, description: 'Physics, Chemistry, Biology' },
  { value: 'commerce', label: STREAM_LABELS.commerce, description: 'Accountancy, Business, Economics' },
  { value: 'arts', label: STREAM_LABELS.arts, description: 'History, Languages, Social Sciences' },
];

const MARKS_OPTIONS: Option<MarksBand>[] = [
  { value: 'above85', label: 'Above 85%' },
  { value: '75to85', label: '75% – 85%' },
  { value: '60to75', label: '60% – 75%' },
  { value: 'below60', label: 'Below 60%' },
];

const COLLEGE_TYPE_OPTIONS: Option<CollegeType>[] = [
  {
    value: 'government',
    label: 'Government',
    description: 'Lowest fees overall but most competitive — merit + entrance score really matter.',
  },
  {
    value: 'aided',
    label: 'Aided',
    description: 'Government-funded with private management. Mid-range fees; often the strongest reputation in arts and sciences.',
  },
  {
    value: 'private',
    label: 'Private / Self-financing',
    description: 'More seats and easier admission, but fees vary widely between colleges and between seat categories.',
  },
];

/** A wrapping group of multi-select chips. */
function MultiSelect<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <View style={styles.chipWrap}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          selected={selected.includes(opt.value)}
          onPress={() => onToggle(opt.value)}
        />
      ))}
    </View>
  );
}

export default function QuizScreen() {
  const [step, setStep] = useState(0);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [marks, setMarks] = useState<MarksBand | null>(null);
  // Districts is multi-select. Empty array = "anywhere in Kerala".
  // The "Anywhere" chip is treated as a clear-all toggle, not a value.
  const [districts, setDistricts] = useState<District[]>([]);
  // `null` = the student hasn't touched the district step yet (so we can
  // gate the Continue button); after first interaction (including picking
  // Anywhere, which sets districts back to [] but flips this to true)
  // the step is satisfied.
  const [districtTouched, setDistrictTouched] = useState(false);
  // College types is multi-select. Empty array = no preference.
  // Same touched flag pattern as district so picking "no preference"
  // still counts as having answered the step.
  const [collegeTypes, setCollegeTypes] = useState<CollegeType[]>([]);
  const [collegeTypeTouched, setCollegeTypeTouched] = useState(false);
  const [interests, setInterests] = useState<CourseCategoryId[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  const [result, setResult] = useState<Recommendation | null>(null);

  const canContinue = [
    streams.length > 0,
    marks !== null,
    districtTouched,
    collegeTypeTouched,
    interests.length > 0,
    true, // exams step is optional
  ][step];

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  const { session, refreshQuizHistory } = useAuth();

  function finish() {
    if (streams.length === 0 || marks === null || !districtTouched || !collegeTypeTouched) return;
    const answers: QuizAnswers = {
      streams,
      marksBand: marks,
      districts,
      collegeTypes,
      interests,
      examsAttempted: exams,
    };
    const recommendation = recommend(answers);
    setResult(recommendation);

    // Persist the attempt for signed-in users so it shows up on /account.
    // Fire-and-forget: a failed insert (table missing, network blip,
    // policy edge case) shouldn't block the user from seeing their
    // results — we just log it.
    if (session) {
      const topCourse = recommendation.courses[0]?.course;
      const topCollege = recommendation.colleges[0]?.college;
      supabase
        .from('quiz_results')
        .insert({
          user_id: session.user.id,
          answers,
          top_course_id: topCourse?.id ?? null,
          top_course_name: topCourse?.name ?? null,
          top_college_id: topCollege?.id ?? null,
          top_college_name: topCollege?.name ?? null,
        })
        .then(({ error }) => {
          if (error) {
            console.warn('quiz_results insert failed:', error.message);
            return;
          }
          // Flip the global hasTakenQuiz flag so the header drops the
          // "Take the quiz" CTA and hero CTAs relabel immediately.
          refreshQuizHistory();
        });
    }
  }

  function restart() {
    setStep(0);
    setStreams([]);
    setMarks(null);
    setDistricts([]);
    setDistrictTouched(false);
    setCollegeTypes([]);
    setCollegeTypeTouched(false);
    setInterests([]);
    setExams([]);
    setResult(null);
  }

  if (result) {
    return <QuizResult result={result} marks={marks} onRestart={restart} />;
  }

  return (
    <Screen noFooter>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
      </View>
      <Text variant="label" muted style={styles.stepCount}>
        Step {step + 1} of {TOTAL_STEPS}
      </Text>

      {step === 0 && (
        <Question
          title="Which stream did you study in 12th?"
          subtitle="Pick one — or both if you studied bio-maths (PCM + PCB)."
        >
          <MultiOptionList
            options={STREAM_OPTIONS}
            selected={streams}
            onToggle={(v) => setStreams((prev) => toggle(prev, v))}
          />
        </Question>
      )}

      {step === 1 && (
        <Question title="Roughly what marks did you get?" subtitle="An estimate is fine — it just helps set expectations.">
          <OptionList options={MARKS_OPTIONS} value={marks} onChange={setMarks} />
        </Question>
      )}

      {step === 2 && (
        <Question
          title="Where would you like to study?"
          subtitle="Pick one or more districts — or choose anywhere in Kerala."
        >
          <View style={styles.chipWrap}>
            <Chip
              label="Anywhere in Kerala"
              selected={districts.length === 0 && districtTouched}
              onPress={() => {
                setDistricts([]);
                setDistrictTouched(true);
              }}
            />
            {DISTRICTS.map((d) => (
              <Chip
                key={d}
                label={d}
                selected={districts.includes(d)}
                onPress={() => {
                  setDistricts((prev) => toggle(prev, d));
                  setDistrictTouched(true);
                }}
              />
            ))}
          </View>
        </Question>
      )}

      {step === 3 && (
        <Question
          title="What type of college are you looking for?"
          subtitle="Fees vary too much within categories to filter by directly — but the type of college (government / aided / private) is a stable signal of what to expect. Pick one or more, or skip with No preference."
        >
          <View style={styles.chipWrap}>
            <Chip
              label="No preference"
              selected={collegeTypes.length === 0 && collegeTypeTouched}
              onPress={() => {
                setCollegeTypes([]);
                setCollegeTypeTouched(true);
              }}
            />
            {COLLEGE_TYPE_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={collegeTypes.includes(opt.value)}
                onPress={() => {
                  setCollegeTypes((prev) => toggle(prev, opt.value));
                  setCollegeTypeTouched(true);
                }}
              />
            ))}
          </View>
          <View style={styles.collegeTypeNotes}>
            {COLLEGE_TYPE_OPTIONS.map((opt) => (
              <View key={opt.value} style={styles.collegeTypeNote}>
                <Text variant="label">{opt.label}</Text>
                <Text variant="bodySmall" muted style={{ marginTop: spacing.xs }}>
                  {opt.description}
                </Text>
              </View>
            ))}
          </View>
        </Question>
      )}

      {step === 4 && (
        <Question title="What are you interested in?" subtitle="Pick one or more fields. We'll match courses and colleges to these.">
          <MultiSelect
            options={COURSE_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
            selected={interests}
            onToggle={(v) => setInterests((prev) => toggle(prev, v))}
          />
        </Question>
      )}

      {step === 5 && (
        <Question
          title="Any entrance exams you've taken or plan to?"
          subtitle="Optional — pick any that apply, or tap None if you haven't taken any."
        >
          <View style={styles.chipWrap}>
            {/* "None" is a clear-all toggle. Selected state is implicit
                when no exams are picked — clicking it explicitly clears
                whatever was selected. */}
            <Chip
              label="None"
              selected={exams.length === 0}
              onPress={() => setExams([])}
            />
            {EXAMS.map((e) => (
              <Chip
                key={e.id}
                label={e.name}
                selected={exams.includes(e.id)}
                onPress={() => setExams((prev) => toggle(prev, e.id))}
              />
            ))}
          </View>
        </Question>
      )}

      <View style={styles.nav}>
        {step > 0 ? (
          <Button label="Back" variant="ghost" onPress={() => setStep((s) => s - 1)} />
        ) : (
          <View />
        )}
        {step < TOTAL_STEPS - 1 ? (
          <Button
            label="Continue"
            onPress={() => setStep((s) => s + 1)}
            disabled={!canContinue}
            style={!canContinue ? styles.disabled : undefined}
          />
        ) : (
          <Button label="See my matches" onPress={finish} />
        )}
      </View>
    </Screen>
  );
}

function Question({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.question}>
      <Text variant="title">{title}</Text>
      <Text muted style={styles.subtitle}>
        {subtitle}
      </Text>
      <View style={styles.questionBody}>{children}</View>
    </View>
  );
}

function MatchReasons({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) return null;
  return (
    <View style={styles.reasons}>
      {reasons.map((r) => (
        <Text key={r} variant="caption" color={colors.primaryDark}>
          • {r}
        </Text>
      ))}
    </View>
  );
}

function QuizResult({
  result,
  marks,
  onRestart,
}: {
  result: Recommendation;
  marks: MarksBand | null;
  onRestart: () => void;
}) {
  return (
    <Screen noFooter>
      <Badge label="Your results" tone="success" />
      <Text variant="title" style={{ marginTop: spacing.sm }}>
        Here&apos;s what fits you
      </Text>
      {marks ? (
        <Card muted style={styles.marksCard}>
          <Text variant="bodySmall">{marksNote(marks)}</Text>
        </Card>
      ) : null}

      <Text variant="heading" style={styles.resultSection}>
        Courses that fit you
      </Text>
      <View style={styles.resultGrid}>
        {result.courses.map((m) => (
          <View key={m.course.id} style={styles.resultCell}>
            <CourseCard course={m.course} from="quiz" />
            <MatchReasons reasons={m.reasons} />
          </View>
        ))}
      </View>

      <Text variant="heading" style={styles.resultSection}>
        Colleges to consider
      </Text>
      {result.colleges.length === 0 ? (
        <Card muted>
          <Text variant="subheading">No exact college matches</Text>
          <Text muted style={{ marginTop: spacing.sm }}>
            Your district and budget filters were strict. Try retaking the quiz with
            &quot;Anywhere in Kerala&quot; or a higher fee preference.
          </Text>
        </Card>
      ) : (
        <View style={styles.resultGrid}>
          {result.colleges.map((m) => (
            <View key={m.college.id} style={styles.resultCell}>
              <CollegeCard college={m.college} from="quiz" />
              <MatchReasons reasons={m.reasons} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.resultNav}>
        <Button label="Retake the quiz" variant="secondary" onPress={onRestart} />
        <LinkButton href="/colleges" label="Browse all colleges" variant="ghost" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  stepCount: {
    marginTop: spacing.sm,
  },
  question: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  questionBody: {
    marginTop: spacing.xl,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  collegeTypeNotes: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  collegeTypeNote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryLight,
    paddingLeft: spacing.md,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.x2l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  disabled: {
    opacity: 0.4,
  },
  marksCard: {
    marginTop: spacing.lg,
  },
  resultSection: {
    marginTop: spacing.x2l,
    marginBottom: spacing.md,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  resultCell: {
    flexGrow: 1,
    flexBasis: 300,
    maxWidth: 540,
    gap: spacing.sm,
  },
  reasons: {
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  resultNav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
