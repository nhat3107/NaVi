import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../lib/api";

const useUserProfile = (userId) => {
  const query = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: query.data?.user,
    isPrivate: query.data?.isPrivate,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useUserProfile;

