import axios from "axios";

const base = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
const BASE_URL = `${base}/api`;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
