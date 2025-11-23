import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage as sendMessageAPI, uploadImage } from "../lib/api";

export const useSendMessage = (chatId, options = {}) => {
  const queryClient = useQueryClient();

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (payload) => {
      if (payload instanceof File) {
        const res = await uploadImage({ file: payload });
        if (!res?.success || !res?.url) {
          throw new Error(res?.message || "Image upload failed");
        }
        return sendMessageAPI(chatId, { type: "image", content: res.url });
      }

      const content =
        typeof payload === "string" ? payload : String(payload || "");
      return sendMessageAPI(chatId, { type: "text", content });
    },

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["messages", chatId] });
      const fakeId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: fakeId,
        chatId,
        senderId: "me",
        type: payload instanceof File ? "image" : "text",
        content:
          payload instanceof File
            ? URL.createObjectURL(payload)
            : String(payload || ""),
        createdAt: new Date().toISOString(),
        optimistic: true,
      };

      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old?.pages) return old;
        const pages = [...old.pages];
        const lastIdx = pages.length > 0 ? pages.length - 1 : 0;
        const lastPage = Array.isArray(pages[lastIdx]) ? pages[lastIdx] : [];
        pages[lastIdx] = [...lastPage, optimisticMessage];
        return { ...old, pages };
      });

      return { fakeId, payload };
    },

    onSuccess: (resp, _payload, context) => {
      const msg = resp?.message || resp?.data || resp;
      if (!msg) return;

      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old?.pages) return old;
        const pages = old.pages.map((page) =>
          page.map((m) => (m._id === context.fakeId ? msg : m))
        );
        return { ...old, pages };
      });

      if (context?.payload instanceof File) {
        URL.revokeObjectURL(context.payload.previewUrl || "");
      }
    },

    onError: (err) => {
      const msg =
        err?.response?.data?.message || "Message blocked or sent failed";
      options?.onError?.(msg);
    },

    onSettled: () => {},
  });

  return { sendMessage, isPending };
};
