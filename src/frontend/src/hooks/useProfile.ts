import { useQuery } from "@tanstack/react-query";
import type { Student } from "../backend";
import { useActor } from "./useActor";

const PROFILE_ID_KEY = "scholarpath_profileId";

export function storeProfileId(profileId: bigint) {
  const id = profileId.toString();
  localStorage.setItem(PROFILE_ID_KEY, id);
  sessionStorage.setItem(PROFILE_ID_KEY, id);
}

export function clearProfileId() {
  localStorage.removeItem(PROFILE_ID_KEY);
  sessionStorage.removeItem(PROFILE_ID_KEY);
}

export function getStoredProfileId(): string | null {
  return (
    localStorage.getItem(PROFILE_ID_KEY) ??
    sessionStorage.getItem(PROFILE_ID_KEY)
  );
}

export function useProfile() {
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
    profile: query.data ?? null,
  };
}
