from fpdf import FPDF

# Structured course data: list of (section_title, [(subheading_or_None, [items])])
DATA = [
    ("SCIENCE STREAM (PCM)", [
        ("Engineering & Technology (B.Tech / B.E.)", [
            "Computer Science Engineering",
            "Information Technology",
            "Electronics & Communication Engineering",
            "Electrical Engineering",
            "Electrical & Electronics Engineering",
            "Mechanical Engineering",
            "Civil Engineering",
            "Aerospace / Aeronautical Engineering",
            "Automobile Engineering",
            "Biomedical Engineering",
            "Biotechnology Engineering",
            "Chemical Engineering",
            "Petroleum Engineering",
            "Mining Engineering",
            "Metallurgical Engineering",
            "Materials Science Engineering",
            "Industrial Engineering",
            "Production Engineering",
            "Instrumentation Engineering",
            "Robotics & Automation",
            "Artificial Intelligence & Machine Learning",
            "Data Science Engineering",
            "Cyber Security Engineering",
            "Internet of Things (IoT)",
            "Naval Architecture & Ocean Engineering",
            "Agricultural Engineering",
            "Food Technology Engineering",
            "Textile Engineering",
            "Plastics Engineering",
            "Printing Technology",
            "Fire & Safety Engineering",
            "Environmental Engineering",
            "Marine Engineering",
            "Mechatronics Engineering",
            "Manufacturing Engineering",
            "Nuclear Engineering",
            "Structural Engineering (integrated)",
            "Software Engineering",
            "Cloud Computing Engineering",
            "Geoinformatics Engineering",
        ]),
        ("Pure Sciences (B.Sc.)", [
            "B.Sc. Physics",
            "B.Sc. Chemistry",
            "B.Sc. Mathematics",
            "B.Sc. Statistics",
            "B.Sc. Computer Science",
            "B.Sc. Electronics",
            "B.Sc. Biotechnology",
            "B.Sc. Microbiology",
            "B.Sc. Biochemistry",
            "B.Sc. Zoology",
            "B.Sc. Botany",
            "B.Sc. Environmental Science",
            "B.Sc. Geology",
            "B.Sc. Astronomy / Astrophysics",
            "B.Sc. Forensic Science",
            "B.Sc. Food Science & Technology",
            "B.Sc. Nutrition & Dietetics",
            "B.Sc. Optometry",
            "B.Sc. Physiotherapy (some colleges)",
            "B.Sc. Agriculture",
            "B.Sc. Horticulture",
            "B.Sc. Forestry",
            "B.Sc. Sericulture",
            "B.Sc. Fisheries Science",
            "B.Sc. Aquaculture",
            "B.Sc. Dairy Technology",
            "B.Sc. Poultry Science",
            "B.Sc. Data Science",
            "B.Sc. Artificial Intelligence",
            "B.Sc. Cyber Security",
            "B.Sc. Animation & VFX (some)",
            "B.Sc. Nautical Science",
            "B.Sc. Aviation",
            "B.Sc. Interior Design (some)",
            "B.Sc. Fashion Technology",
            "B.Sc. Information Science",
            "B.Sc. Actuarial Science",
            "B.Sc. Bioinformatics",
            "B.Sc. Genetics",
            "B.Sc. Nanotechnology",
            "B.Sc. Industrial Chemistry",
            "B.Sc. Textile Science",
            "B.Sc. Home Science",
            "B.Sc. Psychology (some colleges accept PCM)",
            "B.Sc. Speech & Hearing",
            "B.Sc. Cardiac Technology",
            "B.Sc. Dialysis Technology",
            "B.Sc. Medical Lab Technology (MLT)",
            "B.Sc. Radiology & Imaging Technology",
            "B.Sc. Operation Theatre Technology",
            "B.Sc. Anaesthesia Technology",
            "B.Sc. Perfusion Technology",
            "B.Sc. Respiratory Therapy",
            "B.Sc. Renal Dialysis Technology",
            "B.Sc. Radiotherapy Technology",
            "B.Sc. Nuclear Medicine Technology",
        ]),
        ("Medical & Allied Health (PCB required mainly, but listed here)", [
            "MBBS",
            "BDS (Dentistry)",
            "BAMS (Ayurveda)",
            "BHMS (Homeopathy)",
            "BUMS (Unani)",
            "BSMS (Siddha)",
            "BNYS (Naturopathy & Yoga)",
            "B.Pharm (Pharmacy)",
            "Pharm.D (Doctor of Pharmacy)",
            "BPT (Physiotherapy)",
            "BOT (Occupational Therapy)",
            "B.Sc. Nursing",
            "B.Sc. MLT",
            "B.Sc. Radiology",
            "B.Sc. Optometry",
            "B.Sc. Audiology & Speech Language Pathology",
            "B.Sc. Cardiac Technology",
            "B.Sc. Cardiovascular Technology",
            "B.Sc. Emergency Medical Technology",
            "B.Sc. Neuroscience Technology",
            "B.Sc. Orthotics & Prosthetics",
            "B.Sc. Renal Technology",
            "BASLP (Audiology & Speech Language Pathology)",
            "BVSc & AH (Veterinary Science)",
            "B.Sc. Physician Assistant",
            "B.Sc. Anesthesia & OT Technology",
            "GNM (General Nursing & Midwifery - diploma)",
            "ANM (Auxiliary Nursing Midwifery - diploma)",
        ]),
        ("Architecture & Planning", [
            "B.Arch (Architecture)",
            "B.Planning (Urban & Regional Planning)",
            "B.Des in Interior Design (some need NATA)",
        ]),
    ]),
    ("SCIENCE STREAM (PCB)", [
        ("Additional courses (most medical courses above apply)", [
            "B.Sc. Biomedical Science",
            "B.Sc. Human Genetics",
            "B.Sc. Clinical Research",
            "B.Sc. Nutrition & Dietetics",
            "B.Sc. Public Health",
            "B.Sc. Environmental Health",
            "B.Sc. Epidemiology",
            "B.Sc. Yoga & Naturopathy",
            "B.Sc. Physiotherapy",
            "B.Sc. Occupational Therapy",
            "B.Sc. Prosthetics & Orthotics",
        ]),
    ]),
    ("COMMERCE STREAM", [
        ("Business & Management", [
            "B.Com (Bachelor of Commerce) - General",
            "B.Com (Honours)",
            "B.Com (Accounting & Finance)",
            "B.Com (Banking & Insurance)",
            "B.Com (Financial Markets)",
            "B.Com (Computer Applications)",
            "B.Com (Taxation)",
            "B.Com (E-Commerce)",
            "BBA (Bachelor of Business Administration)",
            "BBA (Finance)",
            "BBA (Marketing)",
            "BBA (Human Resource Management)",
            "BBA (International Business)",
            "BBA (Logistics & Supply Chain)",
            "BBA (Retail Management)",
            "BBA (Aviation Management)",
            "BBA (Hospital Management)",
            "BBA (Tourism & Travel Management)",
            "BBA (Digital Marketing)",
            "BBA (Entrepreneurship)",
            "BMS (Bachelor of Management Studies)",
            "BBM (Bachelor of Business Management)",
            "BBS (Bachelor of Business Studies)",
        ]),
        ("Finance & Accounting", [
            "CA Foundation (Chartered Accountancy - ICAI)",
            "CMA Foundation (Cost & Management Accountancy - ICMAI)",
            "CS Foundation (Company Secretary - ICSI)",
            "B.Com + CFA (integrated in some colleges)",
            "BFM (Bachelor of Financial Markets)",
            "BAF (Bachelor of Accounting & Finance)",
            "BBI (Bachelor of Banking & Insurance)",
        ]),
        ("Economics", [
            "BA / B.Sc. Economics (Honours)",
            "B.Sc. Economics",
            "BA Economics",
        ]),
        ("Law (5-year integrated)", [
            "BA LLB",
            "BBA LLB",
            "B.Com LLB",
            "B.Sc. LLB",
            "BCom LLB",
        ]),
    ]),
    ("ARTS / HUMANITIES STREAM", [
        ("Social Sciences", [
            "BA History",
            "BA Geography",
            "BA Political Science",
            "BA Sociology",
            "BA Psychology",
            "BA Philosophy",
            "BA Anthropology",
            "BA Economics",
            "BA Public Administration",
            "BA Social Work (BSW)",
            "BA Archaeology",
            "BA Criminology",
            "BA Human Rights",
            "BA Gender Studies",
            "BA Development Studies",
            "BA International Relations",
            "BA Peace & Conflict Studies",
        ]),
        ("Languages & Literature", [
            "BA English Literature",
            "BA Hindi Literature",
            "BA Malayalam Literature",
            "BA Tamil Literature",
            "BA Telugu Literature",
            "BA Kannada Literature",
            "BA Bengali Literature",
            "BA Marathi Literature",
            "BA Punjabi Literature",
            "BA Urdu Literature",
            "BA Sanskrit",
            "BA Arabic",
            "BA Persian",
            "BA French",
            "BA German",
            "BA Spanish",
            "BA Russian",
            "BA Chinese / Mandarin",
            "BA Japanese",
            "BA Linguistics",
            "BA Comparative Literature",
            "BA Translation Studies",
        ]),
        ("Media & Communication", [
            "BA Journalism & Mass Communication (BJMC)",
            "BA Communication Studies",
            "BA Media Studies",
            "BA Public Relations",
            "BA Advertising",
            "BA Digital Media",
            "BA Film Studies",
            "BA Broadcasting",
            "BMM (Bachelor of Mass Media)",
        ]),
        ("Fine Arts & Performing Arts", [
            "BFA (Bachelor of Fine Arts) - Painting, Sculpture, Applied Art",
            "BPA (Bachelor of Performing Arts)",
            "BA Music (Vocal / Instrumental)",
            "BA Dance (Classical / Contemporary)",
            "BA Theatre & Drama",
            "BA Visual Arts",
            "BA Bharatanatyam / Kathak / Odissi etc.",
            "Sangeet Visharad (diploma/degree - Gandharva Mahavidyalaya etc.)",
            "BFA Animation",
            "Diploma in Dramatic Arts (NSD and equivalents)",
        ]),
        ("Education", [
            "B.El.Ed (Bachelor of Elementary Education - 4 year integrated)",
            "BA B.Ed (integrated 4-year)",
            "B.Sc. B.Ed (integrated 4-year)",
            "B.Com B.Ed (integrated)",
            "D.El.Ed (Diploma in Elementary Education - after 12th in some states)",
        ]),
        ("Design", [
            "B.Des (Bachelor of Design) - NID, NIFT, others",
            "B.Des Fashion Design",
            "B.Des Textile Design",
            "B.Des Graphic Design",
            "B.Des Product / Industrial Design",
            "B.Des Interaction / UX Design",
            "B.Des Jewellery Design",
            "B.Des Leather Design",
            "B.Des Accessory Design",
            "B.Des Communication Design",
            "B.Des Furniture Design",
            "B.Des Ceramic & Glass Design",
            "B.FTech (Fashion Technology - NIFT)",
        ]),
        ("Hospitality & Tourism", [
            "BHM (Bachelor of Hotel Management)",
            "B.Sc. Hospitality & Hotel Administration (IHMs)",
            "BA Tourism Management",
            "BA Travel & Tourism",
            "BBA Tourism & Hospitality",
            "Diploma in Hotel Management (various)",
        ]),
        ("Physical Education & Sports", [
            "BPEd (Bachelor of Physical Education)",
            "B.Sc. Sports Science",
            "BA Sports Management",
            "B.Sc. Physical Education, Health & Sports",
            "B.Sc. Exercise Science",
        ]),
        ("Religious & Vedic Studies", [
            "BA Buddhist Studies",
            "BA Islamic Studies",
            "BA Christian Theology (seminaries)",
            "BA Vedic Studies / Jyotish",
            "Shastri (Sanskrit equivalent of BA - recognized by UGC)",
        ]),
        ("Library Science", [
            "B.Lib.I.Sc. (Bachelor of Library & Information Science)",
        ]),
        ("Social Work", [
            "BSW (Bachelor of Social Work)",
        ]),
    ]),
    ("VOCATIONAL / DIPLOMA / CERTIFICATE COURSES (After 12th)", [
        ("Polytechnic Diplomas (3 years, also open after 10th)", [
            "Diploma in Civil Engineering",
            "Diploma in Mechanical Engineering",
            "Diploma in Electrical Engineering",
            "Diploma in Electronics",
            "Diploma in Computer Engineering",
            "Diploma in Chemical Engineering",
            "Diploma in Automobile Engineering",
            "Diploma in Fashion Design",
            "Diploma in Architecture",
        ]),
        ("ITI Courses (open after 10th / 12th)", [
            "Electrician, Fitter, Welder, Turner, Plumber, Machinist, etc.",
        ]),
        ("Aviation & Airports", [
            "Diploma in Airport Ground Staff",
            "Air Hostess / Cabin Crew Training",
            "Diploma in Aviation Management",
            "Commercial Pilot License (CPL) training",
            "B.Sc. Aviation (full degree)",
        ]),
        ("Paramedical Diplomas", [
            "DMLT (Diploma in Medical Lab Technology)",
            "DMRT (Diploma in Medical Radiography)",
            "Diploma in Pharmacy (D.Pharm)",
            "Diploma in Physiotherapy",
            "Diploma in Ophthalmic Technology",
        ]),
        ("IT & Computer Short Courses", [
            "Diploma in Computer Applications (DCA)",
            "PGDCA (Post Graduate Diploma - technically after graduation but many take after 12th)",
            "Diploma in Web Design",
            "Diploma in Graphic Design",
            "Diploma in Cyber Security",
            "Diploma in Hardware & Networking (CCNA, CompTIA etc.)",
        ]),
        ("Beauty & Wellness", [
            "Diploma in Beauty & Cosmetology",
            "Diploma in Hair Styling",
            "Diploma in Makeup Artistry",
            "Diploma in Spa Management",
        ]),
        ("Fashion & Textile", [
            "Diploma in Fashion Design (NIFT, Pearl, Symbiosis etc.)",
            "Diploma in Textile Design",
            "Diploma in Garment Technology",
        ]),
        ("Culinary Arts", [
            "Diploma in Culinary Arts",
            "Diploma in Bakery & Confectionery",
            "Certificate in Patisserie",
        ]),
        ("Media & Film", [
            "Diploma in Photography",
            "Diploma in Filmmaking / Direction",
            "Diploma in Editing & Post Production",
            "Diploma in Sound Design",
            "Diploma in VFX & Animation",
            "Diploma in Journalism",
        ]),
        ("Finance & Accounting Short Courses", [
            "CA Foundation (already listed)",
            "CMA Foundation",
            "CS Foundation",
            "Diploma in Banking & Finance",
            "Diploma in Taxation",
        ]),
    ]),
    ("INTEGRATED DEGREES (5-year programs after 12th)", [
        (None, [
            "BA LLB / BBA LLB / B.Com LLB / B.Sc. LLB",
            "B.Tech + MBA (some institutes)",
            "B.Sc. + M.Sc. (integrated - many universities)",
            "BA + MA (integrated)",
            "B.Com + MBA",
            "BCA + MCA (integrated - some universities)",
            "MBBS is 5.5 years",
            "B.Arch is 5 years",
            "Pharm.D is 6 years",
            "BVSc is 5.5 years",
        ]),
    ]),
    ("AGRICULTURE & ALLIED (separate entrance in most states)", [
        (None, [
            "B.Sc. Agriculture",
            "B.Sc. Horticulture",
            "B.Sc. Forestry",
            "B.Sc. Fisheries",
            "B.Sc. Aquaculture",
            "B.Sc. Sericulture",
            "B.Sc. Agricultural Biotechnology",
            "B.Sc. Food Technology",
            "B.Sc. Dairy Technology",
            "B.Sc. Agricultural Engineering (B.Tech)",
            "B.Sc. Poultry Science",
            "B.Sc. Post-Harvest Technology",
            "BVSc & AH (Veterinary Science)",
            "B.Sc. Agribusiness Management",
            "B.Sc. Soil Science",
            "B.Sc. Plant Pathology",
            "B.Sc. Agricultural Economics",
        ]),
    ]),
    ("DEFENCE & UNIFORMED SERVICES", [
        (None, [
            "NDA (National Defence Academy - after 12th, PCM for Army/Navy/Air Force)",
            "Indian Naval Academy (INAC)",
            "Merchant Navy (B.Sc. Nautical Science / Marine Engineering / DNS)",
            "B.Sc. in Fire & Safety",
            "Diploma in Fire & Safety",
            "Coast Guard (through NDA or direct entry after graduation)",
            "Police - direct constable recruitment after 12th (not a course but a path)",
        ]),
    ]),
]


class CoursesPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, "Courses After 12th - A Comprehensive Guide",
                  align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(200, 200, 200)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")


def build_pdf(out_path: str) -> None:
    pdf = CoursesPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(left=18, top=18, right=18)

    # Cover page
    pdf.add_page()
    pdf.ln(40)
    pdf.set_font("Helvetica", "B", 26)
    pdf.set_text_color(20, 40, 90)
    pdf.multi_cell(0, 14, "Courses After 12th", align="C")
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(60, 60, 60)
    pdf.multi_cell(0, 9, "A Comprehensive Guide Across Streams", align="C")
    pdf.ln(20)
    pdf.set_draw_color(20, 40, 90)
    pdf.set_line_width(0.6)
    pdf.line(60, pdf.get_y(), 150, pdf.get_y())
    pdf.ln(20)
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(0, 7,
                   "Science (PCM / PCB), Commerce, Arts & Humanities,\n"
                   "Vocational & Diploma, Integrated Degrees,\n"
                   "Agriculture and Defence pathways.",
                   align="C")

    # Table of Contents
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(20, 40, 90)
    pdf.cell(0, 12, "Contents", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.set_draw_color(20, 40, 90)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(40, 40, 40)
    for idx, (section, _subs) in enumerate(DATA, start=1):
        pdf.cell(0, 8, f"{idx}.  {section}", new_x="LMARGIN", new_y="NEXT")

    # Sections
    for idx, (section, sub_sections) in enumerate(DATA, start=1):
        pdf.add_page()
        # Section title
        pdf.set_fill_color(20, 40, 90)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 11, f"  {idx}.  {section}",
                 new_x="LMARGIN", new_y="NEXT", fill=True)
        pdf.ln(3)

        for sub_title, items in sub_sections:
            if sub_title:
                pdf.set_text_color(20, 40, 90)
                pdf.set_font("Helvetica", "B", 12)
                pdf.multi_cell(0, 8, sub_title)
                pdf.ln(1)

            pdf.set_text_color(35, 35, 35)
            pdf.set_font("Helvetica", "", 10.5)
            for item in items:
                # Build a bullet line with hanging indent
                bullet = "  -  "
                pdf.set_x(pdf.l_margin + 4)
                pdf.multi_cell(0, 6, f"{bullet}{item}")
            pdf.ln(3)

    pdf.output(out_path)


if __name__ == "__main__":
    out = "/Users/Dreamers/Desktop/new/Courses_After_12th.pdf"
    build_pdf(out)
    print(f"PDF written: {out}")
