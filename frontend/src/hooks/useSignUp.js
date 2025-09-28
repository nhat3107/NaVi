import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signup } from "../lib/api";

const useSignUp = (onSuccess, onError) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      // Navigate to onboarding after successful signup
      navigate('/onboarding', {
        state: {
          email: variables.email
        }
      });
      if (onSuccess) onSuccess(data, variables);
    },
    onError: (error) => {
      if (onError) onError(error);
    }
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;