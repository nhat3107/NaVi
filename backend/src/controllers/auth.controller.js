import { getUserByEmail, createUser, updateUser, getUserByUsername} from "../services/user.service.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const signUp = async (req, res) => {
  const {email, password} = req.body; // Lấy dữ liệu từ frontend
  try {
    const user = await getUserByEmail(email); // Kiểm tra xem email đã tồn tại chưa
    if(user) {
      return res.status(400).json({message: "Email already exists"});
    }
    const hashedPassword = await bcryptjs.hash(password, 10); // Mã hóa password
    const newUser = await createUser({email, passwordHash: hashedPassword});
    
    const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d"
    });
  
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "None", // prevent CSRF attacks
      secure: true,
    });

    // Xóa passwordHash khỏi user data ( chỉ trả về những field cần thiết)
    delete newUser.passwordHash;
    // Trả về user data
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signUp controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const signIn = async (req, res) => {
  const {email, password} = req.body; // Lấy dữ liệu từ frontend
  try {
    const user = await getUserByEmail(email);
    if(!user) {
      return res.status(400).json({message: "User not found"});
    }
    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
    if(!isPasswordValid) {
      return res.status(400).json({message: "Invalid password or email"});
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d"
    });
  
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "None", // prevent CSRF attacks
      secure: true,
    });

    // Xóa passwordHash khỏi user data (trả về những field cần thiết)
    delete user.passwordHash;
    // Trả về user data
    res.status(200).json({success: true, user: user}); // Trả về user data
  } catch (error) {
    console.log("Error in signIn controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const completeOnboarding = async (req, res) => {
  const userId = req.user._id;
  const profileData = req.body;
  try {
    const existingUsername = await getUserByUsername(profileData.username);
    if(existingUsername) {
      return res.status(400).json({message: "Username already taken"});
    }
    const user = await updateUser(userId,{ 
      ...profileData,
      isOnBoarded: true,
    });
    delete user.passwordHash;
    res.status(200).json({success: true, user: user});
  } catch (error) { 
    console.log("Error in completeOnboarding controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}