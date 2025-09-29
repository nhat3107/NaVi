import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { verifyOTP } from "../lib/api";

const useVerifyOTP = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data, variables) => {
      // Update auth user cache
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Navigate to onboarding after successful OTP verification
      navigate('/onboarding', {
        state: {
          email: variables.email,
          fromOTPVerification: true
        }
      });
      
      if (onSuccess) onSuccess(data, variables);
    },
    onError: (error) => {
      if (onError) onError(error);
    }
  });

  return { 
    isPending, 
    error, 
    verifyOTPMutation: mutate 
  };
};

export default useVerifyOTP;
