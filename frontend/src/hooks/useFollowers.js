import { useQuery } from "@tanstack/react-query";
import { getFollowers, getFollowing } from "../lib/api";

export const useFollowers = (userId, limit = 20) => {
  const query = useQuery({
    queryKey: ["followers", userId, limit],
    queryFn: () => getFollowers(userId, limit),
    enabled: !!userId,
  });

  return {
    followers: query.data?.followers || [],
    count: query.data?.count || 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useFollowing = (userId, limit = 20) => {
  const query = useQuery({
    queryKey: ["following", userId, limit],
    queryFn: () => getFollowing(userId, limit),
    enabled: !!userId,
  });

  return {
    following: query.data?.following || [],
    count: query.data?.count || 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

