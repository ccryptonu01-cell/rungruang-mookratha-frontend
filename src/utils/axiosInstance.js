import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: false,
});

instance.interceptors.request.use((config) => {

  console.log("➡️ URL:", config.url);
  console.log("➡️ Authorization header:", config.headers.Authorization);

  const isGuestPath = /\/guest\//.test(config.url);
  if (isGuestPath) {
    console.log("🟨 Guest path ตรวจพบ:", config.url);
    return config; // ไม่แนบ token
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
