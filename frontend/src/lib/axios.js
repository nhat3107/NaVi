import axios from "axios";

const rawBase = import.meta.env.VITE_BACKEND_URL || "";
const trimmedBase = rawBase.replace(/\/+$/, "");

// Guard against misconfiguration in production
if (import.meta.env.PROD) {
  if (!trimmedBase || /localhost|127\.0\.0\.1/i.test(trimmedBase)) {
    // eslint-disable-next-line no-console
    console.error(
      "VITE_BACKEND_URL is misconfigured in production. Expected https://api.your-domain, got:",
      rawBase
    );
  }
}

// Helpful default for local development if not provided
const effectiveBase =
  !import.meta.env.PROD && !trimmedBase ? "http://localhost:5000" : trimmedBase;

const BASE_URL = `${effectiveBase}/api`;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
