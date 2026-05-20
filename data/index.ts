/**
 * Seed data barrel + lookup helpers.
 *
 * This is the single source of truth for the catalogue and quiz today.
 * When Supabase is wired up, these helpers become the query layer and the
 * raw arrays move into the database — call sites should not need to change.
 */

import type {
  College,
  CollegeType,
  CourseCategoryId,
  District,
  FeeBand,
  Stream,
} from '@/types';

import { COLLEGES, COLLEGE_BY_ID } from './colleges';
import { COURSES, COURSE_BY_ID } from './courses';
import { COURSE_CATEGORIES, CATEGORY_BY_ID } from './course-categories';
import { EXAMS, EXAM_BY_ID } from './exams';

export { COLLEGES, COLLEGE_BY_ID } from './colleges';
export { COURSES, COURSE_BY_ID } from './courses';
export { COURSE_CATEGORIES, CATEGORY_BY_ID } from './course-categories';
export { EXAMS, EXAM_BY_ID } from './exams';

/** All 14 Kerala districts, in the conventional north-to-south list order. */
export const DISTRICTS: District[] = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
];

export const STREAM_LABELS: Record<Stream, string> = {
  pcm: 'Science (PCM)',
  pcb: 'Science (PCB)',
  commerce: 'Commerce',
  arts: 'Arts / Humanities',
};

export const TYPE_LABELS: Record<CollegeType, string> = {
  government: 'Government',
  aided: 'Aided',
  private: 'Private',
};

export const FEE_BAND_LABELS: Record<FeeBand, string> = {
  low: 'Low fees',
  medium: 'Moderate fees',
  high: 'Higher fees',
};

/** Courses belonging to a category. */
export function getCoursesByCategory(categoryId: CourseCategoryId) {
  return COURSES.filter((c) => c.categoryId === categoryId);
}

/** Courses a given 12th stream is eligible to apply for. */
export function getCoursesForStream(stream: Stream) {
  return COURSES.filter((c) => c.streams.includes(stream));
}

/** Courses that a given entrance exam leads into. */
export function getCoursesForExam(examId: string) {
  return COURSES.filter((c) => c.examIds.includes(examId));
}

/** Exams that lead into a given course. */
export function getExamsForCourse(courseId: string) {
  const course = COURSE_BY_ID[courseId];
  if (!course) return [];
  return course.examIds.map((id) => EXAM_BY_ID[id]).filter(Boolean);
}

/** Colleges that offer a given course category. */
export function getCollegesForCategory(categoryId: CourseCategoryId) {
  return COLLEGES.filter((c) => c.categories.includes(categoryId));
}

/** Colleges in a given district. */
export function getCollegesByDistrict(district: District) {
  return COLLEGES.filter((c) => c.district === district);
}

/** Course categories a college offers, resolved to full category objects. */
export function getCategoriesForCollege(college: College) {
  return college.categories.map((id) => CATEGORY_BY_ID[id]).filter(Boolean);
}

export const COUNTS = {
  colleges: COLLEGES.length,
  courses: COURSES.length,
  exams: EXAMS.length,
  categories: COURSE_CATEGORIES.length,
};
