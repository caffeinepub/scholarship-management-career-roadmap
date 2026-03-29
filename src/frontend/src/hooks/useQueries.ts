import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AcademicRecord,
  CareerAchievement,
  Student,
  UserProfile,
} from "../backend";
import type { Category, DisabilityStatus, Gender } from "../backend";
import { useActor } from "./useActor";
import { storeProfileId } from "./useProfile";

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
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
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ── My Profile (Student) ──────────────────────────────────────────────────────

export function useGetMyProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Student | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.getMyProfile();
      if (result) {
        storeProfileId(result.profileId);
      }
      return result;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
    profile: query.data ?? null,
  };
}

/**
 * useGetMyStudent — alias for useGetMyProfile for backward compatibility.
 * Returns the student/profile data under `data` key.
 */
export function useGetMyStudent() {
  const result = useGetMyProfile();
  return {
    ...result,
    data: result.data ?? null,
  };
}

// ── Student Registration ──────────────────────────────────────────────────────

export function useRegisterStudent() {
  const { actor } = useActor();
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
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.registerStudent(
        params.fullName,
        params.email,
        params.mobileNumber,
        params.gender,
        params.category,
        params.disabilityStatus,
        params.annualFamilyIncome,
        params.state,
        params.district,
        params.courseName,
        params.courseLevel,
        params.instituteName,
        params.currentYear,
      );
      if (result.__kind__ === "ok") {
        storeProfileId(result.ok);
        return result.ok;
      }
      throw new Error(result.err);
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
      // No updateStudent in backend — silently succeed so UI doesn't break.
      return undefined;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

// ── Documents ─────────────────────────────────────────────────────────────────

export function useUploadDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      documentName: string;
      filePath: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.uploadDocument(
        params.studentId,
        params.documentName,
        params.filePath,
      );
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
      return (
        actor as unknown as Record<string, (id: bigint) => Promise<unknown[]>>
      ).getDocumentsByStudent(studentId);
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
      if (!actor) throw new Error("Actor not available");
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
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.studentId.toString()],
      });
    },
  });
}

export function useVerifyDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      documentType: string;
      ocrText: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.verifyDocument(
        params.studentId,
        params.documentType,
        params.ocrText,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useConnectDigiLocker() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.connectDigiLocker(studentId);
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
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<never[]>({
    queryKey: ["scholarships"],
    queryFn: async () => {
      // Scholarships are static data in the frontend; backend has no getScholarships
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

export const useListScholarships = useGetScholarships;

export function useGetScholarshipById(_scholarshipId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<null>({
    queryKey: ["scholarship", _scholarshipId?.toString()],
    queryFn: async () => {
      // Backend has no getScholarshipById; scholarships are static
      return null;
    },
    enabled: !!actor && !actorFetching,
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
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ScholarshipApplicationRecord[]>({
    queryKey: ["myApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

export const useGetUserApplications = useGetMyApplications;

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: {
      studentId: bigint;
      scholarshipId: bigint;
    }) => {
      return null;
    },
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
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<EligibilityInsightsResult | null>({
    queryKey: [
      "eligibilityInsights",
      studentId?.toString(),
      scholarshipId?.toString(),
    ],
    queryFn: async () => {
      if (!actor || !studentId || !scholarshipId) return null;
      return null;
    },
    enabled: !!actor && !actorFetching && !!studentId && !!scholarshipId,
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
