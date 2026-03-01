import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  MasterUserRecord,
  ScholarshipApplication,
  Scholarship,
  ProfileCompletionResult,
  EligibilityCheckResult,
} from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<MasterUserRecord | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
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
    mutationFn: async (record: MasterUserRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
    },
  });
}

// ─── Profile Completion ───────────────────────────────────────────────────────

export function useGetProfileCompletion() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ProfileCompletionResult>({
    queryKey: ['profileCompletion', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Not available');
      return actor.getProfileCompletion(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// ─── Scholarships ─────────────────────────────────────────────────────────────

export function useListScholarships() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Scholarship[]>({
    queryKey: ['scholarships'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listScholarships();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetScholarship(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Scholarship>({
    queryKey: ['scholarship', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error('Not available');
      return actor.getScholarship(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

// ─── Eligibility ──────────────────────────────────────────────────────────────

export function useCheckEligibility(scholarshipId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<EligibilityCheckResult>({
    queryKey: ['eligibility', scholarshipId?.toString(), identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity || scholarshipId === null) throw new Error('Not available');
      return actor.checkEligibility(scholarshipId, identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity && scholarshipId !== null,
    retry: false,
  });
}

// ─── Auto-fill ────────────────────────────────────────────────────────────────

export function useAutoFillApplication(scholarshipId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<MasterUserRecord | null>({
    queryKey: ['autoFill', scholarshipId?.toString(), identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity || scholarshipId === null) throw new Error('Not available');
      return actor.autoFillApplication(scholarshipId, identity.getPrincipal());
    },
    enabled: false, // Only fetch on demand
    retry: false,
  });
}

// ─── Applications ─────────────────────────────────────────────────────────────

export function useGetUserApplications() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ScholarshipApplication[]>({
    queryKey: ['userApplications', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserApplications(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useApplyToScholarship() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scholarshipId,
      application,
    }: {
      scholarshipId: bigint;
      application: ScholarshipApplication;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyToScholarship(scholarshipId, application);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
    },
  });
}
