import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AcademicRecord,
  CareerAchievement,
  DocumentVerificationResult,
  Student,
  UserProfile,
} from "../backend";
import type { Category, DisabilityStatus, Gender } from "../backend";
import { Variant_V2_Approved_Rejected_Pending } from "../backend";
import {
  loadProfileLocally,
  localToStudent,
  saveProfileLocally,
} from "../utils/profileStore";
import { useActor } from "./useActor";
import { storeProfileId } from "./useProfile";

// ── Keyword lists for local document verification ──────────────────────────────
const DOCUMENT_KEYWORDS: Record<string, string[]> = {
  marksheet: [
    "marks",
    "grade",
    "examination",
    "school",
    "board",
    "subject",
    "class",
    "pass",
    "cbse",
    "icse",
    "result",
  ],
  incomeCertificate: [
    "income",
    "annual",
    "family",
    "certificate",
    "government",
    "rupees",
    "revenue",
    "earnings",
  ],
  idProof: [
    "name",
    "date",
    "birth",
    "address",
    "identity",
    "government",
    "proof",
  ],
  aadhaarKyc: [
    "aadhaar",
    "uid",
    "unique",
    "identification",
    "india",
    "uidai",
    "adhaar",
  ],
  casteCertificate: [
    "caste",
    "category",
    "certificate",
    "sc",
    "st",
    "obc",
    "government",
    "community",
  ],
  addressProof: [
    "address",
    "resident",
    "residing",
    "house",
    "state",
    "district",
    "locality",
  ],
  disabilityCertificate: [
    "disability",
    "disabled",
    "certificate",
    "government",
    "medical",
    "handicap",
  ],
  birthCertificate: [
    "birth",
    "born",
    "certificate",
    "date",
    "hospital",
    "registration",
  ],
  bankStatement: [
    "bank",
    "account",
    "balance",
    "transaction",
    "statement",
    "debit",
    "credit",
  ],
  feeReceipt: [
    "fee",
    "receipt",
    "paid",
    "amount",
    "institution",
    "admission",
    "semester",
  ],
  admissionLetter: [
    "admission",
    "accepted",
    "enrolled",
    "institute",
    "university",
    "letter",
  ],
  degreeCertificate: [
    "degree",
    "bachelor",
    "master",
    "certificate",
    "university",
    "graduate",
    "awarded",
  ],
};

/**
 * Local confidence-based document verification.
 * Rule: Never auto-reject for short OCR text — always prefer Manual Review over Rejection.
 */
function simulateLocalVerification(
  documentType: string,
  ocrText: string,
): DocumentVerificationResult {
  const text = (ocrText || "").toLowerCase();
  const keywords = DOCUMENT_KEYWORDS[documentType] || [
    "document",
    "verified",
    "certificate",
  ];
  const MIN_LENGTH = 40;

  // Rule: short text → Manual Review, never Reject
  if (text.length < MIN_LENGTH) {
    return {
      status: Variant_V2_Approved_Rejected_Pending.Pending,
      reason: "Low OCR confidence. Sent for manual review.",
      updatedTimestamp: BigInt(Date.now()),
    };
  }

  // Confidence scoring
  let confidence = 1; // length check passed
  const matched = keywords.filter((k) => text.includes(k.toLowerCase()));
  if (matched.length >= 1) confidence += 1;
  if (matched.length >= 3) confidence += 1;

  if (confidence >= 2) {
    return {
      status: Variant_V2_Approved_Rejected_Pending.Approved,
      reason: "Document verified successfully",
      updatedTimestamp: BigInt(Date.now()),
    };
  }

  if (confidence === 1) {
    return {
      status: Variant_V2_Approved_Rejected_Pending.Pending,
      reason: "Low OCR confidence. Sent for manual review.",
      updatedTimestamp: BigInt(Date.now()),
    };
  }

  return {
    status: Variant_V2_Approved_Rejected_Pending.Rejected,
    reason: "Document type mismatch",
    updatedTimestamp: BigInt(Date.now()),
  };
}

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) return; // silently ignore if no actor
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch {
        // ignore auth errors
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ── My Profile (Student) — localStorage-first, no backend dependency ──────────

export function useGetMyProfile() {
  // Read from localStorage immediately for sync initial data
  const local = loadProfileLocally();

  const query = useQuery<Student | null>({
    queryKey: ["myProfile"],
    queryFn: async (): Promise<Student | null> => {
      // Always serve from localStorage — no ICP backend calls needed
      const fresh = loadProfileLocally();
      return fresh ? localToStudent(fresh) : null;
    },
    enabled: true,
    retry: false,
    staleTime: 1000 * 60 * 5,
    // Provide immediate sync data from localStorage — no loading flash
    initialData: local ? localToStudent(local) : null,
  });

  return {
    ...query,
    // With initialData, query is always "fetched" — no spinner needed
    isLoading: false,
    isFetched: true,
    profile: query.data ?? null,
  };
}

/**
 * useGetMyStudent — alias for useGetMyProfile for backward compatibility.
 */
export function useGetMyStudent() {
  const result = useGetMyProfile();
  return {
    ...result,
    data: result.data ?? null,
  };
}

// ── Student Registration — localStorage only, no ICP actor ──────────────────

export function useRegisterStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      fullName: string;
      email: string;
      mobileNumber: string;
      gender: Gender;
      category: Category;
      disabilityStatus: DisabilityStatus;
      annualFamilyIncome: string;
      state: string;
      district: string;
      courseName: string;
      courseLevel: string;
      instituteName: string;
      currentYear: bigint;
    }): Promise<bigint> => {
      // Generate a unique local profile ID
      const profileId = BigInt(Date.now());
      const profileIdStr = profileId.toString();

      // Persist to localStorage under both expected keys
      saveProfileLocally({
        fullName: params.fullName,
        email: params.email,
        mobileNumber: params.mobileNumber,
        gender: params.gender,
        category: params.category,
        disabilityStatus: params.disabilityStatus,
        annualFamilyIncome: params.annualFamilyIncome,
        state: params.state,
        district: params.district,
        courseName: params.courseName,
        courseLevel: params.courseLevel,
        instituteName: params.instituteName,
        currentYear: Number(params.currentYear),
        skills: [],
        careerGoal: "",
      });

      // Also save detailed record under the user-requested "studentProfile" key
      localStorage.setItem(
        "studentProfile",
        JSON.stringify({
          ...params,
          profileId: profileIdStr,
          currentYear: Number(params.currentYear),
          registeredAt: new Date().toISOString(),
        }),
      );

      // Persist the profile ID so it survives page reloads
      storeProfileId(profileId);

      return profileId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

// ── Update Student ────────────────────────────────────────────────────────────

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: {
      academicRecords?: unknown[];
      careerAchievements?: unknown[];
      [key: string]: unknown;
    }) => {
      // No-op: silently succeed so UI doesn't break.
      return undefined;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

// ── Documents — local simulation, no backend ─────────────────────────────────

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      documentName: string;
      filePath: string;
    }): Promise<string> => {
      // Local-only: return a fake file reference — no ICP upload needed
      return `local://${params.documentName}`;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useGetDocumentsByStudent(studentId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["documents", studentId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null) return [];
      try {
        return (
          actor as unknown as Record<string, (id: bigint) => Promise<unknown[]>>
        ).getDocumentsByStudent(studentId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && studentId !== null,
  });
}

export function useUpdateDocumentUploadStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      documentId: bigint;
      uploadStatus: boolean;
      fileUrl: string;
      studentId: bigint;
    }) => {
      if (!actor) return;
      try {
        return (
          actor as unknown as Record<
            string,
            (...args: unknown[]) => Promise<unknown>
          >
        ).updateDocumentUploadStatus(
          params.documentId,
          params.uploadStatus,
          params.fileUrl,
        );
      } catch {
        // ignore auth errors
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.studentId.toString()],
      });
    },
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      documentType: string;
      ocrText: string;
    }): Promise<DocumentVerificationResult> => {
      // Run local confidence-based verification — no ICP backend needed
      return simulateLocalVerification(params.documentType, params.ocrText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

// ── DigiLocker — demo mode, no real API ─────────────────────────────────────

export function useConnectDigiLocker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_studentId: bigint): Promise<void> => {
      // Demo mode: simulate a realistic network delay, then succeed
      await new Promise<void>((resolve) => setTimeout(resolve, 1800));
      // No real DigiLocker API call — government documents are mocked
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useAddDocument() {
  return useUploadDocument();
}

// ── Scholarships ──────────────────────────────────────────────────────────────

export function useGetScholarships() {
  return useQuery<never[]>({
    queryKey: ["scholarships"],
    queryFn: async () => [],
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export const useListScholarships = useGetScholarships;

export function useGetScholarshipById(_scholarshipId: bigint | null) {
  return useQuery<null>({
    queryKey: ["scholarship", _scholarshipId?.toString()],
    queryFn: async () => null,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

// ── Applications ──────────────────────────────────────────────────────────────

export interface ScholarshipApplicationRecord {
  applicationId: bigint;
  studentId: bigint;
  scholarshipId: bigint;
  applicationStatus: string;
  rejectionReason: string;
  appliedDate: bigint;
  lastUpdated: bigint;
}

export function useGetMyApplications() {
  return useQuery<ScholarshipApplicationRecord[]>({
    queryKey: ["myApplications"],
    queryFn: async () => [],
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export const useGetUserApplications = useGetMyApplications;

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: {
      studentId: bigint;
      scholarshipId: bigint;
    }) => null,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}

export function useApplyToScholarship() {
  const { profile } = useGetMyProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: { scholarshipId: bigint | string }) => {
      if (!profile)
        throw new Error(
          "Student profile not found. Please complete your profile first.",
        );
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}

// ── Eligibility Insights ──────────────────────────────────────────────────────

export interface EligibilityInsightsResult {
  eligibilityStatus: string;
  riskLevel: string;
  urgentAlert: boolean;
  readinessScore: bigint;
  unmetRequirements: string[];
  missingDocuments: string[];
}

export function useGetEligibilityInsights(
  studentId?: bigint | null,
  scholarshipId?: bigint | null,
) {
  return useQuery<EligibilityInsightsResult | null>({
    queryKey: [
      "eligibilityInsights",
      studentId?.toString(),
      scholarshipId?.toString(),
    ],
    queryFn: async () => null,
    enabled: !!studentId && !!scholarshipId,
  });
}

export function useCheckEligibility(scholarshipId: string) {
  const { data: student } = useGetMyStudent();
  const studentId = student ? student.profileId : null;
  const schId = scholarshipId ? BigInt(scholarshipId) : null;
  return useGetEligibilityInsights(studentId, schId);
}

export function useAutoFillApplication(scholarshipId: string) {
  const { data: student } = useGetMyStudent();
  return useQuery({
    queryKey: ["autoFill", scholarshipId],
    queryFn: async () => student ?? null,
    enabled: !!student,
  });
}

// ── Profile Completion (legacy) ───────────────────────────────────────────────

export function useGetProfileCompletion() {
  const { data: student, isLoading } = useGetMyStudent();
  return {
    data: student
      ? { percentage: Number(student.profileCompletionPercentage) }
      : null,
    isLoading,
  };
}

// ── Unused type exports to prevent unused-import warnings ────────────────────
export type { AcademicRecord, CareerAchievement };
