import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const signin = async (signinData) => {
  const response = await axiosInstance.post("/auth/signin", signinData);
  return response.data;
};

