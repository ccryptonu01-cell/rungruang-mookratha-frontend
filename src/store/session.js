import axios from '../utils/axiosInstance';

export const checkSession = async (set) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const res = await axios.get('/auth/me');
    const role = String(res.data?.user?.role || 'user').toUpperCase();
    set({ user: { ...res.data.user, role }, token });
  } catch (err) {
    console.error('❌ Session expired or invalid', err);
    set({ user: null, token: null });
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
};
