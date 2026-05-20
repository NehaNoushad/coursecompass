import type { CourseCategory } from '@/types';

/** The 20 broad course categories a college can offer. */
export const COURSE_CATEGORIES: CourseCategory[] = [
  { id: 'engineering', name: 'Engineering & Technology', description: 'B.Tech / B.E. degrees across all branches.' },
  { id: 'medical', name: 'Medicine (MBBS)', description: 'The MBBS degree and the path to becoming a doctor.' },
  { id: 'dental', name: 'Dental (BDS)', description: 'The BDS degree and dental practice.' },
  { id: 'ayush', name: 'AYUSH', description: 'Ayurveda, Homeopathy, Unani and Naturopathy degrees.' },
  { id: 'nursing', name: 'Nursing', description: 'B.Sc Nursing and related care degrees.' },
  { id: 'paramedical', name: 'Paramedical & Allied Health', description: 'Lab, imaging, therapy and technology degrees in healthcare.' },
  { id: 'pharmacy', name: 'Pharmacy', description: 'B.Pharm and Pharm.D degrees.' },
  { id: 'architecture', name: 'Architecture & Planning', description: 'B.Arch and B.Planning degrees.' },
  { id: 'agriculture', name: 'Agriculture & Allied', description: 'Agriculture, horticulture, forestry and food technology.' },
  { id: 'veterinary', name: 'Veterinary Science', description: 'BVSc & AH and animal-science degrees.' },
  { id: 'fisheries', name: 'Fisheries & Ocean Studies', description: 'Fisheries science and ocean-studies degrees.' },
  { id: 'law', name: 'Law', description: 'Integrated 5-year law degrees after 12th.' },
  { id: 'science', name: 'Pure Sciences', description: 'B.Sc degrees in physics, chemistry, biology and more.' },
  { id: 'commerce', name: 'Commerce & Management', description: 'B.Com, BBA and management degrees.' },
  { id: 'arts', name: 'Arts & Humanities', description: 'BA degrees in languages, social sciences and media.' },
  { id: 'design', name: 'Design & Fashion', description: 'B.Des and fashion-technology degrees.' },
  { id: 'hotel-management', name: 'Hotel Management', description: 'Hospitality and hotel-administration degrees.' },
  { id: 'fine-arts', name: 'Fine & Performing Arts', description: 'Painting, music, dance and performance degrees.' },
  { id: 'education', name: 'Education & Teaching', description: 'Teacher-training degrees and diplomas.' },
  { id: 'polytechnic', name: 'Polytechnic Diplomas', description: '3-year engineering and allied diploma courses.' },
];

export const CATEGORY_BY_ID: Record<string, CourseCategory> = Object.fromEntries(
  COURSE_CATEGORIES.map((c) => [c.id, c]),
);
