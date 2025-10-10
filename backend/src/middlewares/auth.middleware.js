import { verifyToken } from "../utils/verifyToken.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("Auth middleware - Cookies received:", req.cookies);
    console.log("Auth middleware - All headers:", req.headers.cookie);

    const token = req.cookies.jwt;
    if (!token) {
      console.log("No JWT token found in cookies");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("JWT token found, verifying...");
    req.user = await verifyToken(token);
    console.log("User verified:", req.user.email);
    next();
  } catch (err) {
    console.log("Auth error:", err.message);
    res.status(401).json({ message: err.message });
  }
};
