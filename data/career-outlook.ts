/**
 * Career outlook per course category — the "where it leads" content shown on
 * the course detail page (and, later, the quiz result).
 *
 * Each entry is a job/role a graduate can move into, with a short, honest
 * `scope` line describing what the path involves and where the demand is.
 *
 * Deliberately NO salary figures: exact pay varies enormously by employer,
 * city, seat category and experience, and any number we printed would be a
 * guess that quietly erodes trust. Scope (what the work is + whether the
 * field is growing / where the jobs are) is the part a 12th-pass student can
 * actually use to judge a course's future — without us inventing rupees.
 *
 * Kept in `data/` (not the page) so it sits with the rest of the seed data
 * and migrates cleanly to a Supabase / admin-editable table later. Every
 * `CourseCategoryId` has an entry, so the page never has to fall back to an
 * unrelated field's careers.
 */

import type { CourseCategoryId } from '@/types';

export interface CareerPath {
  /** Job title / role a graduate can move into. */
  role: string;
  /** One honest line on what the path involves and its outlook. No salary. */
  scope: string;
}

export const CAREER_OUTLOOK: Record<CourseCategoryId, CareerPath[]> = {
  engineering: [
    { role: 'Software Engineer', scope: 'Build and maintain software — the largest hiring pool, from Kerala’s IT parks (Technopark, Infopark) to remote roles for global companies.' },
    { role: 'Core Engineer (Mechanical / Civil / Electrical)', scope: 'Design and site roles in manufacturing, construction and infrastructure across India and the Gulf.' },
    { role: 'Data / AI–ML Engineer', scope: 'Work with data and machine-learning systems — one of the fastest-growing areas in tech.' },
    { role: 'Government Engineer (PSC / PSUs)', scope: 'Stable public-sector posts via KPSC, KSEB, railways and PSUs.' },
    { role: 'Higher studies — M.Tech / MS / MBA', scope: 'Specialise further or move into management; a common route to senior and research roles.' },
  ],
  medical: [
    { role: 'General Physician', scope: 'Diagnose and treat patients across general medicine — the core medical career, always in demand.' },
    { role: 'Hospital Specialist (after PG)', scope: 'Specialise in a field (cardiology, paediatrics, etc.) after an MD/MS.' },
    { role: 'Surgeon', scope: 'Perform surgeries after a surgical PG — a high-skill, high-demand path.' },
    { role: 'Government Medical Officer', scope: 'Stable public-health roles in PHCs, government hospitals and rural service.' },
    { role: 'Higher studies — MD / MS / DM', scope: 'The essential next step for most medical specialisations.' },
  ],
  dental: [
    { role: 'Dental Surgeon', scope: 'Diagnose and treat dental problems in clinics and hospitals — the core BDS role.' },
    { role: 'Specialist (after MDS)', scope: 'Specialise in orthodontics, oral surgery and more after a master’s degree.' },
    { role: 'Own Dental Practice', scope: 'Many dentists set up independent clinics once experienced.' },
    { role: 'Government Dental Officer', scope: 'Public hospital and health-service postings.' },
    { role: 'Higher studies — MDS', scope: 'Specialisation that significantly widens career scope.' },
  ],
  ayush: [
    { role: 'AYUSH Physician', scope: 'Practise Ayurveda, Homeopathy or your chosen system — growing acceptance in India and abroad for wellness care.' },
    { role: 'Own Clinic / Wellness Centre', scope: 'Independent practice, including Kerala’s large Ayurveda and health-tourism sector.' },
    { role: 'Government AYUSH Officer', scope: 'Roles in the state AYUSH department and dispensaries.' },
    { role: 'Herbal / Pharmaceutical industry', scope: 'Product and quality roles in the ayurvedic and herbal-medicine industry.' },
    { role: 'Higher studies — MD (AYUSH)', scope: 'Specialise within your system of medicine, or move into teaching.' },
  ],
  nursing: [
    { role: 'Staff Nurse', scope: 'The core hospital role — high, steady demand across Kerala.' },
    { role: 'ICU / Emergency / OT Nurse', scope: 'Specialised critical-care roles built on a few years’ experience.' },
    { role: 'Community Health Nurse', scope: 'Public-health and primary-care roles, including government service.' },
    { role: 'International Nursing (Gulf / UK / Europe)', scope: 'Strong, sought-after overseas demand — a major Kerala career path.' },
    { role: 'Higher studies — M.Sc Nursing', scope: 'Route into nurse education and senior clinical roles.' },
  ],
  paramedical: [
    { role: 'Medical Lab Technologist', scope: 'Run diagnostic lab tests — steady demand in hospitals and diagnostic chains.' },
    { role: 'Radiology / Imaging Technologist', scope: 'Operate X-ray, CT and MRI equipment.' },
    { role: 'OT / Dialysis / Cardiac Technician', scope: 'Specialised hospital technician roles by branch.' },
    { role: 'Lab or Department Supervisor', scope: 'Move into supervision with experience.' },
    { role: 'Overseas allied-health roles', scope: 'Many paramedical qualifications travel well to the Gulf.' },
  ],
  pharmacy: [
    { role: 'Hospital Pharmacist', scope: 'Dispense and manage medicines within hospitals.' },
    { role: 'Community / Retail Pharmacist', scope: 'Staff or own a pharmacy — a stable, self-employable path.' },
    { role: 'Drug Inspector (Govt)', scope: 'Regulatory role via PSC — a respected public posting.' },
    { role: 'Pharma Industry — Production / QA / R&D', scope: 'Manufacturing and quality roles in the large pharmaceutical sector.' },
    { role: 'Higher studies — M.Pharm / Pharm.D', scope: 'Specialise into clinical pharmacy or research.' },
  ],
  architecture: [
    { role: 'Architect', scope: 'Design buildings — the licensed core role (registration with the Council of Architecture).' },
    { role: 'Interior Designer', scope: 'Design interiors and spaces for homes, offices and retail.' },
    { role: 'Urban / Town Planner', scope: 'Plan cities and infrastructure, including government planning roles.' },
    { role: 'Construction / Project Manager', scope: 'Manage building projects on site.' },
    { role: 'Higher studies — M.Arch / Urban Design', scope: 'Specialise or move toward your own practice and academia.' },
  ],
  agriculture: [
    { role: 'Agricultural Officer (Govt)', scope: 'Advise farmers and run schemes — a sought-after Kerala PSC posting.' },
    { role: 'Agri-business / Agritech roles', scope: 'Work in seeds, agri-inputs and farm startups — a growing area.' },
    { role: 'Plantation / Farm Manager', scope: 'Manage estates and large farms.' },
    { role: 'Agriculture Officer in banks (NABARD / rural banks)', scope: 'Agriculture-specialist roles in the banking sector.' },
    { role: 'Higher studies — M.Sc Agriculture', scope: 'Route into research (KAU / ICAR) and senior officer roles.' },
  ],
  veterinary: [
    { role: 'Veterinary Surgeon', scope: 'Treat animals — the core clinical role.' },
    { role: 'Government Veterinary Officer', scope: 'Public veterinary hospitals and the animal-husbandry department.' },
    { role: 'Livestock / Dairy / Poultry industry', scope: 'Technical and management roles in the livestock sector.' },
    { role: 'Own Veterinary Practice', scope: 'Independent clinics, including fast-growing pet-care demand.' },
    { role: 'Higher studies — M.V.Sc', scope: 'Specialise in surgery, medicine or research.' },
  ],
  fisheries: [
    { role: 'Fisheries Officer (Govt)', scope: 'Roles in the state fisheries department.' },
    { role: 'Aquaculture Manager', scope: 'Run fish and shrimp farms — an export-driven, growing sector.' },
    { role: 'Seafood Processing / Export', scope: 'Quality and operations roles in seafood export companies.' },
    { role: 'Marine / Fisheries Researcher', scope: 'Research with institutes like CMFRI and CIFT.' },
    { role: 'Higher studies — M.F.Sc', scope: 'Route into research and senior roles.' },
  ],
  law: [
    { role: 'Advocate', scope: 'Practise in the courts — the core legal career.' },
    { role: 'Corporate / Company Lawyer', scope: 'Legal roles inside companies and law firms — strong, growing demand.' },
    { role: 'Public Prosecutor / Government Pleader', scope: 'Represent the state in court.' },
    { role: 'Legal Advisor', scope: 'Advise businesses, banks and organisations.' },
    { role: 'Judiciary (via judicial-service exams)', scope: 'Become a judge through competitive judicial exams.' },
  ],
  science: [
    { role: 'Research / Lab Scientist', scope: 'Work in research labs — a strong path via higher studies.' },
    { role: 'Teacher / Lecturer', scope: 'School and college teaching after B.Ed / PG / NET.' },
    { role: 'Industry — QC / R&D Analyst', scope: 'Quality and research roles in pharma, food, chemicals and IT.' },
    { role: 'Data / IT roles', scope: 'Maths, stats and CS graduates often move into data and software work.' },
    { role: 'Higher studies — M.Sc / PhD', scope: 'Usually needed to reach research and teaching careers.' },
  ],
  commerce: [
    { role: 'Accountant / Auditor', scope: 'The core finance role, needed in firms of every size.' },
    { role: 'Banking & Finance', scope: 'Bank, NBFC and finance-company roles — a large, steady recruiter.' },
    { role: 'Tax / GST Consultant', scope: 'Advise on tax and compliance, in a firm or independently.' },
    { role: 'CA / CMA / CS (professional study)', scope: 'Professional qualifications that greatly widen scope, studied alongside or after the degree.' },
    { role: 'Higher studies — M.Com / MBA', scope: 'Route into management and senior finance.' },
  ],
  arts: [
    { role: 'Civil Services / Government (UPSC, PSC)', scope: 'Humanities suit civil-service and PSC exams — a major aspiration path.' },
    { role: 'Teacher / Lecturer', scope: 'School and college teaching after B.Ed / PG / NET.' },
    { role: 'Media, Journalism & Content', scope: 'Writing, reporting and content roles — a growing digital field.' },
    { role: 'Social Work / Psychology / NGO', scope: 'People-facing roles depending on your specialisation.' },
    { role: 'Higher studies — MA / MSW / Law (LLB)', scope: 'Deepen a specialisation, or move into law or research.' },
  ],
  design: [
    { role: 'Graphic / UI–UX Designer', scope: 'Design for digital products and brands — fast-growing alongside tech.' },
    { role: 'Product / Industrial Designer', scope: 'Design physical products and how they work.' },
    { role: 'Animation / Motion / Game Designer', scope: 'Creative roles across media, advertising and gaming.' },
    { role: 'Freelance / Own Studio', scope: 'Many designers build independent or studio careers.' },
    { role: 'Higher studies — M.Des', scope: 'Specialise or move into design leadership.' },
  ],
  'hotel-management': [
    { role: 'Hotel Operations (Front Office / F&B / Housekeeping)', scope: 'Run hotel departments — a global industry with easy mobility.' },
    { role: 'Chef / Food Production', scope: 'Kitchen and culinary careers, from hotels to your own venture.' },
    { role: 'Cruise Line / Airline / Hospitality abroad', scope: 'Strong overseas demand — a major draw of this field.' },
    { role: 'Event & Catering Management', scope: 'Manage events and catering, including your own business.' },
    { role: 'Higher studies — MBA (Hospitality)', scope: 'Route into hotel and general management.' },
  ],
  'fine-arts': [
    { role: 'Professional Artist / Illustrator', scope: 'Create and sell art on a freelance or commission basis.' },
    { role: 'Graphic / Digital Artist', scope: 'Apply art skills to digital media and design — broadens job options considerably.' },
    { role: 'Art Teacher', scope: 'Teach art in schools and colleges.' },
    { role: 'Gallery / Museum / Curation', scope: 'Roles across the art and culture sector.' },
    { role: 'Art Director (media)', scope: 'Lead visual direction in film, advertising and publishing with experience.' },
  ],
  education: [
    { role: 'School Teacher', scope: 'The core role after B.Ed — steady demand, including government posts via K-TET / PSC.' },
    { role: 'Special Educator', scope: 'Teach learners with special needs — a growing area of demand.' },
    { role: 'Headmaster / Principal', scope: 'Lead a school with experience.' },
    { role: 'Education Content / EdTech', scope: 'Curriculum, content and online-teaching roles.' },
    { role: 'Higher studies — M.Ed / NET', scope: 'Route into college teaching and education research.' },
  ],
  polytechnic: [
    { role: 'Junior Engineer / Technician', scope: 'Diploma-level technical roles in industry and government (JE posts via PSC).' },
    { role: 'Supervisor / Site roles', scope: 'Lead technical work on site as you gain experience.' },
    { role: 'PSU / Government Technician', scope: 'Stable technical posts in PSUs, KSEB and railways.' },
    { role: 'Lateral entry to B.Tech', scope: 'Use the diploma to join engineering directly in the 2nd year — a common route.' },
    { role: 'Self-employment / Contractor', scope: 'Trade skills support independent and contract work.' },
  ],
};
