import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signin } from "../lib/api";

const useSignIn = () => {
    const queryClient = useQueryClient();
    const { mutate, isPending, error } = useMutation({
      mutationFn: signin,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    });
  
    return { error, isPending, signInMutation: mutate };
  };
  
  export default useSignIn;