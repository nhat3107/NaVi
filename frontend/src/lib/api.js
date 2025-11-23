import { axiosInstance } from "./axios";
import { cloudinaryAxios } from "./cloudinaryUploader";

// OAuth callback API functions
export const processGoogleCallback = async (code, state) => {
  const response = await axiosInstance.post("/oauth/google/callback", {
    code,
    state,
  });
  return response.data;
};

export const processGithubCallback = async (code, state) => {
  const response = await axiosInstance.post("/oauth/github/callback", {
    code,
    state,
  });
  return response.data;
};
export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const signin = async (signinData) => {
  const response = await axiosInstance.post("/auth/signin", signinData);
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  } catch (error) {
    // Return null if user is not authenticated
    console.log("Error in getAuthUser:", error);
    return { user: null };
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

// OTP Verification functions
export const verifyOTP = async (otpData) => {
  const response = await axiosInstance.post("/auth/verify-otp", otpData);
  return response.data;
};

export const resendOTP = async (email) => {
  const response = await axiosInstance.post("/auth/resend-otp", { email });
  return response.data;
};

// OAuth functions
export const getGoogleAuthUrl = async () => {
  const response = await axiosInstance.get("/oauth/google/url");
  return response.data;
};

export const getGithubAuthUrl = async () => {
  const response = await axiosInstance.get("/oauth/github/url");
  return response.data;
};

export const sendMessage = async (chatId, payload) => {
  // payload can be { type, content } or string
  const body =
    typeof payload === "object" && payload?.content
      ? { chatId, type: payload.type || "text", content: payload.content }
      : { chatId, type: "text", content: String(payload || "") };
  const response = await axiosInstance.post(`/message`, {
    message: body,
  });
  return response.data;
};

export const getMessages = async (chatId, queryParams) => {
  const response = await axiosInstance.get(`/message/${chatId}`, {
    params: queryParams,
  });
  return response.data;
};

export const getChats = async () => {
  const response = await axiosInstance.get("/chat");
  return response.data;
};

// Create or get personal chat
export const createPersonalChat = async (participantIds) => {
  const response = await axiosInstance.post("/chat", {
    participants: participantIds,
    isGroup: false,
  });
  return response.data;
};

// Create group chat
export const createGroupChat = async (groupName, participantIds) => {
  const response = await axiosInstance.post("/chat", {
    participants: participantIds,
    isGroup: true,
    groupName,
  });
  return response.data;
};

// Search users by username
export const searchUsers = async (searchTerm, limit = 10) => {
  const response = await axiosInstance.get("/auth/search", {
    params: { q: searchTerm, limit },
  });
  return response.data;
};

async function signUpload() {
  const response = await axiosInstance.post("/message/sign-upload");
  return response.data;
}

export async function uploadImage(formData) {
  if (!formData || !formData.file) {
    return { success: false, message: "File is required" };
  }

  try {
    // 1️⃣ Gọi API backend để lấy chữ ký upload
    const response = await signUpload();
    const { timestamp, signature, apiKey, cloudName, folder } = response;

    // 2️⃣ Tạo formData gửi trực tiếp tới Cloudinary
    const uploadFormData = new FormData();
    uploadFormData.append("file", formData.file);
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("timestamp", timestamp);
    uploadFormData.append("signature", signature);
    if (folder) uploadFormData.append("folder", folder);

    // 3️⃣ Gửi request lên Cloudinary
    const uploadResponse = await cloudinaryAxios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      uploadFormData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const { secure_url, public_id } = uploadResponse.data;

    return {
      success: true,
      url: secure_url,
      public_id,
    };
  } catch (error) {
    console.error("Upload error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.error?.message || "Upload failed",
    };
  }
}

// Video call API functions
export const getVideoSDKToken = async () => {
  const response = await axiosInstance.get("/videocall/token");
  return response.data;
};

export const createVideoCall = async (participantIds) => {
  const response = await axiosInstance.post("/videocall/create", {
    participantIds,
  });
  return response.data;
};

export const joinVideoCall = async (roomId) => {
  const response = await axiosInstance.post(`/videocall/join/${roomId}`);
  return response.data;
};

export const leaveVideoCall = async (roomId) => {
  const response = await axiosInstance.post(`/videocall/leave/${roomId}`);
  return response.data;
};

export const endVideoCall = async (roomId) => {
  const response = await axiosInstance.post(`/videocall/end/${roomId}`);
  return response.data;
};

export const getVideoCallHistory = async () => {
  const response = await axiosInstance.get("/videocall/history");
  return response.data;
};
