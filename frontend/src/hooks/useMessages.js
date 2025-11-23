import { useEffect, useCallback } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getMessages } from "../lib/api";
import { getSocket } from "../lib/socket.client";
import { useAuthStore } from "../stores/useAuthStore";

export const useMessages = (chatId) => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
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
      const messages = res?.messages || [];
      return messages;
    },
    getNextPageParam: (lastPage) => {
      // If page has less than 30 messages, no more pages
      if (!lastPage || lastPage.length < 30) return undefined;
      // Return the oldest message's timestamp for next pagination
      // Since messages are returned oldest-to-newest, lastPage[0] is the oldest
      return lastPage[0]?.createdAt;
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const appendMessage = useCallback(
    (msg) => {
      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old || !Array.isArray(old.pages)) return old;
        
        const pages = [...old.pages];
        const lastIdx = pages.length > 0 ? pages.length - 1 : 0;
        const lastPage = Array.isArray(pages[lastIdx]) ? pages[lastIdx] : [];

        const id = msg?._id;
        if (id && lastPage.some((m) => m._id === id)) return old;

        pages[lastIdx] = [...lastPage, msg];
        return { ...old, pages };
      });
    },
    [chatId, queryClient]
  );

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;

    socket.emit("join-room", chatId);

    const handleNewMessage = (msg) => {
      const incomingChatId =
        msg?.chatId?._id || msg?.chatId || msg?.message?.chatId;
      if (String(incomingChatId) !== String(chatId)) return;

      const msgSenderId = msg?.senderId?._id || msg?.senderId;
      const currentUserId = authUser?._id;
      if (msgSenderId && currentUserId && String(msgSenderId) === String(currentUserId)) {
        return;
      }

      const current = queryClient.getQueryData(["messages", chatId]);
      const alreadyExists = current?.pages?.some((page) =>
        page.some((m) => m._id === msg._id)
      );
      if (alreadyExists) return;

      appendMessage(msg);
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.emit("leave-room", chatId);
      socket.off("new-message", handleNewMessage);
    };
  }, [chatId, queryClient, appendMessage, authUser?._id]);

  // IMPORTANT: Reverse pages before flattening to maintain correct chronological order
  // pages[0] contains newest messages, pages[1] contains older messages, etc.
  // Each page internally is ordered oldest-to-newest
  // So we reverse the pages array: [...pages].reverse().flat()
  // This gives us: [oldest page] -> [newer page] -> [newest page]
  // Result: [very old messages...old messages...recent messages...newest messages]
  const flatMessages = [...(data?.pages || [])].reverse().flat();

  return {
    messages: flatMessages,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
