import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signin } from "../lib/api";

const useSignIn = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    const { mutate, isPending, error } = useMutation({
      mutationFn: signin,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        if (onSuccess) onSuccess(data);
      },
      onError: (error) => {
        if (onError) onError(error);
      }
    });
  
    return { error, isPending, signInMutation: mutate };
  };
  
  export default useSignIn;