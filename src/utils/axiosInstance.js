import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

instance.interceptors.request.use(
  (config) => {
    let token = null;

    try {
      const raw = localStorage.getItem('ecom-store');
      const parsed = JSON.parse(raw);
      token = parsed?.state?.token || null;
    } catch (err) {
      console.error('❌ Failed to parse ecom-store from localStorage:', err);
    }

    if (token && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
