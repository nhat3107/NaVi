import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";
import authRoutes from "./routers/auth.route.js";
import oauthRoutes from "./routers/oauth.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173", // Frontend URL
  credentials: true // Cho phép gửi cookies
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/oauth", oauthRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  connectDB();
});

export default app;
