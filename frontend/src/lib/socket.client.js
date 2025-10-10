// src/socket.js
import { io } from "socket.io-client";

// Use relative URL - nginx will proxy to backend
export const socket = io("/", {
  path: "/socket.io",
});
