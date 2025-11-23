import { axiosInstance } from "./axios";

// Note: axiosInstance already has baseURL="/api", so we only need the path after /api
const API_BASE_URL = "/videocall";

// Lấy token VideoSDK từ backend
export const getVideoSDKToken = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/token`);
    return response.data.token;
  } catch (error) {
    console.error("Error getting VideoSDK token:", error);
    throw error;
  }
};

// Tạo phòng mới
export const createVideoRoom = async (participantIds = []) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/create`, {
      participantIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating video room:", error);
    throw error;
  }
};

// Join phòng hiện có
export const joinVideoRoom = async (roomId) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/join/${roomId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error joining video room:", error);
    throw error;
  }
};

// Rời khỏi phòng
export const leaveVideoRoom = async (roomId) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/leave/${roomId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error leaving video room:", error);
    throw error;
  }
};

// Kết thúc cuộc gọi
export const endVideoCall = async (roomId) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/end/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Error ending video call:", error);
    throw error;
  }
};

// Lấy lịch sử cuộc gọi
export const getCallHistory = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/history`);
    return response.data;
  } catch (error) {
    console.error("Error getting call history:", error);
    throw error;
  }
};

