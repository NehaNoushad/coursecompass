import type { Exam } from '@/types';

/**
 * The 37 Kerala-relevant entrance exams. College-specific and out-of-state
 * exams are deliberately excluded.
 */
export const EXAMS: Exam[] = [
  // Engineering
  { id: 'jee-main', name: 'JEE Main', fullName: 'Joint Entrance Examination (Main)', scope: 'B.Tech/B.E. at NITs, IIITs, CFTIs and many Kerala colleges.' },
  { id: 'jee-advanced', name: 'JEE Advanced', fullName: 'Joint Entrance Examination (Advanced)', scope: 'B.Tech at the IITs, including IIT Palakkad.' },
  { id: 'keam', name: 'KEAM', fullName: 'Kerala Engineering Architecture Medical', scope: 'Kerala state-quota engineering, pharmacy, architecture and allied courses.' },
  { id: 'cusat-cat', name: 'CUSAT CAT', fullName: 'CUSAT Common Admission Test', scope: 'B.Tech and other UG programmes at CUSAT, Kochi.' },

  // Medical / Dental / AYUSH / Nursing / Paramedical
  { id: 'neet-ug', name: 'NEET UG', fullName: 'National Eligibility cum Entrance Test (UG)', scope: 'MBBS, BDS, BAMS, BHMS, BUMS, BNYS and BVSc admissions.' },
  { id: 'kuhs-paramedical', name: 'KUHS Paramedical', fullName: 'Kerala University of Health Sciences Paramedical Entrance', scope: 'Nursing and allied-health degrees at KUHS-affiliated colleges.' },
  { id: 'lbs-allied-health', name: 'LBS Allied Health', fullName: 'LBS Centre Allied Health Sciences Entrance', scope: 'Government-quota nursing, paramedical and allied-health seats.' },

  // Architecture
  { id: 'nata', name: 'NATA', fullName: 'National Aptitude Test in Architecture', scope: 'B.Arch admissions across India.' },
  { id: 'jee-main-paper2', name: 'JEE Main Paper 2', fullName: 'JEE Main Paper 2 (B.Arch / B.Planning)', scope: 'B.Arch and B.Planning at NITs and CFTIs.' },

  // Agriculture / Veterinary / Fisheries
  { id: 'icar-aieea', name: 'ICAR AIEEA UG', fullName: 'ICAR All India Entrance Examination for Admission (UG)', scope: 'Agriculture and allied UG degrees nationwide.' },
  { id: 'kau-entrance', name: 'KAU Entrance', fullName: 'Kerala Agricultural University Entrance', scope: 'B.Sc Agriculture, Horticulture, Forestry and allied at KAU.' },
  { id: 'kvasu-entrance', name: 'KVASU Entrance', fullName: 'Kerala Veterinary & Animal Sciences University Entrance', scope: 'BVSc & AH and allied degrees at KVASU.' },
  { id: 'kufos-entrance', name: 'KUFOS Entrance', fullName: 'Kerala University of Fisheries & Ocean Studies Entrance', scope: 'Fisheries science and ocean-studies degrees at KUFOS.' },

  // Law
  { id: 'clat', name: 'CLAT', fullName: 'Common Law Admission Test', scope: 'Integrated law degrees at NLUs, including NUALS Kochi.' },
  { id: 'klee', name: 'KLEE', fullName: 'Kerala Law Entrance Examination', scope: 'Integrated 5-year law degrees at Kerala law colleges.' },

  // Management / Commerce / Arts / Humanities / General UG
  { id: 'cuet-ug', name: 'CUET UG', fullName: 'Common University Entrance Test (UG)', scope: 'UG admissions at central universities and many others.' },
  { id: 'kmat', name: 'KMAT Kerala', fullName: 'Kerala Management Aptitude Test', scope: 'Management programmes at Kerala private institutes.' },
  { id: 'kerala-univ-entrance', name: 'Kerala University Entrance', fullName: 'University of Kerala UG Entrance', scope: 'UG courses at University of Kerala affiliated colleges.' },
  { id: 'mg-univ-entrance', name: 'MG University Entrance', fullName: 'Mahatma Gandhi University UG Entrance', scope: 'UG courses at MG University affiliated colleges.' },
  { id: 'calicut-univ-entrance', name: 'Calicut University Entrance', fullName: 'University of Calicut UG Entrance', scope: 'UG courses at University of Calicut affiliated colleges.' },
  { id: 'kannur-univ-entrance', name: 'Kannur University Entrance', fullName: 'Kannur University UG Entrance', scope: 'UG courses at Kannur University affiliated colleges.' },
  { id: 'kerala-sanskrit-univ-entrance', name: 'Sanskrit University Entrance', fullName: 'Sree Sankaracharya University of Sanskrit Entrance', scope: 'Sanskrit and humanities UG degrees.' },
  { id: 'malayalam-univ-entrance', name: 'Malayalam University Entrance', fullName: 'Thunchath Ezhuthachan Malayalam University Entrance', scope: 'Malayalam language and literature UG degrees.' },

  // Design / Fashion / Fine Arts
  { id: 'nift-entrance', name: 'NIFT Entrance', fullName: 'National Institute of Fashion Technology Entrance', scope: 'B.Des and B.FTech at NIFT campuses.' },
  { id: 'nid-dat', name: 'NID DAT', fullName: 'NID Design Aptitude Test', scope: 'B.Des at the National Institute of Design.' },
  { id: 'uceed', name: 'UCEED', fullName: 'Undergraduate Common Entrance Exam for Design', scope: 'B.Des at IITs and select design schools.' },

  // Hotel Management
  { id: 'nchmct-jee', name: 'NCHMCT JEE', fullName: 'National Council for Hotel Management JEE', scope: 'BHM / hospitality degrees at IHMs.' },

  // Science / Integrated / Research
  { id: 'iiser-iat', name: 'IISER IAT', fullName: 'IISER Aptitude Test', scope: 'Integrated BS-MS at IISERs, including IISER Thiruvananthapuram.' },
  { id: 'nest', name: 'NEST', fullName: 'National Entrance Screening Test', scope: 'Integrated MSc at NISER and UM-DAE CBS.' },

  // Defence & Uniformed
  { id: 'nda', name: 'NDA', fullName: 'National Defence Academy Examination (UPSC)', scope: 'Officer entry to the Army, Navy and Air Force after 12th.' },
  { id: 'inet', name: 'INET', fullName: 'Indian Navy Entrance Test', scope: 'Officer-cadet entry routes in the Indian Navy.' },
  { id: 'afcat', name: 'AFCAT', fullName: 'Air Force Common Admission Test', scope: 'Officer entry to the Indian Air Force.' },
  { id: 'tes', name: 'TES', fullName: 'Technical Entry Scheme (Indian Army)', scope: 'B.Tech officer-cadet entry to the Army.' },
  { id: 'coast-guard', name: 'Coast Guard Entry', fullName: 'Indian Coast Guard Navik / Yantrik Entry', scope: 'Navik and Yantrik recruitment after 12th.' },
  { id: 'imu-cet', name: 'IMU CET', fullName: 'Indian Maritime University Common Entrance Test', scope: 'Merchant Navy / nautical science / marine engineering degrees.' },

  // Polytechnic / Education
  { id: 'kerala-polytechnic', name: 'Kerala Polytechnic Entrance', fullName: 'Kerala Polytechnic Diploma Admission (LBS Centre)', scope: '3-year engineering and allied diplomas.' },
  { id: 'kerala-deled', name: 'Kerala D.El.Ed Entrance', fullName: 'Kerala Diploma in Elementary Education Entrance', scope: 'D.El.Ed admissions at DIETs and TTIs.' },
  { id: 'ncet', name: 'NCET', fullName: 'National Common Entrance Test', scope: 'Integrated Teacher Education Programme (ITEP) admissions.' },
];

export const EXAM_BY_ID: Record<string, Exam> = Object.fromEntries(
  EXAMS.map((e) => [e.id, e]),
);
