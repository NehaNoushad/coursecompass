/**
 * Quiz recommendation engine. Pure functions over the seed data — given the
 * student's answers, it scores courses and colleges and returns ranked lists.
 *
 * Scoring is intentionally simple and transparent: every match carries a
 * human-readable reason so the result screen can explain *why* something
 * was suggested.
 *
 * The headline output is `paths` — one per interest the student picked, each
 * carrying NEW information they didn't type in: how many courses their stream
 * actually unlocks, which entrance exams gate the field (and whether they've
 * attempted one), where the field leads (career outlook), and how many
 * colleges offer it near them. `discoveries` goes one step further and
 * suggests adjacent fields the student *didn't* pick — the "have you
 * considered…" a real counsellor would add. `blocked` is the honest
 * counterpart: interests the student picked that their stream can't enter.
 */

import type {
  College,
  CollegeType,
  Course,
  CourseCategory,
  CourseCategoryId,
  District,
  Exam,
  Stream,
} from '@/types';
import {
  CAREER_OUTLOOK,
  CATEGORY_BY_ID,
  COLLEGES,
  COURSES,
  EXAM_BY_ID,
  STREAM_LABELS,
  type CareerPath,
} from '@/data';

export type MarksBand = 'below60' | '60to75' | '75to85' | 'above85';

export const MARKS_LABELS: Record<MarksBand, string> = {
  above85: 'Above 85%',
  '75to85': '75% – 85%',
  '60to75': '60% – 75%',
  below60: 'Below 60%',
};

export interface QuizAnswers {
  /**
   * Streams the student studied in 12th. Usually one (e.g. `['pcm']`)
   * but bio-maths students may have studied both PCM and PCB and should
   * pick both — the engine ORs eligibility across the array.
   */
  streams: Stream[];
  marksBand: MarksBand;
  /**
   * Districts the student wants to study in. Empty array means
   * "anywhere in Kerala" — no district filter applied.
   */
  districts: District[];
  /**
   * Types of college the student is open to (government, aided,
   * private/self-financing). Empty array means "no preference".
   * Replaced the older `budget: FeeBand` question because the same
   * fee band varies wildly across seat-categories (merit vs management
   * vs NRI quota) — college type is a more stable, meaningful signal.
   */
  collegeTypes: CollegeType[];
  interests: CourseCategoryId[];
  examsAttempted: string[];
}

export interface CourseMatch {
  course: Course;
  reasons: string[];
}

export interface CollegeMatch {
  college: College;
  reasons: string[];
}

/** An entrance exam gating a path, flagged if the student has attempted it. */
export interface PathExam {
  exam: Exam;
  attempted: boolean;
}

/**
 * One recommended path = one interest the student picked, enriched with
 * everything they need to judge it: fit reasons, honest cautions, the exam
 * gate, career outlook, and college availability.
 */
export interface PathRecommendation {
  category: CourseCategory;
  /** Reasons grounded in the student's OTHER answers — never "you picked it". */
  whyItFits: string[];
  /** Honest warnings: un-attempted exam gates, no colleges in their district… */
  cautions: string[];
  /** Stream-eligible courses, best first (attempted-exam unlocks → direct admission → rest). */
  courses: Course[];
  /** Exams that gate the eligible courses, attempted ones first. */
  exams: PathExam[];
  /** How many eligible courses need no entrance exam at all. */
  directAdmissionCount: number;
  /** Where the field leads — top roles + honest scope (no salary). */
  careers: CareerPath[];
  /** Colleges matching the student's district + type preferences. */
  collegeCount: number;
  /** Colleges anywhere in Kerala (type preference still applied). */
  collegeCountAnywhere: number;
}

/** A field the student didn't pick but should know exists. */
export interface Discovery {
  category: CourseCategory;
  /** Why we're showing it — adjacency to a picked interest, or stream fit. */
  reason: string;
  /** Up to 3 example courses open to the student's stream. */
  courses: Course[];
}

/** A picked interest the student's stream can't actually enter. */
export interface BlockedInterest {
  category: CourseCategory;
  note: string;
}

export interface Recommendation {
  paths: PathRecommendation[];
  discoveries: Discovery[];
  blocked: BlockedInterest[];
  courses: CourseMatch[];
  colleges: CollegeMatch[];
}

// User feedback: the previous caps of 8 / 12 hid most of the matches
// from view ("where is the rest of the compatible courses?"). Bumped
// so the results page lists everything that genuinely fits the
// student's stream + interests, sorted by score — top picks still
// surface at the top, but the long tail isn't truncated. The hard
// cap stays just to bound the page if every catalogue item somehow
// matches.
const MAX_COURSES = 30;
const MAX_COLLEGES = 30;

/** Rank courses against the student's stream(s), interests and exams attempted. */
function rankCourses(answers: QuizAnswers): CourseMatch[] {
  const eligible = COURSES.filter((c) =>
    c.streams.some((s) => answers.streams.includes(s)),
  );

  const scored = eligible
    .map((course) => {
      let score = 0;
      const reasons: string[] = [];

      if (answers.interests.includes(course.categoryId)) {
        score += 5;
        reasons.push(
          `Matches your interest in ${CATEGORY_BY_ID[course.categoryId]?.name ?? 'this field'}`,
        );
      }
      const matchedExam = course.examIds.find((e) => answers.examsAttempted.includes(e));
      if (matchedExam) {
        score += 3;
        reasons.push(`You've attempted ${EXAM_BY_ID[matchedExam]?.name ?? 'a required exam'}`);
      }
      return { course, score, reasons };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // Fallback: if nothing matched, still show courses open to the stream.
  const list =
    scored.length > 0
      ? scored
      : eligible.map((course) => ({
          course,
          score: 0,
          reasons: ['Open to your stream'],
        }));

  return list.slice(0, MAX_COURSES).map(({ course, reasons }) => ({ course, reasons }));
}

/** Rank colleges against the student's district(s), college type(s) and interests. */
function rankColleges(answers: QuizAnswers): CollegeMatch[] {
  const anyDistrict = answers.districts.length === 0;
  const anyType = answers.collegeTypes.length === 0;
  const scored = COLLEGES.filter((college) => {
    if (!anyDistrict && !answers.districts.includes(college.district)) return false;
    if (!anyType && !answers.collegeTypes.includes(college.type)) return false;
    return college.categories.some((cat) => answers.interests.includes(cat));
  })
    .map((college) => {
      let score = 1;
      const reasons: string[] = [];

      const matchedCats = college.categories.filter((cat) =>
        answers.interests.includes(cat),
      );
      if (matchedCats.length > 0) {
        score += matchedCats.length * 2;
        reasons.push(
          `Offers ${matchedCats
            .map((c) => CATEGORY_BY_ID[c]?.name ?? c)
            .join(', ')}`,
        );
      }
      if (!anyDistrict && answers.districts.includes(college.district)) {
        score += 2;
        reasons.push('In one of your preferred districts');
      }
      if (!anyType && answers.collegeTypes.includes(college.type)) {
        score += 1;
        reasons.push(`${TYPE_REASON[college.type]} (your preferred type)`);
      }
      return { college, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, MAX_COLLEGES).map(({ college, reasons }) => ({ college, reasons }));
}

const TYPE_REASON: Record<CollegeType, string> = {
  government: 'Government college',
  aided: 'Aided college',
  private: 'Private / self-financing',
};

// ─── Path recommendations ───────────────────────────────────────────────────

function streamsLabel(streams: Stream[]): string {
  return streams.map((s) => STREAM_LABELS[s]).join(' / ');
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/**
 * Build one enriched path per picked interest. Interests whose courses are
 * all closed to the student's stream land in `blocked` with an honest note
 * instead of silently vanishing.
 */
function buildPaths(answers: QuizAnswers): {
  paths: PathRecommendation[];
  blocked: BlockedInterest[];
} {
  const scored: (PathRecommendation & { score: number })[] = [];
  const blocked: BlockedInterest[] = [];
  const anyDistrict = answers.districts.length === 0;
  const anyType = answers.collegeTypes.length === 0;

  for (const catId of answers.interests) {
    const category = CATEGORY_BY_ID[catId];
    if (!category) continue;

    const catCourses = COURSES.filter((c) => c.categoryId === catId);
    const eligible = catCourses.filter((c) =>
      c.streams.some((s) => answers.streams.includes(s)),
    );

    if (eligible.length === 0) {
      const needed = Array.from(new Set(catCourses.flatMap((c) => c.streams)))
        .map((s) => STREAM_LABELS[s])
        .join(' or ');
      blocked.push({
        category,
        note: `${category.name} courses need ${needed} in 12th — they aren't open to ${streamsLabel(answers.streams)}. If this field matters to you, ask about bridge/diploma routes.`,
      });
      continue;
    }

    // The exam gate across the eligible courses, attempted ones first.
    const examIds = Array.from(new Set(eligible.flatMap((c) => c.examIds)));
    const exams: PathExam[] = examIds
      .map((id) => EXAM_BY_ID[id])
      .filter((e): e is Exam => Boolean(e))
      .map((exam) => ({ exam, attempted: answers.examsAttempted.includes(exam.id) }))
      .sort((a, b) => Number(b.attempted) - Number(a.attempted));
    const attempted = exams.filter((e) => e.attempted);
    const directAdmissionCount = eligible.filter((c) => c.examIds.length === 0).length;

    // Rank courses inside the path: unlocked by an attempted exam first,
    // then direct admission, then the rest.
    const courseRank = (c: Course) =>
      (c.examIds.some((e) => answers.examsAttempted.includes(e)) ? 2 : 0) +
      (c.examIds.length === 0 ? 1 : 0);
    const courses = [...eligible].sort((a, b) => courseRank(b) - courseRank(a));

    // College availability, honest about what the filters cost.
    const offeringAll = COLLEGES.filter((col) => col.categories.includes(catId));
    const offeringTyped = offeringAll.filter(
      (col) => anyType || answers.collegeTypes.includes(col.type),
    );
    const near = anyDistrict
      ? offeringTyped
      : offeringTyped.filter((col) => answers.districts.includes(col.district));

    const whyItFits: string[] = [
      `${plural(eligible.length, 'course')} open to ${streamsLabel(answers.streams)}`,
    ];
    if (attempted.length > 0) {
      const unlocked = eligible.filter((c) =>
        c.examIds.some((e) => answers.examsAttempted.includes(e)),
      ).length;
      whyItFits.push(
        `You've attempted ${attempted.map((e) => e.exam.name).join(', ')} — the gate for ${unlocked} of these courses`,
      );
    }
    if (directAdmissionCount > 0) {
      whyItFits.push(
        `${plural(directAdmissionCount, 'course')} need${directAdmissionCount === 1 ? 's' : ''} no entrance exam — direct admission on 12th marks`,
      );
    }
    if (near.length > 0) {
      whyItFits.push(
        anyDistrict
          ? `${plural(near.length, 'college')} across Kerala offer${near.length === 1 ? 's' : ''} it`
          : `${plural(near.length, 'college')} in ${answers.districts.join(' / ')} offer${near.length === 1 ? 's' : ''} it`,
      );
    }

    const cautions: string[] = [];
    if (exams.length > 0 && attempted.length === 0 && directAdmissionCount === 0) {
      cautions.push(
        'Every course here needs an entrance exam you haven’t attempted yet — check application dates before counting on this path.',
      );
    }
    if (!anyDistrict && near.length === 0 && offeringTyped.length > 0) {
      cautions.push(
        `None in ${answers.districts.join(' / ')} — but ${plural(offeringTyped.length, 'college')} elsewhere in Kerala offer it. Worth widening your search?`,
      );
    }
    if (offeringTyped.length === 0 && offeringAll.length > 0) {
      cautions.push(
        `No colleges of your preferred type offer this — ${plural(offeringAll.length, 'college')} of other types do.`,
      );
    }
    if (offeringAll.length === 0) {
      cautions.push('We don’t have college data for this field yet — check back soon.');
    }

    scored.push({
      category,
      whyItFits,
      cautions,
      courses,
      exams,
      directAdmissionCount,
      careers: (CAREER_OUTLOOK[catId] ?? []).slice(0, 3),
      collegeCount: near.length,
      collegeCountAnywhere: offeringTyped.length,
      // Transparent ordering: an exam already in hand is the strongest
      // signal, then college availability, then breadth of choice.
      score:
        attempted.length * 4 +
        (near.length > 0 ? 2 : 0) +
        (directAdmissionCount > 0 ? 1 : 0) +
        Math.min(eligible.length, 10) * 0.1,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return { paths: scored.map(({ score: _score, ...path }) => path), blocked };
}

// ─── Discoveries (fields the student didn't pick) ───────────────────────────

/**
 * Which fields sit "next door" to each interest — close enough in subject
 * matter or career shape that a student who picked one should at least know
 * the other exists. Hand-curated, intentionally small.
 */
const ADJACENT: Record<CourseCategoryId, CourseCategoryId[]> = {
  engineering: ['architecture', 'polytechnic', 'science', 'design'],
  medical: ['nursing', 'pharmacy', 'paramedical', 'ayush'],
  dental: ['medical', 'paramedical', 'pharmacy'],
  ayush: ['medical', 'pharmacy', 'nursing'],
  nursing: ['paramedical', 'pharmacy', 'medical'],
  paramedical: ['nursing', 'pharmacy', 'science'],
  pharmacy: ['science', 'paramedical', 'medical'],
  architecture: ['engineering', 'design', 'fine-arts'],
  agriculture: ['veterinary', 'fisheries', 'science'],
  veterinary: ['agriculture', 'fisheries', 'medical'],
  fisheries: ['agriculture', 'veterinary', 'science'],
  law: ['arts', 'commerce'],
  science: ['engineering', 'agriculture', 'education', 'paramedical'],
  commerce: ['law', 'arts', 'hotel-management'],
  arts: ['law', 'education', 'fine-arts', 'design'],
  design: ['fine-arts', 'architecture', 'arts'],
  'hotel-management': ['commerce', 'arts'],
  'fine-arts': ['design', 'arts', 'education'],
  education: ['arts', 'science'],
  polytechnic: ['engineering'],
};

/**
 * Suggest up to 3 fields adjacent to the student's interests that they
 * didn't pick and that their stream can actually enter. If every picked
 * interest turned out to be blocked (`pathsEmpty`), fall back to the largest
 * fields open to their stream so the result is never a dead-end.
 */
function buildDiscoveries(answers: QuizAnswers, pathsEmpty: boolean): Discovery[] {
  const picked = new Set(answers.interests);
  const votes = new Map<CourseCategoryId, { count: number; source: CourseCategoryId }>();

  for (const catId of answers.interests) {
    for (const adj of ADJACENT[catId] ?? []) {
      if (picked.has(adj)) continue;
      const v = votes.get(adj);
      if (v) v.count += 1;
      else votes.set(adj, { count: 1, source: catId });
    }
  }

  const eligibleIn = (catId: CourseCategoryId) =>
    COURSES.filter(
      (c) => c.categoryId === catId && c.streams.some((s) => answers.streams.includes(s)),
    );

  const out = Array.from(votes.entries())
    .map(([catId, v]) => {
      const category = CATEGORY_BY_ID[catId];
      if (!category) return null;
      const eligible = eligibleIn(catId);
      if (eligible.length === 0) return null;
      const source = CATEGORY_BY_ID[v.source];
      return {
        discovery: {
          category,
          reason: `Right next door to ${source?.name ?? 'your interests'} — and ${plural(eligible.length, 'course')} here ${eligible.length === 1 ? 'is' : 'are'} open to your stream.`,
          courses: eligible.slice(0, 3),
        },
        count: v.count,
        breadth: eligible.length,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.count - a.count || b.breadth - a.breadth)
    .slice(0, 3)
    .map((x) => x.discovery);

  if (out.length === 0 && pathsEmpty) {
    // Every interest was blocked — show the biggest fields their stream CAN
    // enter, so the student leaves with options instead of a wall.
    return COURSE_CATEGORY_IDS.filter((catId) => !picked.has(catId))
      .map((catId) => ({ category: CATEGORY_BY_ID[catId], eligible: eligibleIn(catId) }))
      .filter((x) => x.category && x.eligible.length > 0)
      .sort((a, b) => b.eligible.length - a.eligible.length)
      .slice(0, 4)
      .map(({ category, eligible }) => ({
        category,
        reason: `Open to ${streamsLabel(answers.streams)} — ${plural(eligible.length, 'course')} you could apply to.`,
        courses: eligible.slice(0, 3),
      }));
  }

  return out;
}

/** All category ids, derived once for the blocked-fallback sweep. */
const COURSE_CATEGORY_IDS = Object.keys(CATEGORY_BY_ID) as CourseCategoryId[];

export function recommend(answers: QuizAnswers): Recommendation {
  const { paths, blocked } = buildPaths(answers);
  return {
    paths,
    blocked,
    discoveries: buildDiscoveries(answers, paths.length === 0),
    courses: rankCourses(answers),
    colleges: rankColleges(answers),
  };
}

/** A short, encouraging note tailored to the student's marks band. */
export function marksNote(band: MarksBand): string {
  switch (band) {
    case 'above85':
      return 'With marks above 85%, government and top colleges via merit and entrance exams are well within reach.';
    case '75to85':
      return 'With marks in the 75–85% range, you have a strong shot at government and aided colleges — entrance exam scores will matter most.';
    case '60to75':
      return 'With marks in the 60–75% range, aided and self-financing colleges are realistic; a good entrance score can still open government seats.';
    case 'below60':
      return 'Marks are only one part of the picture — entrance exams, diplomas and self-financing colleges all remain open paths.';
  }
}
