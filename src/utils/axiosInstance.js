import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

const savedToken = localStorage.getItem('token');
if (savedToken) {
  instance.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
