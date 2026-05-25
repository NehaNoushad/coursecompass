from fpdf import FPDF


class CoursesPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, "Courses Organized by Entrance Exam (Kerala)", align="R")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def title_page(self):
        self.add_page()
        self.set_y(80)
        self.set_font("Helvetica", "B", 26)
        self.set_text_color(20, 40, 90)
        self.cell(0, 15, "Courses Organized by", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 15, "Entrance Exam", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(4)
        self.set_font("Helvetica", "", 14)
        self.set_text_color(60, 60, 60)
        self.cell(0, 10, "Kerala UG Admissions Guide", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(6)
        self.set_draw_color(20, 40, 90)
        self.set_line_width(0.8)
        self.line(70, self.get_y(), 140, self.get_y())
        self.ln(20)
        self.set_font("Helvetica", "", 11)
        self.set_text_color(80, 80, 80)
        self.multi_cell(
            0, 7,
            "Each entrance exam in this guide is paired with the UG courses it unlocks. "
            "Courses needing no entrance are grouped under 'Free of Crack'. Courses that "
            "require entrances outside the Kerala-relevant list are grouped under "
            "'Non Kerala Courses'.",
            align="C"
        )

    def section_heading(self, text):
        if self.get_y() > 250:
            self.add_page()
        self.ln(4)
        self.set_fill_color(20, 40, 90)
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 13)
        self.cell(0, 9, "  " + text, fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        self.set_text_color(0, 0, 0)

    def sub_heading(self, text):
        if self.get_y() > 255:
            self.add_page()
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(20, 40, 90)
        self.cell(0, 7, text, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(0, 0, 0)

    def bullets(self, items):
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(40, 40, 40)
        left_margin = self.l_margin
        for it in items:
            if self.get_y() > 270:
                self.add_page()
            self.set_x(left_margin + 6)
            self.cell(4, 6, "-")
            self.multi_cell(
                w=self.w - self.r_margin - (left_margin + 10),
                h=6,
                txt=it,
            )
        self.set_text_color(0, 0, 0)


pdf = CoursesPDF()
pdf.set_auto_page_break(auto=True, margin=18)
pdf.set_margins(left=18, top=18, right=18)

pdf.title_page()
pdf.add_page()

# ENGINEERING block
pdf.section_heading("ENGINEERING")

pdf.sub_heading("JEE Main")
pdf.bullets([
    "All B.Tech / B.E. branches: Computer Science, Information Technology, "
    "Electronics & Communication, Electrical, EEE, Mechanical, Civil, "
    "Aerospace/Aeronautical, Automobile, Biomedical, Biotechnology, Chemical, "
    "Petroleum, Mining, Metallurgical, Materials Science, Industrial, Production, "
    "Instrumentation, Robotics & Automation, AI & ML, Data Science, Cyber Security, "
    "IoT, Naval Architecture & Ocean, Agricultural, Food Tech, Textile, Plastics, "
    "Printing, Fire & Safety, Environmental, Marine, Mechatronics, Manufacturing, "
    "Nuclear, Structural, Software, Cloud Computing, Geoinformatics",
])

pdf.sub_heading("JEE Advanced")
pdf.bullets([
    "All B.Tech branches (specifically at IIT Palakkad)",
    "Dual-degree B.Tech + M.Tech at IITs",
    "B.Sc. Research at IIST (IIST admission is via JEE Advanced)",
])

pdf.sub_heading("KEAM")
pdf.bullets([
    "All B.Tech / B.E. branches (Kerala state quota)",
    "B.Pharm",
    "B.Arch (alternative path)",
    "B.Sc. Agriculture / Horticulture / Forestry (Kerala state quota partial)",
])

pdf.sub_heading("CUSAT CAT")
pdf.bullets([
    "B.Tech at CUSAT (all branches)",
    "B.Tech Marine Engineering",
    "B.Sc. Photonics, Electronics, Instrumentation",
    "BBA LLB (5-year) at CUSAT",
    "B.Sc. LLB at CUSAT",
    "Integrated M.Sc. programs at CUSAT",
    "B.Voc programs at CUSAT",
])

# MEDICAL block
pdf.section_heading("MEDICAL / DENTAL / AYUSH / NURSING / PARAMEDICAL")

pdf.sub_heading("NEET UG")
pdf.bullets([
    "MBBS",
    "BDS (Dentistry)",
    "BAMS (Ayurveda)",
    "BHMS (Homeopathy)",
    "BUMS (Unani)",
    "BSMS (Siddha)",
    "BNYS (Naturopathy & Yoga)",
    "BVSc & AH (Veterinary)",
])

pdf.sub_heading("KUHS Paramedical Entrance")
pdf.bullets([
    "B.Sc. Nursing",
    "BPT (Physiotherapy)",
    "BOT (Occupational Therapy)",
    "B.Sc. MLT",
    "B.Sc. Radiology & Imaging Technology",
    "B.Sc. Optometry",
    "B.Sc. Cardiac Technology",
    "B.Sc. Cardiovascular Technology",
    "B.Sc. Dialysis Technology",
    "B.Sc. Renal Dialysis Technology",
    "B.Sc. Operation Theatre Technology",
    "B.Sc. Anaesthesia Technology",
    "B.Sc. Perfusion Technology",
    "B.Sc. Respiratory Therapy",
    "B.Sc. Radiotherapy Technology",
    "B.Sc. Nuclear Medicine Technology",
    "B.Sc. Emergency Medical Technology",
    "B.Sc. Neuroscience Technology",
    "B.Sc. Orthotics & Prosthetics",
    "BASLP (Audiology & Speech Language Pathology)",
    "B.Sc. Physician Assistant",
    "B.Sc. Anaesthesia & OT Technology",
    "B.Sc. Biomedical Science",
    "B.Sc. Clinical Research",
    "B.Sc. Public Health",
    "B.Sc. Epidemiology",
    "B.Sc. Yoga & Naturopathy",
    "B.Sc. Prosthetics & Orthotics",
])

pdf.sub_heading("LBS Allied Health Entrance")
pdf.bullets([
    "All Allied Health B.Sc. courses listed above (parallel route for govt seats)",
    "GNM (General Nursing & Midwifery diploma)",
    "ANM (Auxiliary Nursing Midwifery diploma)",
    "D.Pharm (Diploma in Pharmacy)",
    "DMLT (Diploma in Medical Lab Technology)",
    "DMRT (Diploma in Medical Radiography)",
    "Diploma in Physiotherapy",
    "Diploma in Ophthalmic Technology",
])

# ARCHITECTURE
pdf.section_heading("ARCHITECTURE")

pdf.sub_heading("NATA")
pdf.bullets([
    "B.Arch (Architecture)",
    "B.Planning (Urban & Regional Planning)",
    "B.Des Interior Design (some colleges)",
])

pdf.sub_heading("JEE Main Paper 2")
pdf.bullets([
    "B.Arch (at NITs, IITs, CFTIs)",
    "B.Planning (at NITs)",
])

# AGRICULTURE
pdf.section_heading("AGRICULTURE / VETERINARY / FISHERIES")

pdf.sub_heading("ICAR AIEEA UG")
pdf.bullets([
    "B.Sc. Agriculture",
    "B.Sc. Horticulture",
    "B.Sc. Forestry",
    "B.Sc. Fisheries Science",
    "B.Sc. Aquaculture",
    "B.Sc. Sericulture",
    "B.Sc. Agricultural Biotechnology",
    "B.Sc. Food Technology",
    "B.Sc. Dairy Technology",
    "B.Sc. Poultry Science",
    "B.Sc. Post-Harvest Technology",
    "B.Sc. Agribusiness Management",
    "B.Sc. Soil Science",
    "B.Sc. Plant Pathology",
    "B.Sc. Agricultural Economics",
    "B.Tech Agricultural Engineering",
    "B.Tech Food Technology",
])

pdf.sub_heading("KAU Entrance")
pdf.bullets([
    "B.Sc. Agriculture (Kerala Agricultural University)",
    "B.Sc. Horticulture",
    "B.Sc. Forestry",
    "B.Sc. Climate Change & Environmental Science",
    "B.Tech Agricultural Engineering (Tavanur)",
    "B.Sc. Co-operation Banking & Management",
])

pdf.sub_heading("Kerala Veterinary University Entrance")
pdf.bullets([
    "BVSc & AH (state quota)",
    "B.Tech Dairy Technology",
    "B.F.Sc.",
])

pdf.sub_heading("KUFOS Entrance")
pdf.bullets([
    "B.Sc. Fisheries Science",
    "B.Sc. Aquaculture",
    "B.F.Sc. (Bachelor of Fisheries Science)",
    "B.Tech Food Technology (KUFOS)",
    "B.Sc. Industrial Fisheries",
])

# LAW
pdf.section_heading("LAW")

pdf.sub_heading("CLAT")
pdf.bullets([
    "BA LLB (at NUALS Kochi)",
    "BBA LLB",
    "B.Com LLB",
    "B.Sc. LLB",
    "BCom LLB",
])

pdf.sub_heading("KLEE")
pdf.bullets([
    "BA LLB (Kerala government law colleges, 5-year)",
    "BBA LLB",
    "B.Com LLB",
])

# MANAGEMENT / COMMERCE / ARTS / HUMANITIES / GENERAL UG
pdf.section_heading("MANAGEMENT / COMMERCE / ARTS / HUMANITIES / GENERAL UG")

pdf.sub_heading("CUET UG")
pdf.bullets([
    "B.Com (General, Honours, Accounting & Finance, Banking & Insurance, "
    "Financial Markets, Computer Applications, Taxation, E-Commerce)",
    "BBA (Finance, Marketing, HRM, International Business, Logistics & SC, "
    "Retail, Aviation, Hospital, Tourism, Digital Marketing, Entrepreneurship)",
    "BMS, BBM, BBS",
    "BA Economics / B.Sc. Economics",
    "BA History, Geography, Political Science, Sociology, Psychology, "
    "Philosophy, Anthropology, Public Administration, Archaeology, Criminology, "
    "Human Rights, Gender Studies, Development Studies, International Relations, "
    "Peace & Conflict Studies",
    "BA English / Hindi / Tamil / Sanskrit / Arabic / Persian / French / German / "
    "Spanish / Russian / Japanese / Chinese / Urdu Literature",
    "BA Linguistics, Comparative Literature, Translation Studies",
    "BA Journalism & Mass Communication (BJMC)",
    "BA Communication Studies, Media Studies, Public Relations, Advertising, "
    "Digital Media, Film Studies, Broadcasting",
    "BMM (Bachelor of Mass Media)",
    "B.El.Ed (Bachelor of Elementary Education)",
    "BA B.Ed / B.Sc. B.Ed / B.Com B.Ed (integrated 4-year)",
    "BPEd",
    "B.Sc. Sports Science / Sports Management / Exercise Science",
    "B.Lib.I.Sc.",
    "BSW (Bachelor of Social Work)",
    "B.Sc. (Physics, Chemistry, Mathematics, Statistics, Computer Science, "
    "Electronics, Biotechnology, Microbiology, Biochemistry, Zoology, Botany, "
    "Environmental Science, Geology, Astronomy/Astrophysics, Forensic Science, "
    "Nutrition, Home Science, Industrial Chemistry, Genetics, Nanotechnology, "
    "Bioinformatics, Actuarial Science, Information Science, Data Science, AI, "
    "Cyber Security, Psychology)",
    "Integrated BA+MA, B.Com+MBA, BCA+MCA at central universities",
])

pdf.sub_heading("KMAT")
pdf.bullets([
    "BBA at Kerala private/management institutes accepting KMAT",
    "BHM at private hospitality institutes (Kerala)",
])

pdf.sub_heading("Kerala University Entrance")
pdf.bullets([
    "All BA / B.Sc. / B.Com / BCA / BBA at colleges affiliated to University of Kerala",
    "BA Malayalam, BA English, BA Economics, BA History, BA Political Science, "
    "BA Sociology, BA Philosophy",
    "B.Sc. all general science subjects at affiliated colleges",
    "B.Com, BBA at affiliated colleges",
])

pdf.sub_heading("MG University Entrance")
pdf.bullets([
    "All BA / B.Sc. / B.Com / BCA / BBA at MG University affiliated colleges "
    "(Kottayam, Idukki, Ernakulam region)",
])

pdf.sub_heading("Calicut University Entrance")
pdf.bullets([
    "All BA / B.Sc. / B.Com / BCA / BBA at Calicut University affiliated colleges "
    "(Malappuram, Kozhikode, Wayanad, Palakkad)",
])

pdf.sub_heading("Kannur University Entrance")
pdf.bullets([
    "All BA / B.Sc. / B.Com / BCA / BBA at Kannur University affiliated colleges "
    "(Kannur, Kasaragod)",
])

pdf.sub_heading("Kerala Sanskrit University Entrance")
pdf.bullets([
    "BA Sanskrit",
    "Shastri (BA equivalent - UGC recognised)",
    "BA Vedic Studies / Jyotish",
    "BA Philosophy (Sanskrit stream)",
    "BA Sanskrit Literature",
    "BA Sanskrit + Vyakarana / Nyaya / Sahitya",
])

pdf.sub_heading("Malayalam University Entrance")
pdf.bullets([
    "BA Malayalam Literature",
    "BA Comparative Literature (Malayalam)",
    "BA Translation Studies (Malayalam)",
    "BA Folklore Studies",
])

# DESIGN
pdf.section_heading("DESIGN / FASHION / FINE ARTS")

pdf.sub_heading("NIFT Entrance")
pdf.bullets([
    "B.Des Fashion Design",
    "B.Des Textile Design",
    "B.Des Accessory Design",
    "B.Des Leather Design",
    "B.Des Communication Design (NIFT)",
    "B.Des Knitwear Design",
    "B.FTech (Fashion Technology)",
])

pdf.sub_heading("NID DAT")
pdf.bullets([
    "B.Des at NID (Industrial, Communication, Textile, Animation, Furniture, "
    "Ceramic & Glass, Jewellery)",
    "B.Des Interior Design (NID)",
    "B.Des Product Design",
])

pdf.sub_heading("UCEED")
pdf.bullets([
    "B.Des at IIT Bombay, IIT Delhi, IIT Guwahati, IIT Hyderabad, IIITDM Jabalpur",
    "B.Des Interaction / UX Design at IITs",
])

# HOTEL MANAGEMENT
pdf.section_heading("HOTEL MANAGEMENT")

pdf.sub_heading("NCHMCT JEE")
pdf.bullets([
    "BHM (Bachelor of Hotel Management) - 3 year",
    "B.Sc. Hospitality & Hotel Administration (IHMs)",
])

# SCIENCE / INTEGRATED / RESEARCH
pdf.section_heading("SCIENCE / INTEGRATED / RESEARCH")

pdf.sub_heading("IISER Aptitude Test (IAT)")
pdf.bullets([
    "Integrated BS-MS (Physics, Chemistry, Biology, Mathematics, Earth Sciences, "
    "Economics) at IISER TVM and other IISERs",
])

pdf.sub_heading("NEST")
pdf.bullets([
    "Integrated M.Sc. at NISER Bhubaneswar",
    "Integrated M.Sc. at UM-DAE CBS Mumbai",
])

# DEFENCE
pdf.section_heading("DEFENCE & UNIFORMED")

pdf.sub_heading("NDA (UPSC)")
pdf.bullets([
    "NDA admission (Army, Navy, Air Force wings)",
    "B.A. / B.Sc. / B.Tech at NDA Khadakwasla",
    "Indian Naval Academy (INAC) - 10+2 cadet entry",
    "Coast Guard Officer (through NDA route)",
])

pdf.sub_heading("INET")
pdf.bullets([
    "Indian Navy Officer entry routes (mostly graduate-level, but 10+2 B.Tech entry exists)",
    "B.Tech at INA Ezhimala (10+2 (B.Tech) Cadet Entry - now under INET pattern)",
])

pdf.sub_heading("AFCAT")
pdf.bullets([
    "Air Force Officer entry (graduate-level; included as the uniformed-services path)",
])

pdf.sub_heading("TES (Technical Entry Scheme)")
pdf.bullets([
    "B.Tech at CME Pune, MCTE Mhow, MCEME Secunderabad (Army Technical Officer cadet)",
])

pdf.sub_heading("Coast Guard Navik / Yantrik")
pdf.bullets([
    "Coast Guard Navik (General Duty)",
    "Coast Guard Navik (Domestic Branch)",
    "Yantrik (Mechanical / Electrical / Electronics - diploma stream)",
])

pdf.sub_heading("Merchant Navy IMU CET")
pdf.bullets([
    "B.Sc. Nautical Science",
    "B.Tech Marine Engineering",
    "B.Tech Naval Architecture & Ocean Engineering (IMU)",
    "DNS (Diploma in Nautical Science)",
    "B.Sc. Ship Building",
    "BBA Logistics & Shipping (IMU)",
    "B.Sc. Maritime Catering / Hospitality",
])

# POLYTECHNIC
pdf.section_heading("POLYTECHNIC / DIPLOMA")

pdf.sub_heading("Kerala Polytechnic Entrance (LBS)")
pdf.bullets([
    "Diploma in Civil Engineering",
    "Diploma in Mechanical Engineering",
    "Diploma in Electrical Engineering",
    "Diploma in Electronics",
    "Diploma in Computer Engineering",
    "Diploma in Chemical Engineering",
    "Diploma in Automobile Engineering",
    "Diploma in Architecture",
    "Diploma in Fashion Design (Polytechnic stream)",
    "Diploma in Commercial Practice",
    "All other 3-year polytechnic diplomas",
])

# EDUCATION
pdf.section_heading("EDUCATION")

pdf.sub_heading("Kerala D.El.Ed Entrance")
pdf.bullets([
    "D.El.Ed (Diploma in Elementary Education)",
])

# FREE OF CRACK
pdf.section_heading("FREE OF CRACK")
pdf.set_font("Helvetica", "I", 10)
pdf.set_text_color(80, 80, 80)
pdf.multi_cell(0, 6, "No entrance required - direct admission, merit, or audition-based.")
pdf.set_text_color(0, 0, 0)
pdf.ln(1)
pdf.bullets([
    "ITI Courses (Electrician, Fitter, Welder, Turner, Plumber, Machinist etc.)",
    "Diploma in Beauty & Cosmetology",
    "Diploma in Hair Styling",
    "Diploma in Makeup Artistry",
    "Diploma in Spa Management",
    "Diploma in Culinary Arts",
    "Diploma in Bakery & Confectionery",
    "Certificate in Patisserie",
    "Diploma in Photography",
    "Diploma in Filmmaking / Direction",
    "Diploma in Editing & Post Production",
    "Diploma in Sound Design",
    "Diploma in VFX & Animation",
    "Diploma in Journalism",
    "Diploma in Web Design",
    "Diploma in Graphic Design",
    "Diploma in Cyber Security (private institutes)",
    "Diploma in Hardware & Networking (CCNA, CompTIA)",
    "DCA (Diploma in Computer Applications)",
    "PGDCA",
    "Diploma in Banking & Finance",
    "Diploma in Taxation",
    "Diploma in Fire & Safety",
    "B.Sc. Fire & Safety (most private colleges)",
    "Diploma in Airport Ground Staff",
    "Air Hostess / Cabin Crew Training",
    "Diploma in Aviation Management",
    "Diploma in Hotel Management (non-IHM private)",
    "Diploma in Textile Design (private)",
    "Diploma in Garment Technology",
    "BA Buddhist Studies",
    "BA Islamic Studies",
    "BA Christian Theology (seminaries)",
    "BA Vedic Studies / Jyotish (open admission in many)",
    "BPA (Bachelor of Performing Arts) - audition based",
    "BA Music (Vocal / Instrumental) - audition based",
    "BA Dance (Classical / Contemporary) - audition based",
    "BA Theatre & Drama - audition based",
    "BA Visual Arts - portfolio based",
    "BA Bharatanatyam / Kathak / Odissi - audition based",
    "Sangeet Visharad (Gandharva Mahavidyalaya etc.)",
    "BFA Animation (most colleges)",
    "Diploma in Dramatic Arts (NSD and equivalents - audition based, no written exam)",
    "BFA (at many Kerala state colleges - portfolio + interview)",
    "BA Tourism Management (many open-admission colleges)",
    "BA Travel & Tourism",
    "BBA Tourism & Hospitality (many private colleges, direct admission)",
    "BPEd (many Kerala colleges accept Plus 2 marks directly)",
    "Police direct constable recruitment (not a course - recruitment via PSC)",
])

# NON KERALA COURSES
pdf.section_heading("NON KERALA COURSES")
pdf.set_font("Helvetica", "I", 10)
pdf.set_text_color(80, 80, 80)
pdf.multi_cell(0, 6, "Require entrance exams not in the Kerala-relevant list.")
pdf.set_text_color(0, 0, 0)
pdf.ln(1)
pdf.bullets([
    "CA Foundation - ICAI Foundation Exam",
    "CMA Foundation - ICMAI Foundation Exam",
    "CS Foundation - ICSI CSEET",
    "B.Com + CFA (integrated) - CFA Level 1 (post B.Com)",
    "BFM (Bachelor of Financial Markets) - Mumbai Univ entrance / direct",
    "BAF (Bachelor of Accounting & Finance) - Mumbai Univ entrance / direct",
    "BBI (Bachelor of Banking & Insurance) - Mumbai Univ entrance / direct",
    "IPM (Integrated MBA at IIM Indore / Rohtak / Jammu) - IPMAT",
    "IPM at IIM Kozhikode - IIM-K IPM Aptitude Test",
    "BBA at NMIMS - NPAT",
    "BBA at Symbiosis - SET",
    "BBA at Christ University - Christ Entrance Test",
    "BBA at DU - earlier DU JAT (now CUET)",
    "AIMA UGAT colleges BBA - UGAT",
    "BHM at non-NCHMCT institutes - AIHMCT WAT",
    "BHM at IIHM - IIHM eCHAT",
    "BHM at Christ University - Christ Entrance",
    "Mass Communication at IIMC - IIMC Entrance Exam",
    "Mass Communication at Jamia (JMI) - JMI Mass Comm Entrance",
    "Mass Communication at Symbiosis - SET (Media)",
    "Mass Communication at Xavier's (XIC) - XIC OET",
    "Mass Communication at ACJ - ACJ Entrance",
    "BFA at JJ School of Art - JJ Entrance",
    "BFA at BHU - BHU UET",
    "BFA at Delhi College of Art - DCA Entrance",
    "B.Des at Pearl Academy - Pearl Academy Entrance Exam",
    "B.Des at Srishti Manipal - Srishti Entrance",
    "B.Des at MIT Institute of Design - MIT ID DAT",
    "B.Des at Symbiosis Institute of Design - SEED",
    "B.Des at UPES - UPES DAT",
    "B.Sc. Statistics at ISI - ISI Admission Test",
    "B.Math / B.Stat at ISI - ISI Admission Test",
    "B.Sc. (Hons) Math & CS at CMI - CMI Entrance",
    "B.Sc. Research at IISc Bangalore - KVPY / JEE Advanced",
    "B.Sc. Speech & Hearing at AIISH Mysore - AIISH PMSAT",
    "B.Sc. Forensic Science at LNJN NICFS - LNJN Entrance",
    "B.Sc. Forensic Science at NFSU - NFSU CUET",
    "B.Sc. Animation at top institutes - Institute-specific aptitude",
    "Commercial Pilot License (CPL) - DGCA Class 1 Medical + Flying School Entrance",
    "B.Sc. Aviation (private flight schools) - School-specific entrance",
    "B.Tech at BITS Pilani - BITSAT",
    "B.Tech at VIT - VITEEE",
    "B.Tech at SRM - SRMJEEE",
    "B.Tech at Amrita - AEEE",
    "B.Tech at Manipal - MET",
    "B.Tech in Karnataka private - COMEDK UGET",
    "B.Tech in Maharashtra - MHT CET",
    "B.Tech in West Bengal - WBJEE",
    "B.Tech in Tamil Nadu - TNEA",
    "B.Tech in Andhra Pradesh - AP EAMCET",
    "B.Tech in Telangana - TS EAMCET",
    "B.Tech in Karnataka govt - KCET",
    "BBA + MBA dual at private institutes - Institute-specific",
    "BVoc / Integrated MA at TISS - TISS BAT",
    "B.A. (Hons) at Ashoka / Krea / Azim Premji - Institute-specific Aptitude",
])

pdf.output("/Users/Dreamers/Desktop/new/Courses_By_Exam.pdf")
print("PDF created at /Users/Dreamers/Desktop/new/Courses_By_Exam.pdf")
