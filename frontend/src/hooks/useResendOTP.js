import { useMutation } from "@tanstack/react-query";
import { resendOTP } from "../lib/api";

const useResendOTP = (onSuccess, onError) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: resendOTP,
    onSuccess: (data, variables) => {
      if (onSuccess) onSuccess(data, variables);
    },
    onError: (error) => {
      if (onError) onError(error);
    }
  });

  return { 
    isPending, 
    error, 
    resendOTPMutation: mutate 
  };
};

export default useResendOTP;
