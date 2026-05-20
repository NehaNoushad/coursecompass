/**
 * Shared domain types. These mirror the planned Supabase tables so the
 * file-based seed data can migrate to the database with no shape changes.
 */

/** The 14 districts of Kerala. */
export type District =
  | 'Thiruvananthapuram'
  | 'Kollam'
  | 'Pathanamthitta'
  | 'Alappuzha'
  | 'Kottayam'
  | 'Idukki'
  | 'Ernakulam'
  | 'Thrissur'
  | 'Palakkad'
  | 'Malappuram'
  | 'Kozhikode'
  | 'Wayanad'
  | 'Kannur'
  | 'Kasaragod';

/** Funding/ownership type of a college. */
export type CollegeType = 'government' | 'aided' | 'private';

/** Coarse affordability band — exact fees are refined later in the admin panel. */
export type FeeBand = 'low' | 'medium' | 'high';

/** Class 12 stream the student studied. */
export type Stream = 'pcm' | 'pcb' | 'commerce' | 'arts';

/**
 * Broad course category. A college links to these; the detailed course
 * catalogue (degrees within a category) lives in the Course type.
 */
export type CourseCategoryId =
  | 'engineering'
  | 'medical'
  | 'dental'
  | 'ayush'
  | 'nursing'
  | 'paramedical'
  | 'pharmacy'
  | 'architecture'
  | 'agriculture'
  | 'veterinary'
  | 'fisheries'
  | 'law'
  | 'science'
  | 'commerce'
  | 'arts'
  | 'design'
  | 'hotel-management'
  | 'fine-arts'
  | 'education'
  | 'polytechnic';

export interface CourseCategory {
  id: CourseCategoryId;
  name: string;
  description: string;
}

/** A specific degree/programme a student can enrol in. */
export interface Course {
  id: string;
  name: string;
  categoryId: CourseCategoryId;
  /** Streams eligible to apply for this course. */
  streams: Stream[];
  /** Entrance exam ids that lead into this course. Empty = direct admission. */
  examIds: string[];
  /** Typical duration in years. */
  durationYears: number;
}

/** An entrance exam (scope: the 37 Kerala-relevant exams). */
export interface Exam {
  id: string;
  name: string;
  fullName: string;
  /** Short note on what it unlocks. */
  scope: string;
}

/** A college record. */
export interface College {
  id: string;
  name: string;
  district: District;
  type: CollegeType;
  feeBand: FeeBand;
  /** Course categories this college offers. */
  categories: CourseCategoryId[];
  /** Optional — filled in later via the admin panel. */
  website?: string;
  established?: number;
}
