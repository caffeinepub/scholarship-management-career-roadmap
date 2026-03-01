import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  DocumentType,
  type Student,
  type DocumentRecord,
  type Scholarship,
  type ScholarshipApplication,
  type EligibilityCheckResult,
} from '../backend';

// ── Student hooks ──────────────────────────────────────────────────────────

export function useGetMyStudent() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Student | null>({
    queryKey: ['myStudent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyStudent();
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

/**
 * useRegisterStudent — calls the backend registerStudent method with 6 fields.
 * Returns the newly created student ID (bigint).
 */
export function useRegisterStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      fullName: string;
      email: string;
      mobile: string;
      course: string;
      category: string;
      income: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerStudent(
        params.fullName,
        params.email,
        params.mobile,
        params.course,
        params.category,
        params.income,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStudent'] });
    },
  });
}

/**
 * useCreateStudent — backward-compatible alias that maps the old full-param
 * shape to the new registerStudent backend call.
 */
export function useCreateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      fullName: string;
      email: string;
      mobileNumber: string;
      annualFamilyIncome: string;
      courseName: string;
      category: string;
      [key: string]: unknown;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerStudent(
        params.fullName,
        params.email,
        params.mobileNumber,
        params.courseName,
        params.category,
        params.annualFamilyIncome,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStudent'] });
    },
  });
}

/**
 * useUpdateStudent — the new backend does not expose an updateStudent method.
 * This stub is kept for backward compatibility with ResumeBuilder; it is a no-op
 * that resolves immediately so existing callers don't break.
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: Record<string, unknown>) => {
      // No updateStudent in backend — silently succeed so UI doesn't break.
      return undefined;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStudent'] });
      queryClient.invalidateQueries({ queryKey: ['eligibilityInsights'] });
    },
  });
}

// ── Document hooks ─────────────────────────────────────────────────────────

export function useGetDocumentsByStudent(studentId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DocumentRecord[]>({
    queryKey: ['documents', studentId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null) return [];
      return actor.getDocumentsByStudent(studentId);
    },
    enabled: !!actor && !actorFetching && studentId !== null,
  });
}

/**
 * useUploadDocument — calls the backend uploadDocument method.
 * Accepts studentId (bigint), documentName, and filePath (filename or base64).
 */
export function useUploadDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      documentName: string;
      filePath: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadDocument(params.studentId, params.documentName, params.filePath);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.studentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['eligibilityInsights'] });
    },
  });
}

/**
 * useAddDocument — backward-compatible wrapper around uploadDocument.
 * Maps the old addDocument param shape to the new uploadDocument call.
 */
export function useAddDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      documentName: string;
      documentType: DocumentType;
      uploadStatus: boolean;
      fileUrl: string;
      remarks: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadDocument(params.studentId, params.documentName, params.fileUrl);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.studentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['eligibilityInsights'] });
    },
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
      if (!actor) throw new Error('Actor not available');
      return actor.updateDocumentUploadStatus(params.documentId, params.uploadStatus, params.fileUrl);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.studentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['eligibilityInsights'] });
    },
  });
}

// ── Scholarship hooks ──────────────────────────────────────────────────────

export function useGetScholarships() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Scholarship[]>({
    queryKey: ['scholarships'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getScholarships();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for backward compatibility
export const useListScholarships = useGetScholarships;

export function useGetScholarshipById(scholarshipId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Scholarship | null>({
    queryKey: ['scholarship', scholarshipId?.toString()],
    queryFn: async () => {
      if (!actor || scholarshipId === null) return null;
      return actor.getScholarshipById(scholarshipId);
    },
    enabled: !!actor && !actorFetching && scholarshipId !== null,
  });
}

// ── Application hooks ──────────────────────────────────────────────────────

export function useGetMyApplications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ScholarshipApplication[]>({
    queryKey: ['myApplications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyApplications();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for backward compatibility
export const useGetUserApplications = useGetMyApplications;

export function useCreateApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { studentId: bigint; scholarshipId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createApplication(params.studentId, params.scholarshipId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
  });
}

// ── Eligibility Insights hooks ─────────────────────────────────────────────

export function useGetEligibilityInsights(studentId: bigint | null, scholarshipId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<EligibilityCheckResult | null>({
    queryKey: ['eligibilityInsights', studentId?.toString(), scholarshipId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null || scholarshipId === null) return null;
      return actor.getEligibilityInsights(studentId, scholarshipId);
    },
    enabled: !!actor && !actorFetching && studentId !== null && scholarshipId !== null,
  });
}

// ── User Profile hooks ─────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
    mutationFn: async (profile: { name: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Legacy compatibility hooks ─────────────────────────────────────────────

export function useGetProfileCompletion() {
  const { data: student, isLoading } = useGetMyStudent();
  return {
    data: student ? { percentage: Number(student.profileCompletionPercentage) } : null,
    isLoading,
  };
}

export function useCheckEligibility(scholarshipId: string) {
  const { data: student } = useGetMyStudent();
  const studentId = student ? student.studentId : null;
  const schId = scholarshipId ? BigInt(scholarshipId) : null;

  return useGetEligibilityInsights(studentId, schId);
}

export function useAutoFillApplication(scholarshipId: string) {
  const { data: student } = useGetMyStudent();
  return useQuery({
    queryKey: ['autoFill', scholarshipId],
    queryFn: async () => student ?? null,
    enabled: !!student,
  });
}

export function useApplyToScholarship() {
  const { data: student } = useGetMyStudent();
  const createApplication = useCreateApplication();

  return useMutation({
    mutationFn: async (params: { scholarshipId: string; application?: unknown }) => {
      if (!student) throw new Error('Student profile not found. Please complete your profile first.');
      return createApplication.mutateAsync({
        studentId: student.studentId,
        scholarshipId: BigInt(params.scholarshipId),
      });
    },
  });
}
