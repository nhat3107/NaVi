import { useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getMessages } from "../lib/api";
import { useChatStore } from "../stores/useChatStore";
import { socket as socketClient } from "../lib/socket.client";

export const useMessages = (chatId) => {
  const { setMessages, addMessage } = useChatStore();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["messages", chatId],
    enabled: !!chatId,
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      const res = await getMessages(
        chatId,
        pageParam ? { before: pageParam, limit: 30 } : { limit: 30 }
      );
      const list = Array.isArray(res) ? res : res?.messages || [];
      return list;
    },
    getNextPageParam: (lastPage) => {
      if (!Array.isArray(lastPage) || lastPage.length < 30) return undefined;
      const oldest = lastPage[0];
      return oldest?.createdAt || oldest?.timestamp;
    },
    onSuccess: (resp) => {
      const flat = (resp?.pages || []).flat();
      setMessages(flat);
    },
  });

  useEffect(() => {
    const socket = socketClient;
    if (!socket || !chatId) return;

    socket.emit("join-room", chatId);

    socket.on("new-message", (msg) => {
      const incomingChatId =
        msg?.chatId?._id || msg?.chatId || msg?.message?.chatId;
      if (!incomingChatId || String(incomingChatId) !== String(chatId)) return;

      const incomingId = msg?._id || msg?.message?._id;
      let alreadyExists = false;
      queryClient.setQueryData(["messages", chatId], (old) => {
        // Support infinite query shape { pages: [...], pageParams: [...] }
        if (old && Array.isArray(old.pages) && Array.isArray(old.pageParams)) {
          const pages = [...old.pages];
          const lastIdx = pages.length > 0 ? pages.length - 1 : 0;
          const lastPage = Array.isArray(pages[lastIdx]) ? pages[lastIdx] : [];
          if (
            incomingId &&
            lastPage.some((m) => (m?._id || m?.message?._id) === incomingId)
          ) {
            alreadyExists = true;
            return old;
          }
          const updatedLast = [...lastPage, msg];
          pages[lastIdx] = updatedLast;
          return { ...old, pages };
        }
        // Fallback: append to flat list
        const list = Array.isArray(old) ? old : old?.messages || [];
        if (
          incomingId &&
          list.some((m) => (m?._id || m?.message?._id) === incomingId)
        ) {
          alreadyExists = true;
          return old;
        }
        return [...list, msg];
      });

      if (!alreadyExists) {
        addMessage(msg);
      }
    });

    return () => {
      socket.emit("leave-room", chatId);
      socket.off("new-message");
    };
  }, [chatId]);

  const flat = (data?.pages || []).flat();
  return {
    messages: flat,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
