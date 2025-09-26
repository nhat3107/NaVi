import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./utils/db.js";
import authRoutes from "./routers/auth.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  connectDB();
});

export default app;
