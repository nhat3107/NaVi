// store/useAuthStore.js
import { create } from "zustand";
import { socket as socketClient } from "../lib/socket.client";
import { logout as logoutAPI } from "../lib/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  socket: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  connectSocket: () => {
    const socket = socketClient;
    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  logout: async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state and disconnect socket
      set({ user: null, isAuthenticated: false });
      get().disconnectSocket();

      // Force page reload to ensure clean state
      window.location.href = "/signin";
    }
  },
}));
