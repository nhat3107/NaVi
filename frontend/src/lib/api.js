import { axiosInstance } from "./axios";

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