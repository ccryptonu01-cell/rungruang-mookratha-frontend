import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: false,
});

instance.interceptors.request.use((config) => {
  // ✅ 1. ถ้า path ขึ้นต้นด้วย "/guest/" → ห้ามแนบ token
  if (config.url && config.url.startsWith("/guest/")) {
    return config; // ออกทันที ไม่ทำอะไรเพิ่ม
  }

  // ✅ 2. สำหรับ user ที่ login → แนบ token
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;
