import axios from "axios";

// Use relative URL - nginx will proxy to backend
const BASE_URL = "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
