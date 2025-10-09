// src/socket.js
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

export const socket = io(BASE_URL);
