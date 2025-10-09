import { useQuery } from "@tanstack/react-query";
import { getChats } from "../lib/api";

export const useChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await getChats();
      return res.chats || [];
    },
  });
};
