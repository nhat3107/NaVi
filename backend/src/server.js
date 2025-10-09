import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

import { app, server } from "./lib/socket.js";

import connectDB from "./lib/db.js";
import authRoutes from "./routers/auth.route.js";
import oauthRoutes from "./routers/oauth.route.js";
import chatRoutes from "./routers/chat.route.js";
import messageRoutes from "./routers/message.route.js";

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Frontend URL
    credentials: true, // Cho phép gửi cookies
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  connectDB();
});

export default server;
