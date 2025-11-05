import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "../stores/useChatStore";
import { sendMessage as sendMessageAPI } from "../lib/api";
import { uploadMedia } from "../lib/api";

export const useSendMessage = (chatId, options = {}) => {
  const addMessage = useChatStore((s) => s.addMessage);

  const queryClient = useQueryClient();

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (payload) => {
      // payload can be string (text) or File (image)
      if (payload instanceof File) {
        // upload to Cloudinary and send as image
        const formData = { file: payload };
        const res = await uploadMedia(formData);
        if (!res?.success || !res?.url) {
          throw new Error(res?.message || "Upload failed");
        }
        return sendMessageAPI(chatId, { type: "image", content: res.url });
      }
      // text message
      const content =
        typeof payload === "string" ? payload : String(payload || "");
      return sendMessageAPI(chatId, { type: "text", content });
    },
    onSuccess: (resp) => {
      const msg = resp?.message || resp?.data || resp;
      if (msg) {
        // Update local store
        addMessage(msg);
        // Update infinite query cache for immediate re-render (preserve shape)
        queryClient.setQueryData(["messages", chatId], (old) => {
          if (
            old &&
            Array.isArray(old.pages) &&
            Array.isArray(old.pageParams)
          ) {
            const pages = [...old.pages];
            const lastIdx = pages.length > 0 ? pages.length - 1 : 0;
            const lastPage = Array.isArray(pages[lastIdx])
              ? pages[lastIdx]
              : [];
            const id = msg?._id;
            if (id && lastPage.some((m) => m?._id === id)) return old; // de-dupe
            const updatedLast = [...lastPage, msg];
            pages[lastIdx] = updatedLast;
            return { ...old, pages };
          }
          return old; // do not mutate if shape is unexpected
        });
      }
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        "Tin nhắn bị chặn bởi hệ thống kiểm duyệt";
      if (typeof options.onError === "function") {
        options.onError(msg);
      }
    },
  });

  return { sendMessage, isPending };
};
