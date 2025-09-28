import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BACKEND_URL || "" + "/api";
const BASE_URL = "http://localhost:5000/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});