import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

instance.interceptors.request.use(
  (config) => {
    try {
      const rawStore = localStorage.getItem('ecom-store');
      const parsedStore = rawStore ? JSON.parse(rawStore) : null;
      const token = parsedStore?.state?.token;

      if (token && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    } catch (err) {
      console.error("⚠️ Failed to parse ecom-store from localStorage", err);
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
