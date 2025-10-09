import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";
import { useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";

const useAuthUser = () => {
  const { setUser } = useAuthStore();
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // auth check
  });

  useEffect(() => {
    if (authUser.data?.user) {
      setUser(authUser.data.user);
    }
  }, [authUser.data?.user]);

  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};
export default useAuthUser;
