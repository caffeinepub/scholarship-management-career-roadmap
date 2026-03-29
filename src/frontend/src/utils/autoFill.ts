import type { Student } from "../backend";

export interface AutoFillResult {
  success: boolean;
  missingFields: string[];
  filled: Record<string, string>;
}

export function autoFillApplication(profile: Student | null): AutoFillResult {
  if (!profile) {
    return {
      success: false,
      missingFields: ["Student profile not registered"],
      filled: {},
    };
  }

  const missingFields: string[] = [];
  const filled: Record<string, string> = {};

  // Map profile fields
  if (profile.fullName) filled.fullName = profile.fullName;
  else missingFields.push("Full Name");

  if (profile.email) filled.email = profile.email;
  else missingFields.push("Email");

  if (profile.mobileNumber) filled.mobileNumber = profile.mobileNumber;
  else missingFields.push("Mobile Number");

  if (profile.category) filled.category = profile.category;
  else missingFields.push("Category");

  if (profile.annualFamilyIncome) {
    filled.annualFamilyIncome = profile.annualFamilyIncome;
  } else {
    missingFields.push("Income Certificate");
  }

  // Best marks from academic records
  const bestRecord = profile.academicRecords.reduce(
    (best, r) => (r.percentage > (best?.percentage ?? 0) ? r : best),
    profile.academicRecords[0] ?? null,
  );
  if (bestRecord) {
    filled.marks = bestRecord.percentage.toString();
    filled.institution = bestRecord.institution;
  } else {
    missingFields.push("Academic Records (Marksheet)");
  }

  if (profile.instituteName) filled.instituteName = profile.instituteName;
  if (profile.courseName) filled.courseName = profile.courseName;
  if (profile.courseLevel) filled.courseLevel = profile.courseLevel;
  if (profile.state) filled.state = profile.state;
  if (profile.district) filled.district = profile.district;

  return {
    success: missingFields.length === 0,
    missingFields,
    filled,
  };
}
