import axios from '../utils/axiosInstance';

export const currentUser = () => axios.get('/auth/current-user');
export const currentAdmin = () => axios.get('/auth/current-admin');
export const currentCashier = () => axios.get('/auth/current-cashier');
