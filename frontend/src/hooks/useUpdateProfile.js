import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../lib/api";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update auth user in cache
      queryClient.setQueryData(["authUser"], { user: data.user });
      
      // Update Zustand store
      setUser(data.user);
      
      // Invalidate all profile-related queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      toast.success(data.message || "Profile updated successfully!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    },
  });

  return {
    updateProfile: mutation.mutate,
    updateProfileAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};

export default useUpdateProfile;

