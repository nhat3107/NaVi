import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signin } from "../lib/api";

const useSignIn = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    const { mutate, isPending, error } = useMutation({
      mutationFn: signin,
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        if (onSuccess) onSuccess(data, variables);
      },
      onError: (error, variables) => {
        // Check if error indicates need for OTP verification
        if (error.response?.data?.requiresOTPVerification) {
          // Navigate to OTP verification page
          navigate('/verify-otp', {
            state: {
              email: variables.email
            }
          });
          return; // Don't call onError callback in this case
        }
        
        if (onError) onError(error, variables);
      }
    });
  
    return { error, isPending, signInMutation: mutate };
  };
  
  export default useSignIn;