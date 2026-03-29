export type StudyLevel =
  | "Undergraduate"
  | "Postgraduate"
  | "Doctorate/PhD"
  | "Research";
export type FieldOfStudy =
  | "Engineering"
  | "Medical"
  | "General Arts & Science"
  | "Vocational/Technical"
  | "Any";
export type LocationType = "Study in India" | "Study Abroad";
export type ScholarshipTypeFilter =
  | "Merit-based"
  | "Need-based"
  | "Merit-cum-Means"
  | "Minority/Quota-based"
  | "Education Loan";

export type ScholarshipCategory =
  | "Government Scholarships (International)"
  | "Indian Scholarships (Government & Private)"
  | "Additional Global & Indian Scholarships"
  | "Open/Loan Schemes";

export interface StaticScholarship {
  id: string;
  name: string;
  category: ScholarshipCategory;
  lastDateToApply: string;
  reward: string;
  eligibilityShort: string;
  studyLevel: StudyLevel[];
  fieldOfStudy: FieldOfStudy[];
  location: LocationType[];
  locationDetail?: string;
  scholarshipType: ScholarshipTypeFilter[];
  fullEligibility: string;
  applicationCycleDuration: string;
  officialApplyUrl: string;
}

export const scholarshipsData: StaticScholarship[] = [
  // ── Government Scholarships (International) ──────────────────────────────
  {
    id: "erasmus-mundus",
    name: "Erasmus Mundus (EU)",
    category: "Government Scholarships (International)",
    lastDateToApply: "Varies by programme (typically Jan–Feb)",
    reward: "Full tuition + €1,000/month living allowance + travel costs",
    eligibilityShort:
      "Open to students worldwide; merit-based selection by EU-funded consortia.",
    studyLevel: ["Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Europe (EU)",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Open to students from any country worldwide (including India).
• Must apply to an Erasmus Mundus Joint Master Degree (EMJMD) programme.
• Minimum bachelor's degree (or equivalent) required for master's programmes.
• For joint doctorates, a master's degree is required.
• Strong academic record (typically 60%+ or equivalent GPA).
• Proficiency in the language of instruction (English/French/German etc.) — IELTS/TOEFL may be required.
• No age restriction, but preference may be given to recent graduates.
• Applicants who have already benefited from an Erasmus Mundus scholarship are not eligible for a second award.
• Selection is based on academic excellence, motivation letter, and references.`,
    applicationCycleDuration: `• Application window: Typically October to January/February each year.
• Selection & notification: March–April.
• Programme start: September/October of the same year.
• Scholarship duration: 1–2 years for master's; 3 years for joint doctorates.`,
    officialApplyUrl:
      "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",
  },
  {
    id: "commonwealth-scholarships",
    name: "Commonwealth Scholarships",
    category: "Government Scholarships (International)",
    lastDateToApply: "October–December (varies by country)",
    reward: "Full tuition, airfare, living allowance, and thesis grant",
    eligibilityShort:
      "Citizens of Commonwealth countries for postgraduate study in the UK.",
    studyLevel: ["Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "United Kingdom",
    scholarshipType: ["Merit-based", "Need-based"],
    fullEligibility: `• Must be a citizen of a Commonwealth country (India is eligible).
• Must be permanently resident in a Commonwealth country.
• Must hold a first degree of at least upper second class (2:1) honours standard, or a second class degree plus a master's degree.
• Must be unable to afford to study in the UK without this scholarship.
• Must be committed to development in your home country.
• Must not have studied or worked in a developed Commonwealth country for more than 3 months in the last 5 years.
• Age: Typically under 40 years for most categories.
• Must apply through the national nominating agency in your home country (in India: Education Division, Commonwealth Secretariat or Ministry of Education).`,
    applicationCycleDuration: `• Applications open: August–October each year.
• Deadline: Typically December (varies by country).
• Shortlisting and interviews: January–March.
• Scholarship offers: April–May.
• Programme start: September/October.
• Duration: 1 year (master's) or 3 years (PhD).`,
    officialApplyUrl: "https://cscuk.fcdo.gov.uk/apply/",
  },
  {
    id: "world-bank-jj-wbgsp",
    name: "World Bank (JJ/WBGSP)",
    category: "Government Scholarships (International)",
    lastDateToApply: "December–February",
    reward: "Full tuition, living stipend, health insurance, and travel",
    eligibilityShort:
      "Citizens of World Bank member countries for development-related master's programs.",
    studyLevel: ["Postgraduate"],
    fieldOfStudy: ["General Arts & Science", "Engineering"],
    location: ["Study Abroad"],
    locationDetail: "Global (partner universities)",
    scholarshipType: ["Merit-based", "Need-based"],
    fullEligibility: `• Must be a national of a World Bank member country (India qualifies).
• Must hold a bachelor's degree earned at least 3 years before the application deadline.
• Must have 3 or more years of recent development-related work experience after earning a bachelor's degree.
• Must be employed in a development-related position at the time of application.
• Must be applying to a full-time master's degree program at a JJ/WBGSP-affiliated university.
• Must not be a current World Bank Group, IMF, or UN staff member or their dependent.
• Must commit to return to your home country after completing the degree.
• Strong academic record required.
• English proficiency (IELTS/TOEFL) as required by the host university.`,
    applicationCycleDuration: `• Application window: December to February each year.
• Scholarship decisions: April–May.
• Programme start: August/September.
• Duration: 1–2 years depending on the master's programme.`,
    officialApplyUrl: "https://www.worldbank.org/en/programs/scholarships",
  },
  {
    id: "fulbright-program",
    name: "Fulbright Program (USA)",
    category: "Government Scholarships (International)",
    lastDateToApply: "May 15 (for Indian applicants)",
    reward:
      "Full tuition, living stipend, health insurance, and round-trip airfare",
    eligibilityShort:
      "Indian citizens for postgraduate study or research in the USA.",
    studyLevel: ["Postgraduate", "Doctorate/PhD", "Research"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "United States of America",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be an Indian citizen residing in India at the time of application.
• Must hold a bachelor's degree with at least 55% marks (or equivalent).
• Must have a minimum of 3 years of professional/teaching/research experience (for Fulbright-Nehru Master's Fellowships).
• Must demonstrate leadership qualities and commitment to community service.
• Must not hold US citizenship or permanent residency.
• English proficiency: GRE/GMAT scores may be required depending on the programme.
• TOEFL/IELTS required for non-English medium graduates.
• Must apply through USIEF (United States-India Educational Foundation).
• Different categories: Master's Fellowships, Doctoral Research, Postdoctoral Research, Senior Research.`,
    applicationCycleDuration: `• Applications open: February each year.
• Deadline: May 15 (for most categories).
• Interviews: July–August.
• Final selection: September–October.
• Programme start: August of the following year.
• Duration: 1–2 years.`,
    officialApplyUrl: "https://www.usief.org.in/Fellowships.aspx",
  },
  {
    id: "chevening-scholarship",
    name: "Chevening Scholarship (UK)",
    category: "Government Scholarships (International)",
    lastDateToApply: "November 5",
    reward:
      "Full tuition, living allowance, return airfare, and additional grants",
    eligibilityShort:
      "Future leaders from eligible countries for one-year master's in the UK.",
    studyLevel: ["Postgraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "United Kingdom",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be a citizen of a Chevening-eligible country (India is eligible).
• Must have completed an undergraduate degree equivalent to a UK 2:1 honours degree.
• Must have at least 2 years (2,800 hours) of work experience.
• Must apply to three different eligible UK universities and receive an unconditional offer from at least one.
• Must return to your home country for a minimum of 2 years after the scholarship ends.
• Must not hold British or dual British citizenship.
• Must not have previously studied in the UK with UK government funding.
• Strong leadership potential and networking ability are key selection criteria.
• English proficiency: IELTS 6.5 or equivalent required.`,
    applicationCycleDuration: `• Applications open: August each year.
• Deadline: November 5.
• Interviews: April–May of the following year.
• Scholarship offers: June.
• Programme start: September/October.
• Duration: 1 year (master's programme).`,
    officialApplyUrl: "https://www.chevening.org/apply/",
  },
  {
    id: "great-scholarship",
    name: "GREAT Scholarship (UK)",
    category: "Government Scholarships (International)",
    lastDateToApply: "Varies by university (typically Feb–April)",
    reward: "£10,000 minimum towards tuition fees",
    eligibilityShort:
      "Indian students for one-year postgraduate study at UK universities.",
    studyLevel: ["Postgraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "United Kingdom",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be an Indian citizen and resident in India.
• Must be applying for a one-year postgraduate (master's) programme at a participating UK university.
• Must meet the academic entry requirements of the chosen university.
• Must not have previously studied in the UK at postgraduate level.
• English proficiency as required by the host university (IELTS/TOEFL).
• Strong academic record required.
• Each participating university may have additional eligibility criteria.
• Applications are made directly to the participating universities.`,
    applicationCycleDuration: `• Applications open: January–February each year.
• Deadline: Varies by university (typically February–April).
• Decisions: April–May.
• Programme start: September/October.
• Duration: 1 year.`,
    officialApplyUrl:
      "https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships",
  },
  {
    id: "global-korea-scholarship",
    name: "Global Korea Scholarship (GKS)",
    category: "Government Scholarships (International)",
    lastDateToApply: "February–March (Embassy Track)",
    reward:
      "Full tuition, monthly stipend (KRW 900,000–1,000,000), airfare, Korean language training",
    eligibilityShort:
      "International students for undergraduate or graduate study in South Korea.",
    studyLevel: ["Undergraduate", "Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "South Korea",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be a citizen of a GKS-eligible country (India is eligible).
• Must be under 25 years old for undergraduate track; under 40 for graduate track.
• Must hold a high school diploma (for undergraduate) or bachelor's/master's degree (for graduate).
• Must have a GPA of 80% or above (or equivalent).
• Must not hold Korean citizenship or permanent residency.
• Must be in good health (medical examination required).
• Korean language proficiency is NOT required at the time of application (language training is provided).
• English proficiency may be required for English-medium programmes.
• Two tracks: Embassy Track (apply through Korean Embassy in India) and University Track (apply directly to Korean universities).`,
    applicationCycleDuration: `• Embassy Track applications: February–March each year.
• University Track: Varies by university (typically September–November).
• Selection results: May–June (Embassy Track).
• Korean language training: March–July of the year of enrollment.
• Programme start: September.
• Duration: 1 year language training + 2 years (master's) or 3 years (PhD) or 4 years (undergraduate).`,
    officialApplyUrl:
      "https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do",
  },
  {
    id: "mext-scholarship",
    name: "MEXT Scholarship (Japan)",
    category: "Government Scholarships (International)",
    lastDateToApply: "May–June (Embassy Recommendation)",
    reward: "Full tuition, monthly stipend (¥117,000–¥145,000), airfare",
    eligibilityShort:
      "International students for undergraduate or graduate study in Japan.",
    studyLevel: ["Undergraduate", "Postgraduate", "Doctorate/PhD", "Research"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Japan",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be a citizen of a country with diplomatic relations with Japan (India qualifies).
• Age: Under 35 years for research students/graduate students; under 24 for undergraduate students.
• Must have completed 12 years of school education (for undergraduate) or hold a bachelor's/master's degree.
• Must have a strong academic record (typically 65%+ or equivalent).
• Must be in good health.
• Japanese language proficiency is NOT required at the time of application (language training provided).
• Must not hold Japanese citizenship.
• Must not be enrolled in a Japanese university at the time of application.
• Two main tracks: Embassy Recommendation and University Recommendation.
• Categories: Research Students, Undergraduate Students, Teacher Training Students, Japanese Studies Students.`,
    applicationCycleDuration: `• Embassy Recommendation applications: May–June each year.
• Written examination: June–July.
• Interviews: July–August.
• Final selection: September–October.
• Japanese language training: April of the following year.
• Programme start: April or October.
• Duration: 1.5–2 years (master's) or 3–4 years (PhD) or 5 years (undergraduate).`,
    officialApplyUrl:
      "https://www.studyinjapan.go.jp/en/smap_stopj-applications_research.html",
  },
  {
    id: "daad-scholarships",
    name: "DAAD Scholarships (Germany)",
    category: "Government Scholarships (International)",
    lastDateToApply: "October–November (varies by programme)",
    reward: "€861–€1,200/month stipend + travel allowance + health insurance",
    eligibilityShort:
      "Indian students and researchers for study and research in Germany.",
    studyLevel: ["Postgraduate", "Doctorate/PhD", "Research"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Germany",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be an Indian citizen.
• Must hold a bachelor's degree with at least 55% marks (or equivalent) for master's programmes.
• Must hold a master's degree for doctoral programmes.
• Must have completed their last degree no more than 6 years ago (for most programmes).
• Strong academic record and research potential required.
• German language proficiency may be required for German-medium programmes; English proficiency (IELTS/TOEFL) for English-medium.
• Must apply through the DAAD portal or through a German university.
• Multiple programme categories: In-Country/In-Region, Bilateral, DAAD Helmut-Schmidt Programme, etc.
• Work experience may be required for some programmes.`,
    applicationCycleDuration: `• Applications open: August–September each year.
• Deadline: October–November (varies by programme).
• Selection results: February–March.
• Programme start: October of the following year (or April for some programmes).
• Duration: 1–2 years (master's) or 3 years (PhD).`,
    officialApplyUrl: "https://www.daad.in/en/find-funding/",
  },
  {
    id: "australia-awards",
    name: "Australia Awards",
    category: "Government Scholarships (International)",
    lastDateToApply: "April 30",
    reward:
      "Full tuition, return airfare, living allowance, health cover, and establishment allowance",
    eligibilityShort:
      "Citizens of eligible countries for undergraduate or postgraduate study in Australia.",
    studyLevel: ["Undergraduate", "Postgraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Australia",
    scholarshipType: ["Merit-based", "Need-based"],
    fullEligibility: `• Must be a citizen of an eligible country (India is eligible for some categories).
• Must be at least 18 years of age at the time of application.
• Must not be a citizen or permanent resident of Australia or New Zealand.
• Must not be applying to undertake a course that is less than 1 academic year in duration.
• Must meet the academic and English language requirements of the Australian institution.
• Must not be currently enrolled in a course in Australia.
• Must return to your home country for at least 2 years after completing the scholarship.
• Priority given to applicants from developing countries and those who demonstrate leadership potential.
• English proficiency: IELTS 6.5 or equivalent required.`,
    applicationCycleDuration: `• Applications open: February each year.
• Deadline: April 30.
• Shortlisting and interviews: May–July.
• Scholarship offers: August–September.
• Programme start: February of the following year.
• Duration: Varies (typically 2–4 years).`,
    officialApplyUrl: "https://www.australiaawards.gov.au/",
  },
  {
    id: "eiffel-excellence",
    name: "Eiffel Excellence Scholarship (France)",
    category: "Government Scholarships (International)",
    lastDateToApply: "January 8",
    reward:
      "€1,181/month (master's) or €1,400/month (PhD) + health insurance + cultural activities",
    eligibilityShort:
      "International students for master's or PhD programmes at French institutions.",
    studyLevel: ["Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Engineering", "General Arts & Science"],
    location: ["Study Abroad"],
    locationDetail: "France",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be a non-French citizen.
• Must be under 30 years old for master's programmes; under 35 for PhD programmes.
• Must be applying to a French higher education institution that is eligible for the Eiffel programme.
• Must be nominated by the French institution (students cannot apply directly).
• Must have an excellent academic record.
• Must not have previously received an Eiffel scholarship.
• Priority fields: Engineering and exact sciences, economics and management, law and political science.
• English or French proficiency required depending on the programme.
• The French institution submits the application on behalf of the student.`,
    applicationCycleDuration: `• Nomination by French institutions: October–January.
• Deadline for institution nominations: January 8.
• Selection results: March–April.
• Programme start: September/October.
• Duration: 1–3 years depending on the programme.`,
    officialApplyUrl:
      "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
  },
  {
    id: "goi-ies",
    name: "Government of Ireland International Education Scholarship (GOI-IES)",
    category: "Government Scholarships (International)",
    lastDateToApply: "February 28",
    reward: "€10,000 stipend + fee waiver",
    eligibilityShort:
      "Non-EU/EEA students for one-year postgraduate study in Ireland.",
    studyLevel: ["Postgraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Ireland",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be a citizen of a non-EU/EEA country (India qualifies).
• Must be applying for a full-time postgraduate programme (master's or PhD) at an Irish higher education institution.
• Must have an excellent academic record (first class or upper second class honours degree or equivalent).
• Must not be currently enrolled in an Irish higher education institution.
• Must not have previously received a GOI-IES scholarship.
• Must demonstrate strong academic achievement and potential.
• English proficiency as required by the host institution.
• Applications are submitted through the Irish higher education institution.`,
    applicationCycleDuration: `• Applications open: January each year.
• Deadline: February 28.
• Selection results: April–May.
• Programme start: September/October.
• Duration: 1 year (master's) or up to 4 years (PhD).`,
    officialApplyUrl:
      "https://hea.ie/funding-governance-performance/funding/student-finance/gov-of-ireland-international-education-scholarship/",
  },
  {
    id: "holland-scholarship",
    name: "Holland Scholarship (Netherlands)",
    category: "Government Scholarships (International)",
    lastDateToApply: "Varies by university (typically Feb–May)",
    reward: "€5,000 one-time grant",
    eligibilityShort:
      "Non-EEA students for bachelor's or master's study at Dutch universities.",
    studyLevel: ["Undergraduate", "Postgraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Netherlands",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be a citizen of a non-EEA country (India qualifies).
• Must be applying for a full-time bachelor's or master's programme at a participating Dutch university.
• Must not have previously studied in the Netherlands.
• Must meet the academic entry requirements of the chosen university.
• Must be applying for the first year of the programme.
• English proficiency as required by the host university (IELTS/TOEFL).
• Strong academic record required.
• Applications are made through the participating Dutch university.
• Each university may have additional eligibility criteria and selection processes.`,
    applicationCycleDuration: `• Applications open: November–January each year.
• Deadline: Varies by university (typically February–May).
• Selection results: April–June.
• Programme start: September.
• Duration: 1 year (the scholarship is a one-time grant, not renewable).`,
    officialApplyUrl:
      "https://www.studyinholland.nl/scholarships/highlighted-scholarships/holland-scholarship",
  },

  // ── Indian Scholarships (Government & Private) ────────────────────────────
  {
    id: "csss",
    name: "Central Sector Scheme of Scholarship (CSSS)",
    category: "Indian Scholarships (Government & Private)",
    lastDateToApply: "October–November (NSP portal)",
    reward: "₹10,000/year (freshers) to ₹20,000/year (postgraduate)",
    eligibilityShort:
      "Top 20 percentile students from Class 12 for undergraduate/postgraduate study in India.",
    studyLevel: ["Undergraduate", "Postgraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study in India"],
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be an Indian citizen.
• Must have scored in the top 20 percentile in Class 12 board examinations.
• Annual family income must not exceed ₹8 lakh.
• Must be pursuing a regular degree course (not distance/correspondence) at a recognized college/university.
• Must not be availing any other scholarship from the Central/State Government.
• Must not be pursuing a professional course (engineering/medical) in the first year (these are covered under other schemes).
• Renewal: Must maintain 50% marks in the previous year's examination.
• Must apply through the National Scholarship Portal (NSP).`,
    applicationCycleDuration: `• Applications open: August–September on NSP.
• Deadline: October–November.
• Verification by institutions: November–December.
• Disbursement: January–March.
• Duration: Up to 3 years for undergraduate; 2 years for postgraduate.`,
    officialApplyUrl: "https://scholarships.gov.in/",
  },
  {
    id: "aicte-pragati",
    name: "AICTE Pragati Scholarship",
    category: "Indian Scholarships (Government & Private)",
    lastDateToApply: "October–November (NSP portal)",
    reward: "₹50,000/year + ₹2,000/month contingency",
    eligibilityShort: "Girl students in AICTE-approved technical institutions.",
    studyLevel: ["Undergraduate", "Postgraduate"],
    fieldOfStudy: ["Engineering", "Vocational/Technical"],
    location: ["Study in India"],
    scholarshipType: ["Merit-cum-Means", "Minority/Quota-based"],
    fullEligibility: `• Must be a girl student (female).
• Must be admitted to the first year of AICTE-approved degree/diploma programme.
• Annual family income must not exceed ₹8 lakh.
• Only one girl child per family is eligible (if two girls in the family, only one can avail).
• Must not be availing any other Central/State Government scholarship.
• Must apply through the National Scholarship Portal (NSP).
• Must be enrolled in a full-time programme.
• Renewal: Must pass all subjects in the previous year.`,
    applicationCycleDuration: `• Applications open: August–September on NSP.
• Deadline: October–November.
• Verification: November–December.
• Disbursement: January–March.
• Duration: Up to 4 years (degree) or 3 years (diploma).`,
    officialApplyUrl: "https://scholarships.gov.in/",
  },
  {
    id: "aicte-saksham",
    name: "AICTE Saksham Scholarship",
    category: "Indian Scholarships (Government & Private)",
    lastDateToApply: "October–November (NSP portal)",
    reward: "₹50,000/year + ₹2,000/month contingency",
    eligibilityShort:
      "Specially-abled students in AICTE-approved technical institutions.",
    studyLevel: ["Undergraduate", "Postgraduate"],
    fieldOfStudy: ["Engineering", "Vocational/Technical"],
    location: ["Study in India"],
    scholarshipType: ["Merit-cum-Means", "Minority/Quota-based"],
    fullEligibility: `• Must be a specially-abled (differently-abled) student with at least 40% disability.
• Must be admitted to the first year of an AICTE-approved degree/diploma programme.
• Annual family income must not exceed ₹8 lakh.
• Must possess a valid disability certificate issued by a competent authority.
• Must not be availing any other Central/State Government scholarship.
• Must apply through the National Scholarship Portal (NSP).
• Must be enrolled in a full-time programme.
• Renewal: Must pass all subjects in the previous year.`,
    applicationCycleDuration: `• Applications open: August–September on NSP.
• Deadline: October–November.
• Verification: November–December.
• Disbursement: January–March.
• Duration: Up to 4 years (degree) or 3 years (diploma).`,
    officialApplyUrl: "https://scholarships.gov.in/",
  },
  {
    id: "inspire-she",
    name: "INSPIRE Scholarship (SHE)",
    category: "Indian Scholarships (Government & Private)",
    lastDateToApply: "October 31",
    reward: "₹80,000/year (₹60,000 scholarship + ₹20,000 mentorship)",
    eligibilityShort:
      "Top 1% students in Class 12 pursuing natural/basic sciences at undergraduate level.",
    studyLevel: ["Undergraduate"],
    fieldOfStudy: ["General Arts & Science"],
    location: ["Study in India"],
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be an Indian citizen.
• Must have scored in the top 1% in Class 12 board examinations (or equivalent).
• Must be pursuing a bachelor's degree in natural/basic sciences (Physics, Chemistry, Mathematics, Biology, Statistics, etc.).
• Must be enrolled in a recognized college/university in India.
• Must not be pursuing engineering, medicine, or technology courses.
• Must apply within 1 year of passing Class 12.
• Annual family income: No income limit specified.
• Must apply through the DST-INSPIRE portal.
• Renewal: Must maintain 60% marks in the previous year.`,
    applicationCycleDuration: `• Applications open: July–August each year.
• Deadline: October 31.
• Verification and selection: November–January.
• Disbursement: February–March.
• Duration: Up to 5 years (for integrated master's) or 3 years (for bachelor's).`,
    officialApplyUrl: "https://online-inspire.gov.in/",
  },
  {
    id: "pmsss",
    name: "PMSSS (Jammu & Kashmir and Ladakh)",
    category: "Indian Scholarships (Government & Private)",
    lastDateToApply: "June–July",
    reward:
      "Academic fee up to ₹30,000/year + maintenance allowance ₹1 lakh/year",
    eligibilityShort:
      "Students domiciled in J&K and Ladakh for undergraduate study outside the region.",
    studyLevel: ["Undergraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study in India"],
    scholarshipType: ["Need-based", "Merit-cum-Means"],
    fullEligibility: `• Must be a domicile of Jammu & Kashmir or Ladakh.
• Must have passed Class 12 from a recognized board in J&K or Ladakh.
• Annual family income must not exceed ₹8 lakh.
• Must be seeking admission to undergraduate professional courses (engineering, medical, law, management, etc.) outside J&K/Ladakh.
• Must not be availing any other Central/State Government scholarship.
• Must apply through the AICTE portal.
• Must secure admission through a national-level entrance examination (JEE, NEET, CLAT, etc.) or merit-based admission.
• Renewal: Must pass all subjects in the previous year.`,
    applicationCycleDuration: `• Applications open: May–June each year.
• Deadline: June–July.
• Counselling and seat allotment: July–August.
• Disbursement: September onwards.
• Duration: Up to 4–5 years depending on the course.`,
    officialApplyUrl: "https://www.aicte-india.org/bureaus/jk",
  },
  {
    id: "post-matric-sc-st-obc",
    name: "Post-Matric Scholarships (SC/ST/OBC)",
    category: "Indian Scholarships (Government & Private)",
    lastDateToApply: "October–November (NSP portal)",
    reward:
      "Maintenance allowance + course fee reimbursement (varies by state and category)",
    eligibilityShort:
      "SC/ST/OBC students pursuing post-matriculation education in India.",
    studyLevel: ["Undergraduate", "Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Any"],
    location: ["Study in India"],
    scholarshipType: ["Need-based", "Minority/Quota-based"],
    fullEligibility: `• Must be an Indian citizen belonging to SC, ST, or OBC category.
• Must possess a valid caste certificate issued by a competent authority.
• Annual family income limits: SC/ST — ₹2.5 lakh; OBC — ₹1 lakh (varies by state).
• Must be studying in a recognized institution in India.
• Must not be availing any other scholarship for the same purpose.
• Must apply through the National Scholarship Portal (NSP) or state portal.
• Covers: Maintenance allowance, study tour charges, thesis typing/printing charges, book allowance, etc.
• Renewal: Must pass the previous year's examination.`,
    applicationCycleDuration: `• Applications open: August–September on NSP.
• Deadline: October–November.
• Verification by institutions: November–December.
• Disbursement: January–March.
• Duration: For the entire duration of the course.`,
    officialApplyUrl: "https://scholarships.gov.in/",
  },
  {
    id: "reliance-foundation-ug",
    name: "Reliance Foundation Undergraduate Scholarship",
    category: "Indian Scholarships (Government & Private)",
    lastDateToApply: "March–April",
    reward: "₹2 lakh/year for up to 4 years",
    eligibilityShort:
      "Meritorious students from low-income families for undergraduate study in India.",
    studyLevel: ["Undergraduate"],
    fieldOfStudy: ["Engineering", "General Arts & Science"],
    location: ["Study in India"],
    scholarshipType: ["Merit-cum-Means"],
    fullEligibility: `• Must be an Indian citizen.
• Must have scored at least 60% in Class 12 board examinations.
• Annual family income must not exceed ₹15 lakh.
• Must be pursuing a full-time undergraduate degree in engineering, pure sciences, social sciences, humanities, or commerce.
• Must be enrolled in a recognized college/university in India.
• Must not be availing any other scholarship of equivalent or higher value.
• Must demonstrate financial need and academic merit.
• Selection involves online test, group discussion, and personal interview.`,
    applicationCycleDuration: `• Applications open: January–February each year.
• Deadline: March–April.
• Online test: April–May.
• Interviews: May–June.
• Scholarship announcement: July.
• Duration: Up to 4 years (renewable annually based on performance).`,
    officialApplyUrl: "https://scholarships.reliancefoundation.org/",
  },
  {
    id: "hdfc-parivartan-ecss",
    name: "HDFC Bank Parivartan's ECSS Programme",
    category: "Indian Scholarships (Government & Private)",
    lastDateToApply: "Always Open (rolling basis)",
    reward: "Up to ₹75,000/year",
    eligibilityShort:
      "Students from economically weaker sections pursuing higher education.",
    studyLevel: ["Undergraduate", "Postgraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study in India"],
    scholarshipType: ["Need-based"],
    fullEligibility: `• Must be an Indian citizen.
• Must be enrolled in a recognized college/university in India.
• Annual family income must not exceed ₹2.5 lakh.
• Must have scored at least 55% in the previous qualifying examination.
• Must be pursuing a full-time undergraduate or postgraduate programme.
• Must not be availing any other scholarship of equivalent or higher value.
• Preference given to students from marginalized communities.
• Must apply through the Buddy4Study platform.`,
    applicationCycleDuration: `• Applications are accepted on a rolling basis throughout the year.
• Processing time: 4–8 weeks after application submission.
• Disbursement: Directly to the student's bank account.
• Duration: 1 year (renewable based on academic performance and continued financial need).`,
    officialApplyUrl:
      "https://www.buddy4study.com/scholarship/hdfc-bank-parivartan-ecss-programme",
  },
  {
    id: "tata-capital-pankh",
    name: "Tata Capital Pankh Scholarship",
    category: "Indian Scholarships (Government & Private)",
    lastDateToApply: "July–August",
    reward: "Up to ₹50,000/year",
    eligibilityShort:
      "Meritorious students from low-income families for undergraduate study.",
    studyLevel: ["Undergraduate"],
    fieldOfStudy: ["Engineering", "General Arts & Science", "Medical"],
    location: ["Study in India"],
    scholarshipType: ["Merit-cum-Means"],
    fullEligibility: `• Must be an Indian citizen.
• Must have scored at least 60% in Class 10 and Class 12 board examinations.
• Annual family income must not exceed ₹4 lakh.
• Must be pursuing a full-time undergraduate degree (engineering, medical, or general degree courses).
• Must be enrolled in a recognized college/university in India.
• Must not be availing any other scholarship of equivalent or higher value.
• Must demonstrate financial need and academic merit.
• Must apply through the Buddy4Study platform.`,
    applicationCycleDuration: `• Applications open: May–June each year.
• Deadline: July–August.
• Shortlisting and interviews: August–September.
• Scholarship announcement: October.
• Duration: 1 year (renewable annually based on performance).`,
    officialApplyUrl:
      "https://www.buddy4study.com/scholarship/tata-capital-pankh-scholarship-programme",
  },
  {
    id: "aditya-birla-scholarship",
    name: "Aditya Birla Scholarship",
    category: "Indian Scholarships (Government & Private)",
    lastDateToApply: "September–October",
    reward: "₹65,000/year (engineering/law/MBA) or ₹60,000/year (liberal arts)",
    eligibilityShort:
      "Top-ranked students at premier Indian institutions (IITs, IIMs, BITS, etc.).",
    studyLevel: ["Undergraduate", "Postgraduate"],
    fieldOfStudy: ["Engineering", "General Arts & Science"],
    location: ["Study in India"],
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be enrolled in the first year of an undergraduate or postgraduate programme at a premier institution.
• Eligible institutions: IITs, IIMs, BITS Pilani, XLRI, SP Jain, Law School (NLSIU, NALSAR, NLU Delhi), and select liberal arts colleges.
• Must be among the top rankers in JEE/CAT/CLAT or equivalent entrance examination.
• Must demonstrate leadership qualities, extracurricular achievements, and social commitment.
• No income restriction — purely merit-based.
• Selection involves a personal interview with senior Aditya Birla Group leaders.
• Must be an Indian citizen.`,
    applicationCycleDuration: `• Nominations by institutions: August–September each year.
• Applications: September–October.
• Interviews: October–November.
• Scholarship announcement: November–December.
• Duration: For the entire duration of the programme (renewable annually).`,
    officialApplyUrl: "https://www.adityabirlascholars.net/",
  },

  // ── Additional Global & Indian Scholarships ───────────────────────────────
  {
    id: "stipendium-hungaricum",
    name: "Stipendium Hungaricum (Hungary)",
    category: "Additional Global & Indian Scholarships",
    lastDateToApply: "January 15",
    reward:
      "Full tuition waiver + monthly stipend (HUF 43,700–140,000) + accommodation",
    eligibilityShort:
      "International students for full-time study at Hungarian universities.",
    studyLevel: ["Undergraduate", "Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Hungary",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be a citizen of a Stipendium Hungaricum partner country (India is a partner country).
• Must apply through the sending partner organization in India (typically the Ministry of Education or ICCR).
• Must meet the academic entry requirements of the chosen Hungarian university.
• Age: Under 45 years for most programmes.
• Must not hold Hungarian citizenship or permanent residency.
• Must not be currently enrolled in a Hungarian higher education institution.
• English or Hungarian proficiency as required by the programme.
• Strong academic record required.
• Must apply through the Stipendium Hungaricum online application system.`,
    applicationCycleDuration: `• Applications open: October–November each year.
• Deadline: January 15.
• Selection by sending partner: January–February.
• Hungarian university admission: February–April.
• Final scholarship decision: May–June.
• Programme start: September.
• Duration: 3–4 years (undergraduate), 1–2 years (master's), 3–4 years (PhD).`,
    officialApplyUrl: "https://stipendiumhungaricum.hu/apply/",
  },
  {
    id: "czech-republic-govt",
    name: "Czech Republic Government Scholarships",
    category: "Additional Global & Indian Scholarships",
    lastDateToApply: "September–October (via ICCR/Embassy)",
    reward:
      "Monthly stipend (CZK 9,000–11,000) + tuition waiver at public universities",
    eligibilityShort:
      "Indian students for study or research at Czech public universities.",
    studyLevel: ["Postgraduate", "Doctorate/PhD", "Research"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Czech Republic",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be an Indian citizen.
• Must apply through the Indian Council for Cultural Relations (ICCR) or the Czech Embassy in India.
• Must hold a bachelor's degree (for master's) or master's degree (for PhD/research).
• Must have a strong academic record.
• Czech language proficiency may be required for Czech-medium programmes; English proficiency for English-medium.
• Must not be currently enrolled in a Czech university.
• Age: Typically under 35 years.
• Must demonstrate academic excellence and research potential.`,
    applicationCycleDuration: `• Applications open: July–August each year.
• Deadline: September–October.
• Selection by ICCR/Embassy: October–November.
• Czech university admission: November–January.
• Programme start: February or September.
• Duration: 1–2 years (master's) or 3 years (PhD).`,
    officialApplyUrl: "https://www.iccr.gov.in/content/czech-republic",
  },
  {
    id: "brunei-bdgs",
    name: "Brunei Darussalam Government Scholarship (BDGS)",
    category: "Additional Global & Indian Scholarships",
    lastDateToApply: "March–April",
    reward:
      "Full tuition + monthly allowance (BND 500) + accommodation + airfare",
    eligibilityShort:
      "International students for undergraduate study at Universiti Brunei Darussalam.",
    studyLevel: ["Undergraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Brunei Darussalam",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be a citizen of a country with diplomatic relations with Brunei (India qualifies).
• Must be between 17–25 years of age.
• Must have completed secondary education (Class 12 or equivalent) with excellent results.
• Must not hold Bruneian citizenship or permanent residency.
• Must be in good health (medical examination required).
• English proficiency: IELTS 5.5 or equivalent required.
• Must not be currently enrolled in a university.
• Must apply through the Brunei Embassy or High Commission in India.`,
    applicationCycleDuration: `• Applications open: January–February each year.
• Deadline: March–April.
• Selection and interviews: April–May.
• Scholarship offers: June–July.
• Programme start: August.
• Duration: 3–4 years depending on the programme.`,
    officialApplyUrl: "https://www.mfa.gov.bn/Pages/Scholarships.aspx",
  },
  {
    id: "chulalongkorn-thailand",
    name: "Chulalongkorn University Scholarship (Thailand)",
    category: "Additional Global & Indian Scholarships",
    lastDateToApply: "February–March",
    reward:
      "Tuition waiver + monthly stipend (THB 9,000) + accommodation allowance",
    eligibilityShort:
      "International students for postgraduate study at Chulalongkorn University.",
    studyLevel: ["Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Thailand",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be a citizen of a non-Thai country (India qualifies).
• Must hold a bachelor's degree (for master's) or master's degree (for PhD) from a recognized university.
• Must have a strong academic record (GPA 3.0 or above on a 4.0 scale, or equivalent).
• Must not hold Thai citizenship or permanent residency.
• English proficiency: IELTS 6.0 or TOEFL 79 or equivalent required.
• Must apply directly to Chulalongkorn University's graduate school.
• Must be under 35 years for master's; under 40 for PhD.
• Must demonstrate research potential and academic excellence.`,
    applicationCycleDuration: `• Applications open: November–December each year.
• Deadline: February–March.
• Selection results: April–May.
• Programme start: August.
• Duration: 2 years (master's) or 3–4 years (PhD).`,
    officialApplyUrl: "https://www.grad.chula.ac.th/en/",
  },
  {
    id: "kaist-international",
    name: "KAIST International Student Scholarship (South Korea)",
    category: "Additional Global & Indian Scholarships",
    lastDateToApply: "September (for spring) / March (for fall)",
    reward: "Full tuition waiver + monthly stipend (KRW 350,000–500,000)",
    eligibilityShort:
      "International students for science and technology programmes at KAIST.",
    studyLevel: ["Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Engineering", "General Arts & Science"],
    location: ["Study Abroad"],
    locationDetail: "South Korea",
    scholarshipType: ["Merit-based"],
    fullEligibility: `• Must be a citizen of a non-Korean country (India qualifies).
• Must hold a bachelor's degree (for master's) or master's degree (for PhD) from a recognized university.
• Must have a strong academic record (GPA 3.0 or above on a 4.0 scale, or equivalent).
• Must not hold Korean citizenship or permanent residency.
• English proficiency: TOEFL 83 (iBT) or IELTS 6.5 or equivalent required.
• Must apply directly to KAIST's admissions office.
• Must be accepted by a KAIST faculty advisor (for research programmes).
• Strong background in science, engineering, or technology required.`,
    applicationCycleDuration: `• Spring semester applications: September–October.
• Fall semester applications: March–April.
• Selection results: 2–3 months after deadline.
• Programme start: March (spring) or September (fall).
• Duration: 2 years (master's) or 3–4 years (PhD).`,
    officialApplyUrl: "https://admission.kaist.ac.kr/intl-graduate/",
  },
  {
    id: "sbi-platinum-jubilee",
    name: "SBI Platinum Jubilee Asha Scholarship",
    category: "Additional Global & Indian Scholarships",
    lastDateToApply: "August–September",
    reward: "₹15,000/year",
    eligibilityShort:
      "Meritorious students from low-income families for undergraduate study.",
    studyLevel: ["Undergraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study in India"],
    scholarshipType: ["Merit-cum-Means"],
    fullEligibility: `• Must be an Indian citizen.
• Must have scored at least 75% in Class 12 board examinations.
• Annual family income must not exceed ₹3 lakh.
• Must be pursuing a full-time undergraduate degree at a recognized college/university in India.
• Must not be availing any other scholarship of equivalent or higher value.
• Must demonstrate financial need and academic merit.
• Must apply through the Buddy4Study platform.
• Preference given to students from rural areas and marginalized communities.`,
    applicationCycleDuration: `• Applications open: June–July each year.
• Deadline: August–September.
• Shortlisting: September–October.
• Scholarship announcement: November.
• Duration: 1 year (renewable annually based on performance).`,
    officialApplyUrl:
      "https://www.buddy4study.com/scholarship/sbi-asha-scholarship-programme",
  },
  {
    id: "idfc-first-bank-engineering",
    name: "IDFC FIRST Bank Engineering Scholarship",
    category: "Additional Global & Indian Scholarships",
    lastDateToApply: "August–September",
    reward: "Up to ₹50,000/year",
    eligibilityShort:
      "Engineering students from low-income families for undergraduate study.",
    studyLevel: ["Undergraduate"],
    fieldOfStudy: ["Engineering"],
    location: ["Study in India"],
    scholarshipType: ["Merit-cum-Means"],
    fullEligibility: `• Must be an Indian citizen.
• Must be pursuing a full-time B.Tech/B.E. programme at a recognized engineering college in India.
• Must have scored at least 60% in Class 12 board examinations.
• Annual family income must not exceed ₹5 lakh.
• Must not be availing any other scholarship of equivalent or higher value.
• Must demonstrate financial need and academic merit.
• Must apply through the Buddy4Study platform.
• Preference given to first-generation college students.`,
    applicationCycleDuration: `• Applications open: June–July each year.
• Deadline: August–September.
• Shortlisting and verification: September–October.
• Scholarship announcement: November.
• Duration: 1 year (renewable annually based on performance).`,
    officialApplyUrl:
      "https://www.buddy4study.com/scholarship/idfc-first-bank-engineering-scholarship",
  },
  {
    id: "adani-foundation-btech",
    name: "Adani Foundation Scholarship (B.Tech)",
    category: "Additional Global & Indian Scholarships",
    lastDateToApply: "July–August",
    reward: "Up to ₹1.5 lakh/year",
    eligibilityShort:
      "B.Tech students from communities near Adani Group operations.",
    studyLevel: ["Undergraduate"],
    fieldOfStudy: ["Engineering"],
    location: ["Study in India"],
    scholarshipType: ["Need-based", "Merit-cum-Means"],
    fullEligibility: `• Must be an Indian citizen.
• Must be pursuing a full-time B.Tech programme at a recognized engineering college in India.
• Must have scored at least 60% in Class 12 board examinations.
• Annual family income must not exceed ₹6 lakh.
• Preference given to students from communities near Adani Group operational areas (Gujarat, Rajasthan, Odisha, etc.).
• Must not be availing any other scholarship of equivalent or higher value.
• Must demonstrate financial need and academic merit.
• Must apply through the Adani Foundation portal.`,
    applicationCycleDuration: `• Applications open: May–June each year.
• Deadline: July–August.
• Shortlisting and interviews: August–September.
• Scholarship announcement: October.
• Duration: 1 year (renewable annually based on performance).`,
    officialApplyUrl: "https://www.adanifoundation.org/Education/Scholarship",
  },
  {
    id: "jn-tata-endowment",
    name: "J.N. Tata Endowment (Loan Scholarship)",
    category: "Additional Global & Indian Scholarships",
    lastDateToApply: "February–March",
    reward:
      "Loan scholarship up to ₹10 lakh (interest-free for the study period)",
    eligibilityShort:
      "Indian students for postgraduate study abroad at top global universities.",
    studyLevel: ["Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Global (top universities)",
    scholarshipType: ["Merit-based", "Education Loan"],
    fullEligibility: `• Must be an Indian citizen.
• Must be a graduate of an Indian university with a strong academic record.
• Must have secured admission to a full-time postgraduate programme at a reputed foreign university.
• Must demonstrate academic excellence and leadership potential.
• Must not have previously received a J.N. Tata Endowment scholarship.
• Age: Typically under 45 years.
• Must apply through the J.N. Tata Endowment portal.
• Selection involves a written application and personal interview.
• The loan is interest-free during the study period and repayable after securing employment.`,
    applicationCycleDuration: `• Applications open: December–January each year.
• Deadline: February–March.
• Interviews: March–April.
• Scholarship announcement: April–May.
• Programme start: August/September.
• Repayment: Begins 1 year after completing the programme.`,
    officialApplyUrl: "https://www.jntataendowment.org/",
  },
  {
    id: "aga-khan-foundation",
    name: "Aga Khan Foundation International Scholarship",
    category: "Additional Global & Indian Scholarships",
    lastDateToApply: "March 31",
    reward: "50% grant + 50% loan (covers tuition and living expenses)",
    eligibilityShort:
      "Outstanding students from developing countries for postgraduate study abroad.",
    studyLevel: ["Postgraduate"],
    fieldOfStudy: ["Any"],
    location: ["Study Abroad"],
    locationDetail: "Global (top universities)",
    scholarshipType: ["Merit-based", "Need-based"],
    fullEligibility: `• Must be a citizen of a developing country where the Aga Khan Foundation operates (India qualifies).
• Must hold a bachelor's degree with an excellent academic record.
• Must have secured admission to a full-time postgraduate programme at a recognized foreign university.
• Must demonstrate financial need (the scholarship is a 50% grant + 50% interest-free loan).
• Must show commitment to return to and contribute to their home country.
• Must not have previously received an Aga Khan Foundation scholarship.
• Age: Typically under 30 years.
• Must apply through the Aga Khan Foundation national office in India.
• Priority given to students in fields related to development (health, education, rural development, etc.).`,
    applicationCycleDuration: `• Applications open: January each year.
• Deadline: March 31.
• Shortlisting: April–May.
• Interviews: May–June.
• Scholarship announcement: June–July.
• Programme start: August/September.
• Loan repayment: Begins after completing the programme.`,
    officialApplyUrl:
      "https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme",
  },

  // ── Open/Loan Schemes ─────────────────────────────────────────────────────
  {
    id: "nmdfc-education-loan",
    name: "NMDFC Education Loan Scheme",
    category: "Open/Loan Schemes",
    lastDateToApply: "Always Open",
    reward: "Up to ₹30 lakh at 3% p.a. (women) / 3.5% p.a. (men) interest",
    eligibilityShort:
      "Minority community students for higher/professional education in India or abroad.",
    studyLevel: ["Undergraduate", "Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Any"],
    location: ["Study in India", "Study Abroad"],
    scholarshipType: ["Education Loan", "Minority/Quota-based"],
    fullEligibility: `• Must be an Indian citizen belonging to a minority community (Muslim, Christian, Sikh, Buddhist, Zoroastrian/Parsi, Jain).
• Annual family income must not exceed ₹6 lakh (for priority sector) or ₹8 lakh (for education loan).
• Must have secured admission to a recognized educational institution in India or abroad.
• Must be pursuing a professional/technical course or higher education programme.
• Loan amount: Up to ₹20 lakh for studies in India; up to ₹30 lakh for studies abroad.
• Interest rate: 3% p.a. for women; 3.5% p.a. for men.
• Repayment period: Up to 5 years after completion of the course.
• Must apply through the State Channelizing Agency (SCA) of the respective state.
• Collateral may be required for loans above ₹7.5 lakh.`,
    applicationCycleDuration: `• Applications are accepted throughout the year (always open).
• Processing time: 4–8 weeks after submission of complete documents.
• Disbursement: Directly to the educational institution or student's account.
• Repayment: Begins 1 year after completion of the course or 6 months after getting employment, whichever is earlier.
• Loan tenure: Up to 5 years for repayment.`,
    officialApplyUrl: "https://nmdfc.org/education-loan-scheme/",
  },
  {
    id: "tmb-super-education-loan",
    name: "TMB Super Education Loan",
    category: "Open/Loan Schemes",
    lastDateToApply: "Always Open",
    reward:
      "Up to ₹40 lakh (India) / ₹1.5 crore (abroad) at competitive interest rates",
    eligibilityShort:
      "Students for higher education in India or abroad through Tamilnad Mercantile Bank.",
    studyLevel: ["Undergraduate", "Postgraduate", "Doctorate/PhD"],
    fieldOfStudy: ["Any"],
    location: ["Study in India", "Study Abroad"],
    scholarshipType: ["Education Loan"],
    fullEligibility: `• Must be an Indian citizen.
• Must have secured admission to a recognized educational institution in India or abroad.
• Must be pursuing a graduate or postgraduate professional/technical course.
• Age: Typically 16–35 years at the time of application.
• Loan amount: Up to ₹40 lakh for studies in India; up to ₹1.5 crore for studies abroad.
• Interest rate: Competitive rates (currently 9.5%–11.5% p.a., subject to change).
• Repayment period: Up to 15 years after the moratorium period.
• Moratorium period: Course duration + 1 year (or 6 months after getting employment).
• Collateral required for loans above ₹7.5 lakh.
• Co-applicant (parent/guardian) required.
• Must apply at the nearest TMB branch.`,
    applicationCycleDuration: `• Applications are accepted throughout the year (always open).
• Processing time: 7–15 working days after submission of complete documents.
• Disbursement: Directly to the educational institution (for tuition) or student's account (for living expenses).
• Repayment: Begins after the moratorium period.
• Loan tenure: Up to 15 years.`,
    officialApplyUrl:
      "https://www.tmb.in/personal-banking/loans/education-loan",
  },
];

export const SCHOLARSHIP_CATEGORIES: ScholarshipCategory[] = [
  "Government Scholarships (International)",
  "Indian Scholarships (Government & Private)",
  "Additional Global & Indian Scholarships",
  "Open/Loan Schemes",
];

export const STUDY_LEVELS: StudyLevel[] = [
  "Undergraduate",
  "Postgraduate",
  "Doctorate/PhD",
  "Research",
];
export const FIELDS_OF_STUDY: FieldOfStudy[] = [
  "Engineering",
  "Medical",
  "General Arts & Science",
  "Vocational/Technical",
  "Any",
];
export const LOCATION_OPTIONS: LocationType[] = [
  "Study in India",
  "Study Abroad",
];
export const SCHOLARSHIP_TYPES: ScholarshipTypeFilter[] = [
  "Merit-based",
  "Need-based",
  "Merit-cum-Means",
  "Minority/Quota-based",
  "Education Loan",
];
