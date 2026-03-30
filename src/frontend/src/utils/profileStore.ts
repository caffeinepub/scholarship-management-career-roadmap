import type { Student } from "../backend";

export interface LocalProfile {
  fullName: string;
  courseName: string;
  courseLevel: string;
  currentYear: number;
  annualFamilyIncome: string;
  state: string;
  district: string;
  category: string;
  email: string;
  mobileNumber: string;
  gender: string;
  disabilityStatus: string;
  instituteName: string;
  skills: string[];
  careerGoal: string;
}

const KEY = "scholarSync_profile";
const PROFILE_ID_STORAGE_KEY = "scholarpath_profileId";

export function saveProfileLocally(profile: Partial<LocalProfile>): void {
  try {
    const existing = loadProfileLocally();
    const merged = { ...existing, ...profile };
    localStorage.setItem(KEY, JSON.stringify(merged));
    // Also save under the user-requested key
    localStorage.setItem("studentProfile", JSON.stringify(merged));
  } catch {}
}

export function loadProfileLocally(): LocalProfile | null {
  try {
    // Try both keys
    const raw =
      localStorage.getItem(KEY) || localStorage.getItem("studentProfile");
    if (raw) return JSON.parse(raw) as LocalProfile;
  } catch {}
  return null;
}

export function clearProfileLocally(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem("studentProfile");
  } catch {}
}

function calculateProfileCompletion(profile: LocalProfile): number {
  const fields = [
    profile.fullName,
    profile.email,
    profile.mobileNumber,
    profile.gender,
    profile.category,
    profile.annualFamilyIncome,
    profile.state,
    profile.district,
    profile.courseName,
    profile.courseLevel,
    profile.instituteName,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

/**
 * Converts a locally-stored profile into a Student shape that the UI expects.
 * This allows the entire app to work offline with no ICP backend dependency.
 */
export function localToStudent(local: LocalProfile): Student {
  const idStr =
    localStorage.getItem(PROFILE_ID_STORAGE_KEY) ||
    sessionStorage.getItem(PROFILE_ID_STORAGE_KEY);
  const profileId = idStr ? BigInt(idStr) : BigInt(Date.now());
  const pct = calculateProfileCompletion(local);

  return {
    profileId,
    fullName: local.fullName || "",
    email: local.email || "",
    mobileNumber: local.mobileNumber || "",
    gender: (local.gender || "other") as Student["gender"],
    category: (local.category || "general") as Student["category"],
    disabilityStatus: (local.disabilityStatus ||
      "none") as Student["disabilityStatus"],
    annualFamilyIncome: local.annualFamilyIncome || "",
    state: local.state || "",
    district: local.district || "",
    courseName: local.courseName || "",
    courseLevel: local.courseLevel || "",
    instituteName: local.instituteName || "",
    currentYear: BigInt(local.currentYear || 1),
    documents: [],
    academicRecords: [],
    careerAchievements: [],
    profileCompletionPercentage: BigInt(pct),
    owner: "" as unknown as Student["owner"],
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  };
}
