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
    return { user: null };
  }
};

