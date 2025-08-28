import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
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
