import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser as followUserApi, unfollowUser as unfollowUserApi } from "../lib/api";
import { useAuthStore } from "../stores/useAuthStore";
import toast from "react-hot-toast";

const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { user: authUser, setUser } = useAuthStore();

  const followMutation = useMutation({
    mutationFn: followUserApi,
    onSuccess: (data, userId) => {
      // Update authUser in Zustand store
      if (authUser) {
        setUser({
          ...authUser,
          following: [...(authUser.following || []), userId],
        });
      }

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });

      toast.success(data.message || "User followed successfully!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to follow user";
      toast.error(errorMessage);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUserApi,
    onSuccess: (data, userId) => {
      // Update authUser in Zustand store
      if (authUser) {
        setUser({
          ...authUser,
          following: (authUser.following || []).filter((id) => id !== userId),
        });
      }

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });

      toast.success(data.message || "User unfollowed successfully!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to unfollow user";
      toast.error(errorMessage);
    },
  });

  return {
    followUser: followMutation.mutate,
    unfollowUser: unfollowMutation.mutate,
    isFollowing: followMutation.isPending,
    isUnfollowing: unfollowMutation.isPending,
  };
};

export default useFollowUser;

