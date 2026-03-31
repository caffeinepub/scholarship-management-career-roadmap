import React, { useEffect, useRef, useState } from "react";
import { detectEmotion, getEmotionalPrefix } from "../utils/chatbotMatcher";
import { type LocalProfile, loadProfileLocally } from "../utils/profileStore";

type Language = "en" | "hi" | "gu" | "ta";

interface Message {
  role: "bot" | "user";
  text: string;
  id: number;
}

const LANG_LABELS: Record<Language, string> = {
  en: "English",
  hi: "हिंदी",
  gu: "ગુજરાતી",
  ta: "தமிழ்",
};

const GREETINGS: Record<Language, string> = {
  en: "Namaste! Main VANI hoon, tera scholarship mentor 🙂\nKoi bhi doubt ho, seedha pooch — main hoon na help karne ke liye!",
  hi: "नमस्ते! मैं VANI हूँ, तेरा scholarship mentor 🙂\nकोई भी doubt हो, सीधे पूछ — main hoon na help karne ke liye!",
  gu: "નમસ્તે! હું VANI છું, તારો scholarship mentor 🙂\nકોઈ પણ doubt હોય, સીધું પૂછ — main hoon na!",
  ta: "வணக்கம்! நான் VANI, உங்கள் scholarship mentor 🙂\nஏதாவது சந்தேகம் இருந்தால் நேரடியாக கேளுங்கள் — main hoon na!",
};

const SUGGESTIONS: Record<Language, string[]> = {
  en: [
    "Apply kaise karein? 🙂",
    "Kaunse documents chahiye? 📄",
    "Mujhe scholarship suggest karo 🎓",
    "Mujhe samajh nahi aa raha 😟",
    "Main stressed hoon 😰",
    "Skill gap kya hai? 💡",
    "Deadline kab hai? ⏰",
  ],
  hi: [
    "मुझे अब क्या करना चाहिए?",
    "कौन से skills सीखूं?",
    "छात्रवृत्ति कैसे मिलेगी?",
    "Internship सुझाएं",
    "आवेदन कैसे करें?",
    "जरूरी दस्तावेज़",
    "Deadline चेक करें",
  ],
  gu: [
    "હવે શું કરવું?",
    "કઈ skills શીખું?",
    "Scholarship કેવી રીતે?",
    "Internship સૂચવો",
    "અરજી કેવી રીતે?",
    "જરૂરી દસ્તાવેજ",
    "Deadline ચેક",
  ],
  ta: [
    "இனி என்ன செய்வது?",
    "என்ன skills கற்றுக்கொள்வது?",
    "Scholarship எப்படி?",
    "Internship பரிந்துரை",
    "விண்ணப்பிப்பது எப்படி?",
    "தேவையான ஆவணங்கள்",
    "Deadline சரிபார்",
  ],
};

type QAEntry = { keywords: string[]; answer: Record<Language, string> };

const QA_BANK: QAEntry[] = [
  {
    keywords: ["apply", "आवेदन", "அரजी", "விண்ணப்ப"],
    answer: {
      en: "To apply for a scholarship:\n1. Register on ScholarSync\n2. Complete your profile (income, marks, category)\n3. Upload mandatory documents\n4. Browse scholarships and click 'Apply Now'\n5. Use Auto-Fill to save time!",
      hi: "छात्रवृत्ति के लिए आवेदन करने के लिए:\n1. ScholarSync पर पंजीकरण करें\n2. अपना प्रोफ़ाइल पूरा करें (आय, अंक, श्रेणी)\n3. अनिवार्य दस्तावेज़ अपलोड करें\n4. छात्रवृत्ति ब्राउज़ करें और 'अभी आवेदन करें' पर क्लिक करें\n5. समय बचाने के लिए ऑटो-फिल उपयोग करें!",
      gu: "શિષ્યવૃત્તિ માટે અરજી કરવા:\n1. ScholarSync પર નોંધણી કરો\n2. પ્રોફ઼ાઇલ પૂર્ણ કરો\n3. જરૂરી દસ્તાવેજ અપલોડ કરો\n4. 'Apply Now' ક્લિક કરો",
      ta: "உதவித்தொகைக்கு விண்ணப்பிக்க:\n1. ScholarSync இல் பதிவு செய்யுங்கள்\n2. சுயவிவரத்தை நிரப்புங்கள்\n3. ஆவணங்களை பதிவேற்றுங்கள்\n4. 'Apply Now' கிளிக் செய்யுங்கள்",
    },
  },
  {
    keywords: ["eligibility", "पात्रता", "eligible", "योग्यता", "பாத்", "தகுதி"],
    answer: {
      en: "Eligibility criteria typically include:\n• Annual family income below scholarship limit\n• Minimum marks (usually 50%+)\n• Category (SC/ST/OBC/General)\n• All mandatory documents uploaded and verified\n\nCheck each scholarship card for specific requirements.",
      hi: "पात्रता मानदंड में आमतौर पर शामिल हैं:\n• वार्षिक पारिवारिक आय सीमा से कम\n• न्यूनतम अंक (आमतौर पर 50%+)\n• श्रेणी (SC/ST/OBC/सामान्य)\n• सभी अनिवार्य दस्तावेज़ अपलोड और सत्यापित\n\nविशिष्ट आवश्यकताओं के लिए प्रत्येक छात्रवृत्ति कार्ड देखें।",
      gu: "પાત્રતા માપદંડ:\n• વાર્ષિક કૌટુંબિક આવક મર્યાદા કરતા ઓછી\n• ન્યૂનતમ ગુણ (50%+)\n• શ્રેણી (SC/ST/OBC)\n• ફરજિયાત દસ્તાવેજ ચકાસાયેલ",
      ta: "தகுதி அளவுகோல்:\n• குடும்ப வருமானம் வரம்புக்கு கீழ்\n• குறைந்தபட்ச மதிப்பெண்கள் (50%+)\n• வகை (SC/ST/OBC)\n• கட்டாய ஆவணங்கள் சரிபார்க்கப்பட்டவை",
    },
  },
  {
    keywords: ["document", "documents", "दस्तावेज़", "दस्तावेज", "ஆவணங்கள்"],
    answer: {
      en: "Required documents for scholarship application:\n• Aadhaar Card (mandatory)\n• Income Certificate\n• 10th Marksheet\n• 12th Marksheet (if applicable)\n• Bank Passbook / Account details\n• Caste Certificate (if applicable)\n• Passport-size photograph\n\nUpload via DigiLocker for instant verification!",
      hi: "छात्रवृत्ति आवेदन के लिए आवश्यक दस्तावेज़:\n• आधार कार्ड (अनिवार्य)\n• आय प्रमाण पत्र\n• 10वीं मार्कशीट\n• 12वीं मार्कशीट (यदि लागू हो)\n• बैंक पासबुक / खाता विवरण\n• जाति प्रमाण पत्र (यदि लागू हो)\n• पासपोर्ट आकार का फोटो\n\nतत्काल सत्यापन के लिए DigiLocker के माध्यम से अपलोड करें!",
      gu: "જરૂરી દસ્તાવેજ:\n• આધાર કાર્ડ\n• આવક પ્રમાણપત્ર\n• 10મી/12મી માર્કશીટ\n• બેંક પાસબુક\n• જ્ઞાતિ પ્રમાણપત્ર",
      ta: "தேவையான ஆவணங்கள்:\n• ஆதார் அட்டை\n• வருமான சான்றிதழ்\n• 10/12 மதிப்பெண் சான்றிதழ்\n• வங்கி பாஸ்புக்\n• சாதி சான்றிதழ்",
    },
  },
  {
    keywords: ["deadline", "last date", "अंतिम तिथि", "date", "கடைசி தேதி"],
    answer: {
      en: "Scholarship deadlines vary by scheme. Check the individual scholarship cards in the 'Scholarships' section for specific closing dates. Make sure to apply well before the deadline — incomplete applications are rejected!",
      hi: "छात्रवृत्ति की अंतिम तिथियाँ योजना के अनुसार अलग-अलग होती हैं। विशिष्ट समापन तिथियों के लिए 'Scholarships' अनुभाग में अलग-अलग छात्रवृत्ति कार्ड देखें। अंतिम तिथि से पहले आवेदन करना सुनिश्चित करें!",
      gu: "છેલ્લી તારીખ જાણવા 'Scholarships' વિભાગ ચેક કરો. સમયસર અરજી કરો!",
      ta: "இறுதி தேதி அறிய 'Scholarships' பகுதியை சரிபாருங்கள். கடைசி தேதிக்கு முன்பே விண்ணப்பியுங்கள்!",
    },
  },
  {
    keywords: ["status", "check", "स्थिति", "जांच", "நிலை"],
    answer: {
      en: "To check your application status:\n1. Go to 'My Applications' page\n2. Find your scholarship application\n3. The status badge will show: Pending / Under Review / Approved / Rejected\n\nYou can also check on the official scholarship website using your application ID.",
      hi: "अपने आवेदन की स्थिति जांचने के लिए:\n1. 'My Applications' पेज पर जाएं\n2. अपना छात्रवृत्ति आवेदन खोजें\n3. स्थिति बैज दिखाएगा: लंबित / समीक्षाधीन / स्वीकृत / अस्वीकृत",
      gu: "'My Applications' પેજ પર જઈ સ્ટેટ્સ ચેક કરો.",
      ta: "'My Applications' பக்கத்தில் உங்கள் விண்ணப்ப நிலையை சரிபாருங்கள்.",
    },
  },
  {
    keywords: ["otr", "one time registration", "एक बार पंजीकरण"],
    answer: {
      en: "OTR (One Time Registration) is a unique 14-digit number issued based on your Aadhaar. It simplifies scholarship applications — you register once and it applies for your entire academic career. Required for National Scholarship Portal (NSP) scholarships.",
      hi: "OTR (एक बार पंजीकरण) आपके आधार के आधार पर जारी एक अनोखा 14-अंकीय नंबर है। यह छात्रवृत्ति आवेदन को सरल बनाता है — आप एक बार पंजीकरण करते हैं और यह आपके पूरे शैक्षणिक जीवन के लिए लागू होता है।",
      gu: "OTR આધાર-આધારિત 14-અંકનો નંબર છે. NSP પર અરજી માટે ફરજિયાત.",
      ta: "OTR என்பது ஆதார் அடிப்படையிலான 14-இலக்க எண். NSP உதவித்தொகைக்கு கட்டாயம்.",
    },
  },
  {
    keywords: ["digilocker", "डिजिलॉकर"],
    answer: {
      en: "DigiLocker is a government platform for storing digital documents. On ScholarSync:\n• Click 'Connect DigiLocker' in the Documents section\n• Your Aadhaar, 10th & 12th marksheets are auto-fetched\n• Documents are tagged as 'Authentic' — no OCR needed!\n\nThis speeds up verification significantly.",
      hi: "DigiLocker डिजिटल दस्तावेज़ संग्रहीत करने का सरकारी प्लेटफ़ॉर्म है। ScholarSync पर:\n• Documents अनुभाग में 'DigiLocker से जोड़ें' पर क्लिक करें\n• आपका आधार, 10वीं और 12वीं की मार्कशीट स्वतः प्राप्त हो जाती है",
      gu: "DigiLocker સરકારી ડિજિટલ દસ્તાવેજ પ્લેટફ઼ોર્મ છે. Documents વિભાગથી Connect કરો.",
      ta: "DigiLocker என்பது அரசு ஆவண தளம். Documents பகுதியில் இணைக்கவும்.",
    },
  },
];

// ── Career Mentor Functions ────────────────────────────────────────────────────

function getPersonalizedGreeting(
  profile: LocalProfile | null,
  lang: Language,
): string {
  if (!profile || !profile.fullName) return GREETINGS[lang];
  const name = profile.fullName.split(" ")[0];
  const course = profile.courseName || "your course";
  const year = profile.currentYear || 1;
  const greetings: Record<Language, string> = {
    en: `Hi ${name}! 👋 I'm VANI, your career mentor.\nI can see you're in Year ${year} of ${course}.\n\nAsk me "What should I do next?" for your personalized career roadmap, or ask about scholarships, skills, and internships!`,
    hi: `नमस्ते ${name}! 👋 मैं VANI हूँ, आपका career mentor.\nमुझे पता है आप ${course} के Year ${year} में हैं।\n\n"मुझे अब क्या करना चाहिए?" पूछें और पाएं आपका personalized career roadmap!`,
    gu: `નમસ્તે ${name}! 👋 હું VANI, તમારો career mentor.\nTumne ${course}ના Year ${year}માં છો.\n\n"હવે શું કરવું?" પૂછો — personalized roadmap મળશે!`,
    ta: `வணக்கம் ${name}! 👋 நான் VANI, உங்கள் career mentor.\n${course} Year ${year}ல் இருக்கிறீர்கள் என்று தெரியும்.\n\n"இனி என்ன செய்வது?" கேளுங்கள் — personalized roadmap கிடைக்கும்!`,
  };
  return greetings[lang];
}

function getNoProfileResponse(lang: Language): string {
  const r: Record<Language, string> = {
    en: "I'd love to give you a personalized roadmap, but I need your profile first!\n\n📝 Go to Profile → Fill in your course, year, and details → Click 'Register Profile'\n\nThen come back and ask me 'What should I do next?' — I'll give you a step-by-step career plan!",
    hi: "Personalized roadmap देने के लिए मुझे आपका profile चाहिए!\n\n📝 Profile page पर जाएं → Course, Year भरें → 'Register Profile' click करें\n\nफिर 'मुझे अब क्या करना चाहिए?' पूछें — step-by-step career plan मिलेगा!",
    gu: "Personalized roadmap માટે profile જોઈએ!\n\n📝 Profile page → Course, Year ભરો → 'Register Profile'\n\nપછી 'હવે શું કરવું?' પૂછો!",
    ta: "Personalized roadmap க்கு profile வேண்டும்!\n\n📝 Profile page → Course, Year நிரப்பு → 'Register Profile'\n\nபிறகு 'இனி என்ன செய்வது?' கேளு!",
  };
  return r[lang];
}

function getCareerRoadmap(profile: LocalProfile, lang: Language): string {
  const course = profile.courseName || "";
  const year = profile.currentYear || 1;
  const isBTech =
    course.toLowerCase().includes("b.tech") ||
    course.toLowerCase().includes("engineering") ||
    course.toLowerCase().includes("btech");
  const isMedical =
    course.toLowerCase().includes("mbbs") ||
    course.toLowerCase().includes("medical");
  const isArts =
    course.toLowerCase().includes("b.a") ||
    course.toLowerCase().includes("ba ");
  const isScience =
    course.toLowerCase().includes("b.sc") ||
    course.toLowerCase().includes("bsc");
  const isFinalYear = year >= 4 || (year >= 2 && (isArts || isScience));

  if (lang === "en") {
    if (isBTech) {
      if (year === 1)
        return `📍 B.Tech Year 1 Roadmap for ${profile.fullName || "you"}:\n\n✅ Focus Areas:\n• Learn Python + C fundamentals\n• Practice basic DSA\n• Maintain CGPA above 7.5\n• Join coding clubs & tech societies\n\n🎯 Action Items (This Semester):\n1. Complete NPTEL free course\n2. Build 1 mini-project (calculator, to-do app)\n3. Create LinkedIn profile\n\n💡 Scholarships to Apply Now:\n• NSP Central Sector (income < ₹4.5L)\n• AICTE Pragati (girls in engineering)\n• State Merit Scholarship\n\n🔓 Next Unlocked Stage: Internship Prep (Year 2)`;
      if (year === 2)
        return "📍 B.Tech Year 2 Roadmap:\n\n✅ Focus Areas:\n• Data Structures & Algorithms (LeetCode)\n• Web Dev (React/Node) OR Data Science\n• Open Source contributions (GitHub)\n\n🎯 Action Items:\n1. Solve 50+ DSA problems\n2. Build a portfolio project\n3. Apply for summer internships (Dec–Jan)\n4. Get NPTEL certification\n\n💡 Scholarships:\n• NSP scholarships (apply by Nov)\n• Wipro Earthian Scholarship\n• HDFC Educational Crisis Scholarship\n\n🔓 Next Stage: Internship Applications (Year 3)";
      if (year === 3)
        return "📍 B.Tech Year 3 Roadmap (Critical Year!):\n\n✅ Focus Areas:\n• Internship hunt (core top priority)\n• Advanced DSA for interviews\n• Final year project ideation\n\n🎯 Action Items:\n1. Apply to 20+ internships (LinkedIn/Internshala)\n2. Prepare resume (1 page, ATS-friendly)\n3. Practice mock interviews\n4. Shortlist 2–3 higher study options (MS/MBA)\n\n💡 Scholarships:\n• Buddy4Study scholarships\n• Corporate CSR scholarships (TCS, Infosys)\n• GATE prep for M.Tech admissions\n\n🔓 Next Stage: Placements & Job Offers (Year 4)";
      return `📍 B.Tech Final Year Roadmap (Year ${year}):\n\n✅ Top Priorities:\n• Campus placement preparation\n• 150+ DSA problems solved\n• Solid project portfolio (3+ projects)\n\n🎯 Action Items:\n1. Register on placement portal immediately\n2. Target top 10 dream companies\n3. Prepare for GATE/GRE if higher studies\n4. Network with alumni on LinkedIn\n\n💡 Post-Graduation Scholarships:\n• PMRF (Prime Minister Research Fellowship)\n• Commonwealth Scholarships (UK)\n• DAAD Scholarship (Germany)\n\n🎓 You're almost there! Focus → Apply → Succeed`;
    }
    if (isMedical) {
      if (year <= 2)
        return `📍 MBBS Year ${year} Roadmap:\n\n✅ Focus:\n• Master Pre-clinical subjects (Anatomy, Physiology)\n• Maintain 60%+ attendance\n• Join NCC/NSS for extra credit\n\n🎯 Actions:\n1. Study 8+ hours daily — consistency matters\n2. Join medical study groups\n3. Practice with past MBBS exam papers\n\n💡 Scholarships:\n• NSP Post-Matric Scholarship\n• State government medical scholarships\n• ICMR short-term studentship`;
      return `📍 MBBS Clinical Years Roadmap (Year ${year}):\n\n✅ Focus:\n• Clinical postings — attend all\n• USMLE/PLAB prep if considering abroad\n• Internship hospital selection\n\n🎯 Actions:\n1. Start NEET PG prep from Year 4\n2. Research MD/MS specializations\n3. Apply for research publications\n\n💡 Scholarships:\n• Rotary Foundation Scholarship\n• Commonwealth Medical Fellowship\n• NHM research grants`;
    }
    if (isFinalYear)
      return `📍 Final Year Roadmap — ${course}:\n\n✅ Priorities:\n• Strong final year project\n• Placement / higher studies decision\n• Complete all pending certifications\n\n🎯 Actions:\n1. Finalize and submit your dissertation/project\n2. Apply for jobs (LinkedIn, Naukri, Campus)\n3. Prepare for competitive exams (UPSC, CAT, GATE)\n\n💡 Scholarships for Higher Studies:\n• UGC Junior Research Fellowship\n• CSIR-NET Fellowship\n• State PG Merit Scholarship\n\n🎓 Final push — you're almost there!`;
    return `📍 Year ${year} Roadmap — ${course || "Your Course"}:\n\n✅ Focus:\n• Excel in current semester subjects\n• Build 1–2 skill certifications\n• Connect with alumni in your field\n\n🎯 Actions:\n1. Complete your syllabus ahead of exams\n2. Join 1 internship or part-time project\n3. Apply for active scholarships in Scholarships tab\n\n💡 Scholarships:\n• NSP Central Sector Scheme\n• Inspire Scholarship (science students)\n• State-specific merit scholarships\n\n🔓 Keep completing your profile for better scholarship matches!`;
  }

  if (lang === "hi") {
    return `📍 ${profile.fullName || "आपका"} का Career Roadmap (${course}, Year ${year}):\n\n✅ अभी Focus करें:\n• अपने subjects में अच्छे marks लाएं\n• 1-2 Online Certifications करें (NPTEL/Coursera)\n• LinkedIn Profile बनाएं\n\n🎯 Action Items:\n1. अभी active scholarships के लिए apply करें\n2. अपना CV/Resume तैयार करें\n3. Internship के लिए Internshala check करें\n\n💡 Apply करें:\n• NSP Central Sector Scholarship (income < ₹4.5L)\n• State Merit Scholarship\n• Category-based NSP scholarship\n\n🔓 अगला Stage: Profile 100% complete करें!`;
  }

  if (lang === "gu") {
    return `📍 ${profile.fullName || "તમારો"} Career Roadmap (${course}, Year ${year}):\n\n✅ Focus:\n• Subjects માં સારા marks\n• Online Certifications (NPTEL)\n• LinkedIn Profile બનાવો\n\n🎯 Actions:\n1. Scholarships tab check કરો\n2. Resume તૈયાર કરો\n3. Internshala પર internship search\n\n💡 Scholarships:\n• NSP Central Sector\n• State Merit Scholarship\n• AICTE/UGC Scholarship`;
  }

  return `📍 ${profile.fullName || "உங்கள்"} Career Roadmap (${course}, Year ${year}):\n\n✅ கவனிக்க:\n• தற்போதைய பாடங்களில் சிறப்பு\n• Online Certifications (NPTEL)\n• LinkedIn Profile உருவாக்கு\n\n🎯 Actions:\n1. Scholarships tab சரிபார்\n2. Resume தயார் செய்\n3. Internshala இல் internship தேடு\n\n💡 Scholarships:\n• NSP Central Sector\n• State Merit Scholarship`;
}

function getSkillsAdvice(profile: LocalProfile | null, lang: Language): string {
  if (!profile) {
    const r: Record<Language, string> = {
      en: "Please register your profile first so I can suggest skills based on your course and year!",
      hi: "कृपया पहले अपना profile register करें ताकि मैं आपके course के अनुसार skills suggest कर सकूं!",
      gu: "Profile register કરો — course આધારે skills suggest કરીશ!",
      ta: "Profile register செய்யுங்கள் — course அடிப்படையில் skills பரிந்துரைக்கிறேன்!",
    };
    return r[lang];
  }
  const course = profile.courseName?.toLowerCase() || "";
  const year = profile.currentYear || 1;
  const isBTech =
    course.includes("b.tech") ||
    course.includes("engineering") ||
    course.includes("btech");
  if (lang === "en") {
    if (isBTech) {
      if (year <= 2)
        return `🧠 Skills to Learn for B.Tech Year ${year}:\n\n🔥 Must-Learn:\n• Python (automation + scripting)\n• C++ (DSA + competitive coding)\n• Git & GitHub\n• SQL (database basics)\n\n📈 Trending Skills (2025):\n• AI/ML basics (Coursera: Machine Learning)\n• Web Dev (HTML, CSS, React)\n• Cloud basics (AWS Free Tier)\n\n🎯 Certifications:\n• NPTEL: Programming in Java / Python\n• Google: IT Support Certificate\n• Microsoft: Azure Fundamentals (AZ-900)\n\n💡 Tip: Pick ONE track (Web / AI / Cloud) and go deep!`;
      return `🧠 Skills for B.Tech Year ${year} (Placement Focus):\n\n🔥 Core Technical:\n• Advanced DSA (Trees, Graphs, DP)\n• System Design basics\n• Your specialization (CS: DBMS, OS, CN)\n\n📈 High-Demand Skills:\n• React.js + Node.js (Full Stack)\n• Python + TensorFlow (AI/ML)\n• Docker + Kubernetes (DevOps)\n\n🎯 Certifications that matter:\n• AWS Solutions Architect\n• Google Professional Developer\n• Hackerrank Gold Badge\n\n💡 Build 2 strong projects + deploy them online!`;
    }
    return `🧠 Skills to Learn (${profile.courseName || "Your Course"}):\n\n🔥 Core Skills:\n• MS Office / Google Workspace\n• Data Analysis (Excel/Sheets)\n• Communication & presentation\n• Digital literacy (social media, email etiquette)\n\n📈 Trending:\n• Canva / Graphic Design\n• Basic Python scripting\n• Content writing & blogging\n\n🎯 Free Certifications:\n• NPTEL courses (free + govt certified)\n• Google Digital Garage\n• Coursera (audit for free)\n\n💡 Skills + Internship = Strong scholarship profile!`;
  }
  if (lang === "hi")
    return `🧠 ${profile.courseName} के लिए Skills:\n\n🔥 जरूर सीखें:\n• Python / C++ programming\n• Git & GitHub\n• Excel / Data basics\n\n📈 2025 के trending skills:\n• AI/ML basics\n• Web Development\n• Cloud Computing\n\n🎯 Free Certifications:\n• NPTEL (सरकारी मान्यता प्राप्त)\n• Google Digital Garage\n• Coursera (free audit)\n\n💡 एक skill track चुनें और उसमें expert बनें!`;
  if (lang === "gu")
    return `🧠 ${profile.courseName} Skills:\n\n🔥 શીખો:\n• Python/C++ programming\n• Git & GitHub\n• Excel basics\n\n📈 Trending 2025:\n• AI/ML, Web Dev, Cloud\n\n🎯 Free Certifications:\n• NPTEL, Google Garage, Coursera`;
  return `🧠 ${profile.courseName} Skills:\n\n🔥 கற்க:\n• Python/C++ programming\n• Git & GitHub\n• Excel basics\n\n📈 Trending 2025:\n• AI/ML, Web Dev, Cloud\n\n🎯 Free Certifications:\n• NPTEL, Google Garage, Coursera`;
}

function getPersonalizedScholarshipAdvice(
  profile: LocalProfile | null,
  lang: Language,
): string {
  if (!profile) {
    const r: Record<Language, string> = {
      en: "Register your profile first so I can suggest scholarships based on your income, category, and course!",
      hi: "Profile register करें — फिर income और category के आधार पर scholarship suggest करूंगा!",
      gu: "Profile register કરો — income/category આધારે scholarship suggest કરીશ!",
      ta: "Profile register செய்யுங்கள் — income/category அடிப்படையில் scholarship பரிந்துரைக்கிறேன்!",
    };
    return r[lang];
  }
  const incomeStr = (profile.annualFamilyIncome || "").replace(/[^0-9]/g, "");
  const income = incomeStr ? Number.parseInt(incomeStr) : 0;
  const isLowIncome =
    income < 300000 ||
    profile.annualFamilyIncome?.toLowerCase().includes("below") ||
    income === 0;
  const isSCST = profile.category === "sc" || profile.category === "st";
  const isOBC = profile.category === "obc";

  if (lang === "en") {
    let scholarships = `🎓 Scholarships for You (${profile.fullName || "Student"}):\n\n`;
    if (isLowIncome)
      scholarships +=
        "💰 Income-Based (High Priority):\n• NSP Central Sector Scholarship (₹12,000–₹20,000/year)\n• PM Scholarship for Central Armed Police Forces\n• Indira Gandhi Single Girl Child Scholarship\n\n";
    if (isSCST)
      scholarships +=
        "🏷️ SC/ST Category Scholarships:\n• NSP Pre/Post Matric SC Scholarship\n• Dr. Ambedkar Post-Matric Scholarship\n• Rajiv Gandhi SC/ST Scholarship\n\n";
    if (isOBC)
      scholarships +=
        "🏷️ OBC Category Scholarships:\n• NSP OBC Post-Matric Scholarship\n• PM Yasasvi Scholarship (OBC, EBC)\n• State OBC Welfare scholarships\n\n";
    scholarships +=
      "📚 Merit-Based (Apply Now!):\n• NSP Central Sector Scheme\n• AICTE Pragati/Saksham Scholarship\n• State Board Merit Scholarship\n\n";
    scholarships +=
      "🌍 International (Future):\n• Commonwealth Scholarship (UK)\n• DAAD Scholarship (Germany)\n• Fulbright (USA)\n\n";
    scholarships +=
      "🔗 Visit Scholarships tab → filter by your profile for exact matches!";
    return scholarships;
  }
  if (lang === "hi")
    return `🎓 ${profile.fullName || "आपके"} लिए Scholarships:\n\n💰 Income-Based:\n• NSP Central Sector Scholarship\n• PM Yasasvi Scholarship\n\n🏷️ Category-Based:\n• NSP Pre/Post Matric Scholarship\n• Dr. Ambedkar Scholarship\n\n📚 Merit-Based:\n• State Merit Scholarship\n• AICTE Scholarship\n\n🔗 Scholarships tab में filter करके देखें!`;
  if (lang === "gu")
    return `🎓 ${profile.fullName || "તમારા"} Scholarships:\n\n• NSP Central Sector\n• PM Yasasvi\n• State Merit Scholarship\n• AICTE Scholarship\n\n🔗 Scholarships tab filter કરો!`;
  return `🎓 ${profile.fullName || "உங்கள்"} Scholarships:\n\n• NSP Central Sector\n• PM Yasasvi\n• State Merit Scholarship\n• AICTE Scholarship\n\n🔗 Scholarships tab filter செய்யுங்கள்!`;
}

function getInternshipAdvice(
  profile: LocalProfile | null,
  lang: Language,
): string {
  if (!profile) return getNoProfileResponse(lang);
  const year = profile.currentYear || 1;
  if (lang === "en")
    return `🔍 Internship Guide for ${profile.fullName || "you"} (Year ${year}):\n\n🌐 Best Platforms:\n1. Internshala (internshala.com) — India's #1\n2. LinkedIn Jobs → filter "Internship"\n3. LetsIntern / HelloIntern\n4. Company career pages (TCS, Wipro, Infosys)\n\n📝 Application Tips:\n• Resume: 1 page, include projects, skills, certifications\n• Apply 3–4 months before desired start date\n• Write a personalized cover letter\n\n🎯 Competitive Internship Programs:\n• Google STEP Internship (2nd/3rd year CS)\n• Microsoft Engage (CS students)\n• Amazon SDE Internship\n• Govt: DRDO, ISRO, CSIR internships\n\n⏰ Best time to apply: October–December for summer internships!`;
  if (lang === "hi")
    return `🔍 Internship Guide (Year ${year}):\n\n🌐 Platforms:\n• Internshala.com\n• LinkedIn Jobs\n• LetsIntern\n\n📝 Tips:\n• 1-page resume बनाएं\n• 3-4 months पहले apply करें\n\n🎯 Top Programs:\n• Google STEP, Microsoft Engage\n• DRDO, ISRO (Govt internships)\n\n⏰ October-December में apply करें!`;
  return "🔍 Internship Guide:\n• Internshala.com\n• LinkedIn Jobs\n• LetsIntern\n\n📝 Tips: Resume + Early application\n🎯 Google STEP, Microsoft Engage\n⏰ Oct-Dec: Apply for summer internships";
}

function getProgressAdvice(
  profile: LocalProfile | null,
  lang: Language,
): string {
  if (!profile) return getNoProfileResponse(lang);
  const year = profile.currentYear || 1;
  const stage =
    year >= 4
      ? "Placement Stage"
      : year === 3
        ? "Internship Stage"
        : year === 2
          ? "Skill Building Stage"
          : "Foundation Stage";
  const nextStage =
    year >= 4
      ? "Job / Higher Studies"
      : year === 3
        ? "Placement Preparation"
        : year === 2
          ? "Internship Applications"
          : "Skill Building";
  if (lang === "en")
    return `📊 Your Progress Summary:\n\n📍 Current Stage: ${stage} (Year ${year})\n🔓 Next Unlocked: ${nextStage}\n\n✅ Career Roadmap:\n${"|✅".repeat(Math.min(year, 4)).slice(1)}${"🔒".repeat(Math.max(0, 4 - year))} (${year}/4 years complete)\n\n🎯 Complete these to unlock next stage:\n• Maintain CGPA above 7.0\n• Apply for at least 1 scholarship\n• Upload all mandatory documents\n• Complete your profile 100%\n\nAsk "What should I do next?" for detailed action items!`;
  return getCareerRoadmap(profile, lang);
}

function getBotReply(
  input: string,
  lang: Language,
  profile: LocalProfile | null,
): string {
  const lower = input.toLowerCase();

  // Career mentor triggers — check FIRST before QA_BANK
  const isNextSteps =
    lower.includes("next") ||
    lower.includes("roadmap") ||
    lower.includes("what should") ||
    lower.includes("क्या करूं") ||
    lower.includes("क्या करना") ||
    lower.includes("हवे शू") ||
    lower.includes("இனி என்ன") ||
    lower.includes("pathway") ||
    lower.includes("plan");
  const isSkills =
    lower.includes("skill") ||
    lower.includes("learn") ||
    lower.includes("सीखूं") ||
    lower.includes("सीखें") ||
    lower.includes("शीखू") ||
    lower.includes("கற்");
  const isScholarshipPersonal =
    lower.includes("scholarship") ||
    lower.includes("छात्रवृत्ति") ||
    lower.includes("how can i get") ||
    lower.includes("कैसे मिलेगी") ||
    lower.includes("உதவித்தொகை");
  const isInternship =
    lower.includes("internship") ||
    lower.includes("intern") ||
    lower.includes("इंटर्नशिप") ||
    lower.includes("இன்டர்ன்");
  const isProgress =
    lower.includes("progress") ||
    lower.includes("stage") ||
    lower.includes("unlocked") ||
    lower.includes("my progress");

  if (isNextSteps)
    return profile
      ? getCareerRoadmap(profile, lang)
      : getNoProfileResponse(lang);
  if (isSkills) return getSkillsAdvice(profile, lang);
  if (isScholarshipPersonal && profile)
    return getPersonalizedScholarshipAdvice(profile, lang);
  if (isInternship) return getInternshipAdvice(profile, lang);
  if (isProgress) return getProgressAdvice(profile, lang);

  // Fall back to QA_BANK for static topics
  for (const entry of QA_BANK) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return entry.answer[lang];
    }
  }

  // Smart fallback with profile context
  if (profile) {
    const fallback: Record<Language, string> = {
      en: `I'm not sure about that, but based on your profile (${profile.courseName}, Year ${profile.currentYear}), I suggest:\n• Ask "What should I do next?" for your roadmap\n• Ask "Which skills to learn?" for recommendations\n• Ask "How to get a scholarship?" for personalized matches\n\nOr contact support for further help.`,
      hi: `मुझे इस बारे में जानकारी नहीं। लेकिन आपके profile (${profile.courseName}) के आधार पर:\n• "मुझे अब क्या करना चाहिए?" — roadmap के लिए\n• "कौन से skills सीखूं?" — recommendations के लिए\n• "छात्रवृत्ति कैसे मिलेगी?" — scholarships के लिए`,
      gu: `ખ્યાલ નથી. પણ (${profile.courseName}) profile આધારે:\n• "હવે શું કરવું?" — roadmap\n• "કઈ skills?" — recommendations\n• "Scholarship?" — personalized matches`,
      ta: `தெரியவில்லை. ஆனால் (${profile.courseName}) profile அடிப்படையில்:\n• "இனி என்ன செய்வது?" — roadmap\n• "என்ன skills?" — பரிந்துரை\n• "Scholarship?" — personalized matches`,
    };
    return fallback[lang];
  }

  const fallback: Record<Language, string> = {
    en: "I'm not sure about that. Please try asking about:\n• How to apply\n• Eligibility criteria\n• Required documents\n• Application status\n• DigiLocker\n\nOr register your profile for personalized career advice!",
    hi: "मुझे इस बारे में जानकारी नहीं है। कृपया इनके बारे में पूछें:\n• आवेदन कैसे करें\n• पात्रता मानदंड\n• आवश्यक दस्तावेज़\n• आवेदन स्थिति\n\nPersonalized advice के लिए profile register करें!",
    gu: "ખ્યાલ નથી. અરજી, પાત્રતા, દસ્તાવેજ અથવા DigiLocker વિશે પૂછો.\nPersonalized advice માટે profile register કરો!",
    ta: "தெரியவில்லை. விண்ணப்பம், தகுதி, ஆவணங்கள் பற்றி கேளுங்கள்.\nPersonalized advice க்கு profile register செய்யுங்கள்!",
  };
  return fallback[lang];
}

let msgIdCounter = 0;

export default function ScholarBot() {
  const [open, setOpen] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [pendingLang, setPendingLang] = useState<Language>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [studentProfile, _setStudentProfile] = useState<LocalProfile | null>(
    () => loadProfileLocally(),
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only run when open flips to true
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text: getPersonalizedGreeting(studentProfile, lang),
          id: ++msgIdCounter,
        },
      ]);
    }
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/typing change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleOpen() {
    setShowLangPicker(true);
  }

  function handleLangOk() {
    setLang(pendingLang);
    setShowLangPicker(false);
    setOpen(true);
    setMessages([
      {
        role: "bot",
        text: getPersonalizedGreeting(studentProfile, pendingLang),
        id: ++msgIdCounter,
      },
    ]);
  }

  function handleSend(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText, id: ++msgIdCounter },
    ]);
    setIsTyping(true);
    // Capture profile at call time to use inside the timeout
    const profileSnapshot = studentProfile;
    setTimeout(() => {
      const baseReply = getBotReply(userText, lang, profileSnapshot);
      const emotion = detectEmotion(userText);
      const prefix = getEmotionalPrefix(emotion);
      const motivationLines = [
        "You're doing great 🙂",
        "You're on the right track 🚀",
        "Keep going, you've got this! 💡",
        "One step at a time — you can do this! 🙂",
      ];
      const addMotivation =
        baseReply.length > 120 &&
        !baseReply.includes("🚀") &&
        !baseReply.includes("doing great");
      const motivation = addMotivation
        ? `\n\n${motivationLines[Math.floor(Math.random() * motivationLines.length)]}`
        : "";
      const reply = prefix
        ? `${prefix}\n\n${baseReply}${motivation}`
        : `${baseReply}${motivation}`;
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: reply, id: ++msgIdCounter },
      ]);
      setIsTyping(false);
    }, 800);
  }

  const bubbleLabel: Record<Language, string> = {
    en: "Happy to Assist",
    hi: "सहायता के लिए तैयार",
    gu: "મદદ માટે તૈયાર",
    ta: "உதவ தயார்",
  };

  return (
    <>
      {/* Language Picker Modal */}
      {showLangPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden">
            <div className="bg-blue-500 px-5 py-4 flex justify-between items-center">
              <h2 className="text-white font-semibold text-base">
                Please Select Language
              </h2>
              <button
                type="button"
                onClick={() => setShowLangPicker(false)}
                className="text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-5 space-y-3">
              {(Object.entries(LANG_LABELS) as [Language, string][]).map(
                ([code, label]) => (
                  <label
                    key={code}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="lang"
                      value={code}
                      checked={pendingLang === code}
                      onChange={() => setPendingLang(code)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-gray-800 font-medium">{label}</span>
                  </label>
                ),
              )}
            </div>
            <div className="px-5 pb-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLangPicker(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleLangOk}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-28 right-4 z-50 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-sm">
                V
              </div>
              <div>
                <div className="text-white font-semibold text-sm">VANI</div>
                <div className="text-blue-200 text-xs">
                  ScholarSync Assistant
                </div>
                {studentProfile && (
                  <div className="text-blue-200 text-xs mt-0.5">
                    👤 {studentProfile.fullName} • {studentProfile.courseName} Y
                    {studentProfile.currentYear}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLangPicker(true)}
                className="text-white text-xs bg-white/20 hover:bg-white/30 rounded-full px-2 py-1"
              >
                {LANG_LABELS[lang]}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50"
            style={{ minHeight: 0 }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    V
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2 flex-shrink-0">
                  V
                </div>
                <div className="bg-white rounded-2xl rounded-bl-none px-3 py-2 shadow-sm border border-gray-100">
                  <span className="flex gap-1 items-center h-4">
                    <span
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white border-t border-gray-100">
            {SUGGESTIONS[lang].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSend(s)}
                className="flex-shrink-0 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full px-3 py-1 border border-blue-200 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-2">
            <input
              className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder={
                lang === "hi"
                  ? "अपना सवाल लिखें..."
                  : lang === "gu"
                    ? "તમારો પ્રશ્ન લખો..."
                    : lang === "ta"
                      ? "உங்கள் கேள்வி..."
                      : "Type your question..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              type="button"
              aria-label="Send message"
              onClick={() => handleSend()}
              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bot Button */}
      {!open && !showLangPicker && (
        <button
          type="button"
          aria-label="Open VANI scholarship assistant"
          onClick={handleOpen}
          className="fixed bottom-6 right-4 z-50 flex flex-col items-center group"
        >
          <div className="relative mb-1">
            <div className="bg-blue-500 hover:bg-blue-600 transition-colors w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
              <svg
                viewBox="0 0 64 64"
                aria-hidden="true"
                className="w-10 h-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="32" cy="32" r="28" fill="#1d4ed8" />
                <rect
                  x="18"
                  y="22"
                  width="28"
                  height="20"
                  rx="4"
                  fill="white"
                  opacity="0.15"
                />
                <circle cx="24" cy="32" r="5" fill="#1e3a8a" />
                <circle cx="40" cy="32" r="5" fill="#1e3a8a" />
                <circle cx="25" cy="31" r="2" fill="white" />
                <circle cx="41" cy="31" r="2" fill="white" />
                <path
                  d="M24 42 Q32 47 40 42"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <rect
                  x="28"
                  y="10"
                  width="8"
                  height="6"
                  rx="2"
                  fill="white"
                  opacity="0.5"
                />
                <line
                  x1="32"
                  y1="16"
                  x2="32"
                  y2="22"
                  stroke="white"
                  opacity="0.5"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="absolute -top-8 -right-2 bg-white text-blue-700 text-xs font-semibold px-2 py-1 rounded-full shadow border border-blue-200 whitespace-nowrap">
              {bubbleLabel[lang]}
            </div>
          </div>
          <span className="text-white text-xs font-bold bg-blue-500 rounded-full px-2 py-0.5 shadow">
            VANI
          </span>
        </button>
      )}

      {/* Close button when chat is open */}
      {open && (
        <button
          type="button"
          aria-label="Close VANI assistant"
          onClick={() => setOpen(false)}
          className="fixed bottom-6 right-4 z-50 flex flex-col items-center"
        >
          <div className="bg-indigo-600 hover:bg-indigo-700 transition-colors w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </div>
        </button>
      )}
    </>
  );
}
