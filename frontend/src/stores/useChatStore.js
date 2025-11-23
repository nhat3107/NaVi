import { create } from "zustand";

export const useChatStore = create((set) => ({
  currentChatId: null,
  chats: [],

  setCurrentChat: (id) => set({ currentChatId: id }),
  setChats: (chats) => set({ chats }),
  updateLastMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id === chatId ? { ...c, lastMessageAt: message.createdAt } : c
      ),
    })),
}));
