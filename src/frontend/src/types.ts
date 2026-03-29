import type { Principal } from "@dfinity/principal";
import type { Variant_V2_Approved_Rejected_Pending } from "./backend";

// ── Enums ──────────────────────────────────────────────────────────────────

export enum DocumentType {
  Mandatory = "Mandatory",
  Conditional = "Conditional",
  Optional = "Optional",
}

export enum DocumentTypeV2 {
  incomeCertificate = "incomeCertificate",
  casteCertificate = "casteCertificate",
  marksheet = "marksheet",
  idProof = "idProof",
  aadhaarKyc = "aadhaarKyc",
  addressProof = "addressProof",
  disabilityCertificate = "disabilityCertificate",
  birthCertificate = "birthCertificate",
  bankStatement = "bankStatement",
  feeReceipt = "feeReceipt",
  admissionLetter = "admissionLetter",
  degreeCertificate = "degreeCertificate",
  provisionalCertificate = "provisionalCertificate",
  transferCertificate = "transferCertificate",
  characterCertificate = "characterCertificate",
  incomeAffidavit = "incomeAffidavit",
}

export type ScholarshipRegion =
  | { India: null }
  | { Global: null }
  | { USA: null }
  | { Europe: null }
  | { Commonwealth: null };
export type ScholarshipStatus =
  | { Upcoming: null }
  | { Available: null }
  | { Closed: null };

// ── Core Data Types ────────────────────────────────────────────────────────

export interface AcademicRecord {
  institution: string;
  degree: string;
  year: bigint;
  percentage: number;
  marksheetRef: [] | [string];
}

export interface CareerAchievement {
  employer: string;
  role: string;
  duration: string;
  skills: string[];
}

export interface DocumentReference {
  fileName: string;
  documentType: string;
  uploadStatus: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface Student {
  studentId: bigint;
  owner: Principal;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: { male: null } | { female: null } | { other: null };
  category: { general: null } | { obc: null } | { sc: null } | { st: null };
  disabilityStatus:
    | { none: null }
    | { hearingImpaired: null }
    | { sightImpaired: null }
    | { physicalImpaired: null };
  annualFamilyIncome: string;
  state: string;
  district: string;
  courseName: string;
  courseLevel: string;
  instituteName: string;
  currentYear: bigint;
  profileCompletionPercentage: bigint;
  createdAt: bigint;
  updatedAt: bigint;
  academicRecords: AcademicRecord[];
  careerAchievements: CareerAchievement[];
  documents: DocumentReference[];
}

export interface DocumentRecord {
  documentId: bigint;
  studentId: bigint;
  owner: Principal;
  documentName: string;
  documentType:
    | { Mandatory: null }
    | { Conditional: null }
    | { Optional: null };
  uploadStatus: boolean;
  verificationStatus: string;
  fileUrl: string;
  remarks: string;
  uploadedAt: bigint;
  source: { Manual: null } | { DigiLockerVerified: null };
}

export interface Scholarship {
  id: bigint;
  title: string;
  provider: string;
  deadline: bigint;
  description: string;
  requiredDocuments: string[];
  eligibility: {
    minPercentage: number;
    incomeLimit: bigint;
    category: { general: null } | { obc: null } | { sc: null } | { st: null };
    requiredSkills: string[];
  };
  incomeLimit: bigint;
  eligibleCategories: string[];
  eligibleCourseLevels: string[];
  isActive: boolean;
}

export interface ScholarshipApplication {
  applicationId: bigint;
  studentId: bigint;
  scholarshipId: bigint;
  owner: Principal;
  applicationStatus: string;
  rejectionReason: string;
  appliedDate: bigint;
  lastUpdated: bigint;
}

export interface EligibilityCheckResult {
  eligibilityStatus: string;
  riskLevel: string;
  urgentAlert: boolean;
  readinessScore: bigint;
  unmetRequirements: string[];
  missingDocuments: string[];
}

/**
 * DocumentVerificationResult matches the backend interface.
 * status uses Variant_V2_Approved_Rejected_Pending enum.
 * confidence is derived client-side for display:
 *   Approved → 2, Pending → 1, Rejected → 0
 */
export interface DocumentVerificationResult {
  status: Variant_V2_Approved_Rejected_Pending;
  reason: string;
  updatedTimestamp: bigint;
  /** Derived client-side: 0 = zero confidence, 1 = medium, 2 = high */
  confidence: number;
}

export interface ExtendedScholarship {
  id: bigint;
  scholarship_name: string;
  region: ScholarshipRegion;
  duration_tracking: {
    tenure: string;
    renewal_policy: boolean;
  };
  dates: {
    openingDate: bigint;
    closingDate: bigint;
    resultDate: [] | [bigint];
  };
  financials: {
    amount: number;
    currency: string;
  };
  status_calculated: ScholarshipStatus;
  is_archived: boolean;
}
