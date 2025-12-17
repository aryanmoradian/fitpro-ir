// src/api/axiosInstance.js
import axios from "axios";

// ایجاد instance اصلی axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // متغیر محیطی Vercel
  withCredentials: true, // اگر از کوکی یا session استفاده می‌شود
  headers: {
    "Content-Type": "application/json",
  },
});

// نمونه interceptor برای گرفتن خطاها
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;
