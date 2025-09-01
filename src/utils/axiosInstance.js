import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: false,
});

instance.interceptors.request.use((config) => {

  // ✅ 1. ไม่แนบ token สำหรับ path guest, g-menu, g-category
  const guestSafePaths = [/\/guest\//, /\/g-menu/, /\/g-category/];
  const isGuestPath = guestSafePaths.some((regex) => regex.test(config.url));

  if (isGuestPath) {
    return config; // ✅ ไม่แนบ token
  }

  // ✅ 2. แนบ token สำหรับ user ที่ login
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;
