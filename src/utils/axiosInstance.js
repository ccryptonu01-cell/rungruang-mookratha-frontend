import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

instance.interceptors.request.use(
  (config) => {
    // ดึง ecom-store จาก localStorage
    const rawStore = localStorage.getItem('ecom-store');

    let token = null;
    if (rawStore) {
      try {
        const parsedStore = JSON.parse(rawStore);
        const state = JSON.parse(parsedStore.state);
        token = state.token;
      } catch (err) {
        console.error("❌ Error parsing ecom-store:", err);
      }
    }

    console.log("🔑 Extracted token:", token);

    if (token && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
