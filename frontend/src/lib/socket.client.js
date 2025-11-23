// src/socket.js
import { io } from "socket.io-client";

let socket = null;
let currentUserId = null; // Track current user ID for reconnection
let isMainWindow = true; // Track if this is main window or popup

// Check if this is a popup window
const checkIsPopupWindow = () => {
  return window.opener && !window.opener.closed;
};

// Initialize socket connection
export const initSocket = () => {
  isMainWindow = !checkIsPopupWindow();
  
  if (!socket || !socket.connected) {
    // Close existing socket if it exists but is not connected
    if (socket && !socket.connected) {
      socket.close();
      socket = null;
    }

    socket = io("/", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: isMainWindow ? 10 : 3, // Less reconnection for popup
      timeout: 10000,
    });

    socket.on("connect", () => {
      // Only re-emit user-connected in main window
      if (currentUserId && isMainWindow) {
        socket.emit("user-connected", currentUserId);
      }
    });

    socket.on("disconnect", (reason) => {});

    socket.on("connect_error", (error) => {});

    socket.on("reconnect", (attemptNumber) => {
      // Only re-emit user-connected in main window after reconnect
      if (currentUserId && isMainWindow) {
        socket.emit("user-connected", currentUserId);
      }
    });

    socket.on("reconnect_attempt", (attemptNumber) => {});

    socket.on("reconnect_failed", () => {});
  }
  return socket;
};

// Get existing socket instance
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Connect user with their ID
// skipRegister: true means socket won't emit user-connected (for popup windows)
export const connectUser = (userId, skipRegister = false) => {
  const socket = getSocket();
  if (socket && userId) {
    // Store userId for reconnection (only in main window)
    if (!skipRegister) {
      currentUserId = userId;
    }
    
    // Skip registration if this is a popup window
    if (skipRegister) {
      return;
    }
    
    // Wait for socket to be connected before emitting
    if (socket.connected) {
      socket.emit("user-connected", userId);
    } else {
      // Wait for connection then emit
      socket.once("connect", () => {
        socket.emit("user-connected", userId);
      });
    }
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  // Only clear userId in main window
  if (isMainWindow) {
    currentUserId = null;
  }
};

// Get window type
export const getWindowType = () => {
  return isMainWindow ? "main" : "popup";
};

export { socket };
