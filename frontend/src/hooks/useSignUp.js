import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signup } from "../lib/api";
import { useAuthStore } from "../stores/useAuthStore";

const useSignUp = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setUser, connectSocket } = useAuthStore();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data, variables) => {
      // Check if OTP verification is required
      if (data.requiresOTPVerification) {
        // Navigate to OTP verification page
        navigate("/verify-otp", {
          state: {
            email: variables.email,
          },
        });
      } else {
        // Old flow - direct login (for backward compatibility)
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        setUser(data.user);
        connectSocket();
        navigate("/onboarding", {
          state: {
            email: variables.email,
          },
        });
      }

      if (onSuccess) onSuccess(data, variables);
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
