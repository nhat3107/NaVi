import {
  getUserByEmail,
  createUser,
  updateUser,
  getUserByUsername,
  searchUsersByUsername,
} from "../services/user.service.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import TempOTP from "../models/TempOTP.js";
import { sendOTPEmail, sendWelcomeEmail } from "../services/email.service.js";

export const signUp = async (req, res) => {
  const { email, password } = req.body; // Lấy dữ liệu từ frontend
  try {
    // Kiểm tra xem email đã tồn tại chưa (trong User hoặc TempOTP)
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Kiểm tra xem có pending OTP nào không
    const existingOTP = await TempOTP.findOne({ email, verified: false });
    if (existingOTP) {
      return res.status(400).json({
        message:
          "Email verification already in progress. Please check your email or request a new OTP. Go login to continue your verification process.",
        requiresOTPVerification: true,
        email: email,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10); // Mã hóa password

    // Tạo OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcryptjs.hash(otp, 10);

    // Lưu OTP và password tạm thời (10 phút expire) - CHƯA tạo user
    await TempOTP.create({
      email,
      otp: hashedOTP,
      passwordHash: hashedPassword, // Store password hash temporarily
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0,
      verified: false,
    });

    // Gửi OTP qua email
    await sendOTPEmail(email, otp);

    // Trả về response yêu cầu verify OTP (User chưa được tạo)
    res.status(201).json({
      success: true,
      message:
        "Please check your email for OTP verification to complete your registration.",
      requiresOTPVerification: true,
      email: email,
    });
  } catch (error) {
    console.log("Error in signUp controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body; // Lấy dữ liệu từ frontend
  try {
    // Kiểm tra xem user đã tồn tại chưa
    const user = await getUserByEmail(email);
    if (!user) {
      // Kiểm tra xem có pending OTP verification không
      const pendingOTP = await TempOTP.findOne({
        email,
        verified: false,
        expiresAt: { $gt: new Date() },
      });

      if (pendingOTP) {
        // Verify password trong TempOTP record
        const isPasswordValid = await bcryptjs.compare(
          password,
          pendingOTP.passwordHash
        );
        if (isPasswordValid) {
          return res.status(400).json({
            message: "Please complete email verification first",
            requiresOTPVerification: true,
            email: email,
          });
        }
      }

      return res.status(400).json({ message: "Invalid password or email" });
    }

    // User tồn tại, verify password
    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password or email" });
    }

    // Tạo JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "None", // prevent CSRF attacks
      secure: true,
    });

    // Trả về user data (không include passwordHash)
    const userResponse = {
      _id: user._id,
      email: user.email,
      username: user.username,
      authMethods: user.authMethods,
      isEmailVerified: user.isEmailVerified,
      isOnBoarded: user.isOnBoarded,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    console.log("Error in signIn controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const completeOnboarding = async (req, res) => {
  const userId = req.user._id;
  const profileData = req.body;
  try {
    const existingUsername = await getUserByUsername(profileData.username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const user = await updateUser(userId, {
      ...profileData,
      isOnBoarded: true,
    });
    // delete user.passwordHash;
    res.status(200).json({ success: true, user: user });
  } catch (error) {
    console.log("Error in completeOnboarding controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Verify OTP và tạo User + JWT token
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Tìm OTP record
    const otpRecord = await TempOTP.findOne({
      email,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // Kiểm tra số lần thử
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify OTP
    const isOTPValid = await bcryptjs.compare(otp, otpRecord.otp);

    if (!isOTPValid) {
      // Tăng attempts count
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP",
        attemptsLeft: 5 - otpRecord.attempts,
      });
    }

    // OTP đúng - Bây giờ mới tạo user
    otpRecord.verified = true;
    await otpRecord.save();

    // Kiểm tra user đã tồn tại chưa (để tránh duplicate)
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Tạo user mới với email đã verified
    const newUser = await createUser({
      email,
      passwordHash: otpRecord.passwordHash, // Lấy password từ TempOTP
      authMethods: ["email"],
      isEmailVerified: true, // Email đã được verify
    });

    // Tạo JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    // Xóa OTP record sau khi tạo user thành công (cleanup)
    await TempOTP.deleteOne({ _id: otpRecord._id });

    // Gửi welcome email (không chờ kết quả)
    sendWelcomeEmail(email).catch((err) =>
      console.log("Warning: Could not send welcome email:", err.message)
    );

    // Trả về user data (không include passwordHash)
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      authMethods: newUser.authMethods,
      isEmailVerified: newUser.isEmailVerified,
      isOnBoarded: newUser.isOnBoarded,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Email verified and account created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.log("Error in verifyOTP controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra xem có pending OTP record không
    const existingOTP = await TempOTP.findOne({ email, verified: false });
    if (!existingOTP) {
      return res.status(400).json({
        message:
          "No pending verification found for this email. Please sign up again.",
      });
    }

    // Kiểm tra user đã được tạo chưa (nếu có nghĩa là đã verified rồi)
    const user = await getUserByEmail(email);
    if (user) {
      return res.status(400).json({
        message: "Email already verified and account created",
      });
    }

    // Kiểm tra rate limiting (không cho resend nếu mới tạo trong 1 phút)
    const timeElapsed = Date.now() - existingOTP.createdAt.getTime();
    if (timeElapsed < 60 * 1000) {
      // 1 minute
      const remainingTime = Math.ceil((60 * 1000 - timeElapsed) / 1000);
      return res.status(400).json({
        message: "Please wait before requesting a new OTP",
        waitTime: remainingTime, // seconds
      });
    }

    // Tạo OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcryptjs.hash(otp, 10);

    // Update existing OTP record với OTP mới
    existingOTP.otp = hashedOTP;
    existingOTP.attempts = 0; // Reset attempts
    existingOTP.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Reset expiry
    existingOTP.createdAt = new Date(); // Update created time for rate limiting
    await existingOTP.save();

    // Gửi OTP qua email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "New OTP sent to your email",
    });
  } catch (error) {
    console.log("Error in resendOTP controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Search users by username
export const searchUsers = async (req, res) => {
  try {
    const { q: searchTerm, limit = 10 } = req.query;
    const currentUserId = req.user._id;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        message: "Search term must be at least 2 characters long",
      });
    }

    const users = await searchUsersByUsername(
      searchTerm.trim(),
      currentUserId,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.log("Error in searchUsers controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
