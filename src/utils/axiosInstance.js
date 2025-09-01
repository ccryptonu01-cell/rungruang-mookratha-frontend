import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: false,
});

instance.interceptors.request.use((config) => {

  console.log("➡️ URL:", config.url);
  console.log("➡️ Authorization header:", config.headers.Authorization);

  if (/^\/guest\//.test(config.url)) {
    console.log("⛔ ไม่แนบ token เพราะเป็น guest route:", config.url);
    return config;
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;
