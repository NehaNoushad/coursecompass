/**
 * Quiz recommendation engine. Pure functions over the seed data — given the
 * student's answers, it scores courses and colleges and returns ranked lists.
 *
 * Scoring is intentionally simple and transparent: every match carries a
 * human-readable reason so the result screen can explain *why* something
 * was suggested.
 */

import type {
  College,
  CollegeType,
  Course,
  CourseCategoryId,
  District,
  Stream,
} from '@/types';
import { CATEGORY_BY_ID, COLLEGES, COURSES, EXAM_BY_ID } from '@/data';

export type MarksBand = 'below60' | '60to75' | '75to85' | 'above85';

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

export interface Recommendation {
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

export function recommend(answers: QuizAnswers): Recommendation {
  return {
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
