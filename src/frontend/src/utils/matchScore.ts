import type { Student } from "../backend";
import type { StaticScholarship } from "../data/scholarshipsData";

export interface MatchResult {
  score: number; // 0-100
  status: "High Chance" | "Medium Chance" | "Low Chance";
  breakdown: {
    income: number; // 0 or 30
    marks: number; // 0 or 30
    category: number; // 0 or 20
    documents: number; // 0 or 20
  };
}

// Income string like "3,00,000" → number
function parseIncome(incomeStr: string): number {
  return Number(incomeStr.replace(/,/g, "")) || 0;
}

// Scholarship income limits (mapped by name substring) in INR
const INCOME_LIMITS: Record<string, number> = {
  YASASVI: 250000,
  "Central Sector": 450000,
  "Post-Matric": 250000,
  CSSS: 450000,
  AICTE: 800000,
  INSPIRE: 600000,
  PMSSS: 800000,
  Reliance: 600000,
  HDFC: 600000,
  Tata: 600000,
  SBI: 300000,
  IDFC: 600000,
  Adani: 800000,
};

// Scholarship min marks (percentage) by name substring
const MIN_MARKS: Record<string, number> = {
  YASASVI: 60,
  "Central Sector": 80,
  CSSS: 80,
  AICTE: 60,
  INSPIRE: 90,
  Reliance: 60,
  HDFC: 55,
  Tata: 60,
  SBI: 60,
  IDFC: 60,
  Adani: 65,
};

// Scholarship eligible categories by name substring
const ELIGIBLE_CATEGORIES: Record<string, string[]> = {
  YASASVI: ["obc", "st"],
  "Post-Matric": ["sc", "st"],
  "AICTE Pragati": ["general", "obc", "sc", "st"],
  "AICTE Saksham": ["sc", "st", "obc"],
  INSPIRE: ["general", "obc", "sc", "st"],
  Minority: ["obc", "st"],
  HDFC: ["sc", "st", "obc", "general"],
  Tata: ["sc", "st", "obc", "general"],
  Reliance: ["general", "obc", "sc", "st"],
};

function getIncomeLimit(name: string): number {
  for (const [key, val] of Object.entries(INCOME_LIMITS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return 600000; // default
}

function getMinMarks(name: string): number {
  for (const [key, val] of Object.entries(MIN_MARKS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return 60; // default
}

function getEligibleCategories(name: string): string[] {
  for (const [key, val] of Object.entries(ELIGIBLE_CATEGORIES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return ["general", "obc", "sc", "st"]; // all by default
}

export function calculateMatchScore(
  student: Student,
  scholarship: StaticScholarship,
): MatchResult {
  let score = 0;
  const breakdown = { income: 0, marks: 0, category: 0, documents: 0 };

  // +30 income check
  const studentIncome = parseIncome(student.annualFamilyIncome);
  const incomeLimit = getIncomeLimit(scholarship.name);
  if (studentIncome > 0 && studentIncome < incomeLimit) {
    score += 30;
    breakdown.income = 30;
  }

  // +30 marks check
  const maxPct = Math.max(
    0,
    ...student.academicRecords.map((r) => r.percentage),
  );
  const minMarks = getMinMarks(scholarship.name);
  if (maxPct > minMarks) {
    score += 30;
    breakdown.marks = 30;
  }

  // +20 category check
  const eligibleCats = getEligibleCategories(scholarship.name);
  if (eligibleCats.includes(student.category.toLowerCase())) {
    score += 20;
    breakdown.category = 20;
  }

  // +20 documents verified (use profile documents)
  const mandatoryDocs = student.documents.filter(
    (d) => d.documentType === "Mandatory",
  );
  const allVerified =
    mandatoryDocs.length > 0 && mandatoryDocs.every((d) => d.uploadStatus);
  if (allVerified) {
    score += 20;
    breakdown.documents = 20;
  }

  const status: MatchResult["status"] =
    score >= 70 ? "High Chance" : score >= 40 ? "Medium Chance" : "Low Chance";

  return { score, status, breakdown };
}
