import axios from "axios";

const rawBase = import.meta.env.VITE_BACKEND_URL || "";

const BASE_URL = `${rawBase}/api`;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
