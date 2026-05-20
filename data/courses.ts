import type { Course } from '@/types';

/**
 * The course catalogue — specific degrees a student can enrol in after 12th.
 * `examIds` lists the entrance exams that lead into the course; an empty
 * array means direct/merit admission with no entrance.
 */
export const COURSES: Course[] = [
  // ----- Engineering -----
  { id: 'btech-cse', name: 'B.Tech Computer Science Engineering', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'jee-advanced', 'keam', 'cusat-cat'], durationYears: 4 },
  { id: 'btech-it', name: 'B.Tech Information Technology', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam', 'cusat-cat'], durationYears: 4 },
  { id: 'btech-ece', name: 'B.Tech Electronics & Communication', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam', 'cusat-cat'], durationYears: 4 },
  { id: 'btech-eee', name: 'B.Tech Electrical & Electronics', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam', 'cusat-cat'], durationYears: 4 },
  { id: 'btech-mech', name: 'B.Tech Mechanical Engineering', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'jee-advanced', 'keam', 'cusat-cat'], durationYears: 4 },
  { id: 'btech-civil', name: 'B.Tech Civil Engineering', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam', 'cusat-cat'], durationYears: 4 },
  { id: 'btech-aero', name: 'B.Tech Aerospace Engineering', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'jee-advanced', 'keam'], durationYears: 4 },
  { id: 'btech-chemical', name: 'B.Tech Chemical Engineering', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'jee-advanced', 'keam'], durationYears: 4 },
  { id: 'btech-ai-ml', name: 'B.Tech Artificial Intelligence & Machine Learning', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam', 'cusat-cat'], durationYears: 4 },
  { id: 'btech-data-science', name: 'B.Tech Data Science', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam'], durationYears: 4 },
  { id: 'btech-cyber', name: 'B.Tech Cyber Security', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam'], durationYears: 4 },
  { id: 'btech-biotech', name: 'B.Tech Biotechnology Engineering', categoryId: 'engineering', streams: ['pcm', 'pcb'], examIds: ['jee-main', 'keam'], durationYears: 4 },
  { id: 'btech-robotics', name: 'B.Tech Robotics & Automation', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam'], durationYears: 4 },

  // ----- Medicine -----
  { id: 'mbbs', name: 'MBBS', categoryId: 'medical', streams: ['pcb'], examIds: ['neet-ug'], durationYears: 5.5 },

  // ----- Dental -----
  { id: 'bds', name: 'BDS (Bachelor of Dental Surgery)', categoryId: 'dental', streams: ['pcb'], examIds: ['neet-ug'], durationYears: 5 },

  // ----- AYUSH -----
  { id: 'bams', name: 'BAMS (Ayurveda)', categoryId: 'ayush', streams: ['pcb'], examIds: ['neet-ug'], durationYears: 5.5 },
  { id: 'bhms', name: 'BHMS (Homeopathy)', categoryId: 'ayush', streams: ['pcb'], examIds: ['neet-ug'], durationYears: 5.5 },
  { id: 'bums', name: 'BUMS (Unani)', categoryId: 'ayush', streams: ['pcb'], examIds: ['neet-ug'], durationYears: 5.5 },
  { id: 'bnys', name: 'BNYS (Naturopathy & Yoga)', categoryId: 'ayush', streams: ['pcb'], examIds: ['neet-ug'], durationYears: 5.5 },

  // ----- Nursing -----
  { id: 'bsc-nursing', name: 'B.Sc Nursing', categoryId: 'nursing', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 4 },

  // ----- Paramedical & Allied Health -----
  { id: 'bsc-mlt', name: 'B.Sc Medical Lab Technology', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 3.5 },
  { id: 'bsc-radiology', name: 'B.Sc Radiology & Imaging Technology', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 3.5 },
  { id: 'bsc-optometry', name: 'B.Sc Optometry', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 4 },
  { id: 'bpt', name: 'BPT (Physiotherapy)', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 4.5 },
  { id: 'bsc-cardiac-tech', name: 'B.Sc Cardiac Technology', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 3.5 },
  { id: 'bsc-ot-tech', name: 'B.Sc Operation Theatre Technology', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 3.5 },

  // ----- Pharmacy -----
  { id: 'bpharm', name: 'B.Pharm (Bachelor of Pharmacy)', categoryId: 'pharmacy', streams: ['pcm', 'pcb'], examIds: ['keam'], durationYears: 4 },
  { id: 'pharmd', name: 'Pharm.D (Doctor of Pharmacy)', categoryId: 'pharmacy', streams: ['pcb'], examIds: ['keam'], durationYears: 6 },

  // ----- Architecture -----
  { id: 'barch', name: 'B.Arch (Architecture)', categoryId: 'architecture', streams: ['pcm'], examIds: ['nata', 'jee-main-paper2', 'keam'], durationYears: 5 },
  { id: 'bplanning', name: 'B.Planning (Urban & Regional Planning)', categoryId: 'architecture', streams: ['pcm'], examIds: ['nata', 'jee-main-paper2'], durationYears: 4 },

  // ----- Agriculture & Allied -----
  { id: 'bsc-agriculture', name: 'B.Sc Agriculture', categoryId: 'agriculture', streams: ['pcb'], examIds: ['icar-aieea', 'kau-entrance', 'keam'], durationYears: 4 },
  { id: 'bsc-horticulture', name: 'B.Sc Horticulture', categoryId: 'agriculture', streams: ['pcb'], examIds: ['icar-aieea', 'kau-entrance'], durationYears: 4 },
  { id: 'bsc-forestry', name: 'B.Sc Forestry', categoryId: 'agriculture', streams: ['pcb'], examIds: ['icar-aieea', 'kau-entrance'], durationYears: 4 },
  { id: 'btech-agri-engg', name: 'B.Tech Agricultural Engineering', categoryId: 'agriculture', streams: ['pcm'], examIds: ['icar-aieea', 'kau-entrance', 'keam'], durationYears: 4 },
  { id: 'bsc-food-tech', name: 'B.Sc Food Technology', categoryId: 'agriculture', streams: ['pcb'], examIds: ['icar-aieea', 'kau-entrance'], durationYears: 4 },

  // ----- Veterinary -----
  { id: 'bvsc', name: 'BVSc & AH (Veterinary Science)', categoryId: 'veterinary', streams: ['pcb'], examIds: ['neet-ug', 'kvasu-entrance', 'icar-aieea'], durationYears: 5 },

  // ----- Fisheries -----
  { id: 'bfsc', name: 'B.F.Sc (Fisheries Science)', categoryId: 'fisheries', streams: ['pcb'], examIds: ['kufos-entrance', 'icar-aieea'], durationYears: 4 },

  // ----- Law -----
  { id: 'ba-llb', name: 'BA LLB (5-year integrated)', categoryId: 'law', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['clat', 'klee'], durationYears: 5 },
  { id: 'bba-llb', name: 'BBA LLB (5-year integrated)', categoryId: 'law', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['clat', 'klee'], durationYears: 5 },
  { id: 'bcom-llb', name: 'B.Com LLB (5-year integrated)', categoryId: 'law', streams: ['commerce', 'arts'], examIds: ['clat', 'klee', 'cusat-cat'], durationYears: 5 },

  // ----- Pure Sciences -----
  { id: 'bsc-physics', name: 'B.Sc Physics', categoryId: 'science', streams: ['pcm', 'pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'bsc-chemistry', name: 'B.Sc Chemistry', categoryId: 'science', streams: ['pcm', 'pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'bsc-mathematics', name: 'B.Sc Mathematics', categoryId: 'science', streams: ['pcm'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'bsc-computer-science', name: 'B.Sc Computer Science', categoryId: 'science', streams: ['pcm'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'bsc-biotechnology', name: 'B.Sc Biotechnology', categoryId: 'science', streams: ['pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'bsc-microbiology', name: 'B.Sc Microbiology', categoryId: 'science', streams: ['pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'bsc-zoology', name: 'B.Sc Zoology', categoryId: 'science', streams: ['pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'bsc-botany', name: 'B.Sc Botany', categoryId: 'science', streams: ['pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'bsc-statistics', name: 'B.Sc Statistics', categoryId: 'science', streams: ['pcm'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance'], durationYears: 3 },
  { id: 'bsc-forensic-science', name: 'B.Sc Forensic Science', categoryId: 'science', streams: ['pcm', 'pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance'], durationYears: 3 },
  { id: 'bsc-psychology', name: 'B.Sc Psychology', categoryId: 'science', streams: ['pcm', 'pcb', 'arts'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'bsms-integrated', name: 'Integrated BS-MS (5-year)', categoryId: 'science', streams: ['pcm', 'pcb'], examIds: ['iiser-iat', 'nest'], durationYears: 5 },

  // ----- Commerce & Management -----
  { id: 'bcom-general', name: 'B.Com (General)', categoryId: 'commerce', streams: ['commerce', 'arts'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'bcom-finance', name: 'B.Com Finance & Accounting', categoryId: 'commerce', streams: ['commerce'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance'], durationYears: 3 },
  { id: 'bcom-computer-applications', name: 'B.Com Computer Applications', categoryId: 'commerce', streams: ['commerce', 'pcm'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'bba', name: 'BBA (Business Administration)', categoryId: 'commerce', streams: ['commerce', 'pcm', 'pcb', 'arts'], examIds: ['cuet-ug', 'kmat', 'kerala-univ-entrance', 'mg-univ-entrance'], durationYears: 3 },
  { id: 'bms', name: 'BMS (Management Studies)', categoryId: 'commerce', streams: ['commerce', 'arts'], examIds: ['cuet-ug', 'kmat'], durationYears: 3 },
  { id: 'bca', name: 'BCA (Computer Applications)', categoryId: 'commerce', streams: ['commerce', 'pcm'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },

  // ----- Arts & Humanities -----
  { id: 'ba-english', name: 'BA English Literature', categoryId: 'arts', streams: ['arts', 'commerce', 'pcm', 'pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'ba-history', name: 'BA History', categoryId: 'arts', streams: ['arts'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'ba-economics', name: 'BA Economics', categoryId: 'arts', streams: ['arts', 'commerce'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'ba-political-science', name: 'BA Political Science', categoryId: 'arts', streams: ['arts'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'ba-sociology', name: 'BA Sociology', categoryId: 'arts', streams: ['arts'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance'], durationYears: 3 },
  { id: 'ba-psychology', name: 'BA Psychology', categoryId: 'arts', streams: ['arts', 'pcb', 'commerce'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'ba-malayalam', name: 'BA Malayalam Literature', categoryId: 'arts', streams: ['arts'], examIds: ['cuet-ug', 'malayalam-univ-entrance', 'kerala-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'ba-sanskrit', name: 'BA Sanskrit', categoryId: 'arts', streams: ['arts'], examIds: ['cuet-ug', 'kerala-sanskrit-univ-entrance'], durationYears: 3 },
  { id: 'ba-journalism', name: 'BA Journalism & Mass Communication', categoryId: 'arts', streams: ['arts', 'commerce', 'pcm', 'pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'bsw', name: 'BSW (Social Work)', categoryId: 'arts', streams: ['arts', 'commerce', 'pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance'], durationYears: 3 },

  // ----- Design & Fashion -----
  { id: 'bdes-fashion', name: 'B.Des Fashion Design', categoryId: 'design', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['nift-entrance', 'nid-dat', 'uceed'], durationYears: 4 },
  { id: 'bdes-communication', name: 'B.Des Communication Design', categoryId: 'design', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['nift-entrance', 'nid-dat', 'uceed'], durationYears: 4 },
  { id: 'bdes-product', name: 'B.Des Product / Industrial Design', categoryId: 'design', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['nid-dat', 'uceed'], durationYears: 4 },
  { id: 'bftech', name: 'B.FTech Fashion Technology', categoryId: 'design', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['nift-entrance'], durationYears: 4 },

  // ----- Hotel Management -----
  { id: 'bhm', name: 'BHM (Hotel Management)', categoryId: 'hotel-management', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['nchmct-jee'], durationYears: 4 },
  { id: 'bsc-hotel-admin', name: 'B.Sc Hospitality & Hotel Administration', categoryId: 'hotel-management', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['nchmct-jee'], durationYears: 3 },

  // ----- Fine & Performing Arts -----
  { id: 'bfa', name: 'BFA (Bachelor of Fine Arts)', categoryId: 'fine-arts', streams: ['arts', 'commerce', 'pcm', 'pcb'], examIds: [], durationYears: 4 },
  { id: 'bpa', name: 'BPA (Bachelor of Performing Arts)', categoryId: 'fine-arts', streams: ['arts', 'commerce', 'pcm', 'pcb'], examIds: [], durationYears: 3 },
  { id: 'ba-music', name: 'BA Music', categoryId: 'fine-arts', streams: ['arts', 'commerce', 'pcm', 'pcb'], examIds: [], durationYears: 3 },

  // ----- Education & Teaching -----
  { id: 'bel-ed', name: 'B.El.Ed (Elementary Education)', categoryId: 'education', streams: ['arts', 'commerce', 'pcm', 'pcb'], examIds: ['cuet-ug'], durationYears: 4 },
  { id: 'ba-bed-integrated', name: 'BA B.Ed (4-year integrated)', categoryId: 'education', streams: ['arts'], examIds: ['cuet-ug'], durationYears: 4 },
  { id: 'deled', name: 'D.El.Ed (Diploma in Elementary Education)', categoryId: 'education', streams: ['arts', 'commerce', 'pcm', 'pcb'], examIds: ['kerala-deled'], durationYears: 2 },

  // ----- Polytechnic Diplomas -----
  { id: 'diploma-civil', name: 'Diploma in Civil Engineering', categoryId: 'polytechnic', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['kerala-polytechnic'], durationYears: 3 },
  { id: 'diploma-mechanical', name: 'Diploma in Mechanical Engineering', categoryId: 'polytechnic', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['kerala-polytechnic'], durationYears: 3 },
  { id: 'diploma-electrical', name: 'Diploma in Electrical Engineering', categoryId: 'polytechnic', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['kerala-polytechnic'], durationYears: 3 },
  { id: 'diploma-computer', name: 'Diploma in Computer Engineering', categoryId: 'polytechnic', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['kerala-polytechnic'], durationYears: 3 },
  { id: 'diploma-electronics', name: 'Diploma in Electronics Engineering', categoryId: 'polytechnic', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: ['kerala-polytechnic'], durationYears: 3 },

  // ===== ADDITIONS FROM COURSE AUDIT =====
  // Paramedical & Allied Health
  { id: 'baslp', name: 'BASLP (Audiology & Speech-Language Pathology)', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 4 },
  { id: 'bot', name: 'BOT (Occupational Therapy)', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 4.5 },
  { id: 'bsc-anaesthesia-tech', name: 'B.Sc Anaesthesia Technology', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 3.5 },
  { id: 'bsc-dialysis-tech', name: 'B.Sc Dialysis Technology', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 3.5 },
  { id: 'bsc-perfusion-tech', name: 'B.Sc Perfusion Technology', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 3.5 },
  { id: 'bsc-respiratory-therapy', name: 'B.Sc Respiratory Therapy', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 4 },
  { id: 'bsc-nuclear-medicine-tech', name: 'B.Sc Nuclear Medicine Technology', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 3.5 },
  { id: 'bsc-nutrition-dietetics', name: 'B.Sc Nutrition & Dietetics', categoryId: 'paramedical', streams: ['pcb'], examIds: ['kuhs-paramedical', 'lbs-allied-health'], durationYears: 3 },
  // Nursing
  { id: 'gnm', name: 'GNM (General Nursing & Midwifery diploma)', categoryId: 'nursing', streams: ['pcb', 'arts', 'commerce'], examIds: ['lbs-allied-health'], durationYears: 3.5 },
  // Engineering
  { id: 'bsc-nautical-science', name: 'B.Sc Nautical Science', categoryId: 'engineering', streams: ['pcm'], examIds: ['imu-cet'], durationYears: 3 },
  { id: 'btech-marine', name: 'B.Tech Marine Engineering', categoryId: 'engineering', streams: ['pcm'], examIds: ['imu-cet', 'jee-main', 'keam'], durationYears: 4 },
  { id: 'btech-industrial', name: 'B.Tech Industrial Engineering', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam'], durationYears: 4 },
  { id: 'btech-automobile', name: 'B.Tech Automobile Engineering', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam'], durationYears: 4 },
  { id: 'btech-instrumentation', name: 'B.Tech Instrumentation & Control Engineering', categoryId: 'engineering', streams: ['pcm'], examIds: ['jee-main', 'keam'], durationYears: 4 },
  // Commerce & Management
  { id: 'bvoc', name: 'B.Voc (Bachelor of Vocation)', categoryId: 'commerce', streams: ['commerce', 'pcm', 'pcb', 'arts'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'bbm', name: 'BBM (Bachelor of Business Management)', categoryId: 'commerce', streams: ['commerce', 'arts'], examIds: ['cuet-ug', 'kmat'], durationYears: 3 },
  { id: 'bba-aviation', name: 'BBA Aviation Management', categoryId: 'commerce', streams: ['commerce', 'pcm', 'pcb', 'arts'], examIds: ['cuet-ug', 'kmat'], durationYears: 3 },
  { id: 'bba-logistics', name: 'BBA Logistics & Supply Chain Management', categoryId: 'commerce', streams: ['commerce', 'pcm', 'pcb', 'arts'], examIds: ['cuet-ug', 'kmat'], durationYears: 3 },
  { id: 'bba-tourism', name: 'BBA Tourism & Travel Management', categoryId: 'commerce', streams: ['commerce', 'pcm', 'pcb', 'arts'], examIds: ['cuet-ug', 'kmat'], durationYears: 3 },
  { id: 'bcom-cooperation', name: 'B.Com Co-operation', categoryId: 'commerce', streams: ['commerce'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'integrated-mba', name: 'Integrated MBA (BBA + MBA, 5-year)', categoryId: 'commerce', streams: ['commerce', 'pcm', 'pcb', 'arts'], examIds: ['cuet-ug', 'kmat'], durationYears: 5 },
  // Arts & Humanities
  { id: 'ba-multimedia', name: 'BA Multimedia', categoryId: 'arts', streams: ['arts', 'commerce', 'pcm', 'pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'ba-philosophy', name: 'BA Philosophy', categoryId: 'arts', streams: ['arts'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'ba-geography', name: 'BA Geography', categoryId: 'arts', streams: ['arts', 'pcm'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'ba-hindi', name: 'BA Hindi Literature', categoryId: 'arts', streams: ['arts'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'ba-arabic', name: 'BA Arabic Literature', categoryId: 'arts', streams: ['arts'], examIds: ['cuet-ug', 'calicut-univ-entrance', 'kannur-univ-entrance'], durationYears: 3 },
  { id: 'ba-visual-communication', name: 'BA Visual Communication', categoryId: 'arts', streams: ['arts', 'commerce', 'pcm', 'pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  // Pure Sciences
  { id: 'bsc-biochemistry', name: 'B.Sc Biochemistry', categoryId: 'science', streams: ['pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'bsc-environmental-science', name: 'B.Sc Environmental Science', categoryId: 'science', streams: ['pcb', 'pcm'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'bsc-geology', name: 'B.Sc Geology', categoryId: 'science', streams: ['pcm', 'pcb'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance'], durationYears: 3 },
  { id: 'bsc-electronics', name: 'B.Sc Electronics', categoryId: 'science', streams: ['pcm'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance', 'calicut-univ-entrance'], durationYears: 3 },
  { id: 'bsc-home-science', name: 'B.Sc Home Science', categoryId: 'science', streams: ['pcb', 'arts', 'commerce'], examIds: ['cuet-ug', 'kerala-univ-entrance', 'mg-univ-entrance'], durationYears: 3 },
  // Education & Design
  { id: 'bped', name: 'B.P.Ed (Physical Education)', categoryId: 'education', streams: ['arts', 'commerce', 'pcm', 'pcb'], examIds: ['cuet-ug'], durationYears: 4 },
  { id: 'bsc-animation-game', name: 'B.Sc Animation & Game Design', categoryId: 'design', streams: ['pcm', 'pcb', 'commerce', 'arts'], examIds: [], durationYears: 3 },
];

export const COURSE_BY_ID: Record<string, Course> = Object.fromEntries(
  COURSES.map((c) => [c.id, c]),
);
