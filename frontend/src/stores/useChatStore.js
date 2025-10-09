import { create } from "zustand";

export const useChatStore = create((set) => ({
  currentChatId: null,
  chats: [],
  messages: [],

  setCurrentChat: (id) => set({ currentChatId: id, messages: [] }),
  setChats: (chats) => set({ chats }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages) => set({ messages }),
  updateLastMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id === chatId ? { ...c, lastMessageAt: message.createdAt } : c
      ),
    })),
}));
