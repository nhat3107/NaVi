import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://localhost:80",
      "http://localhost:443",
      "https://localhost:443",
      // EC2 IP patterns
      /^http:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?$/,
      /^https:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?$/,
    ],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });
});

export { io, app, server };
