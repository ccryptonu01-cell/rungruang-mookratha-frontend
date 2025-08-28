import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from '../utils/axiosInstance';

const useEcomStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hasHydrated: false,

      actionLogin: async (formData) => {
        const res = await axios.post('/auth/login', formData);
        const token = res.data.token;
        const role = String(res.data?.payload?.role || '').toUpperCase();

        set({ user: { ...res.data.payload, role }, token });
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return res;
      },

      actionLogout: async () => {
        set({ user: null, token: null });
        delete axios.defaults.headers.common['Authorization'];

        localStorage.removeItem('role');
      },
    }),
    {
      name: 'ecom-store',
      storage: createJSONStorage(() => localStorage),

      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          setTimeout(async () => {
            try {
              const res = await axios.get('/auth/me');
              const user = res.data?.user;
              if (user) {
                const role = String(user.role || '').toUpperCase();
                useEcomStore.setState({ user: { ...user, role } });
              } else {
                useEcomStore.getState().actionLogout();
              }
            } catch (err) {
              console.error('❌ Session invalid', err);
              useEcomStore.getState().actionLogout();
            }
            useEcomStore.setState({ hasHydrated: true });
          }, 0);
        } else {
          useEcomStore.setState({ hasHydrated: true });
        }
      },
    }
  )
);

export default useEcomStore;
