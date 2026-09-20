import axios from 'axios';

// In local dev, leave VITE_API_URL unset — Vite's dev proxy forwards
// /user and /candidate straight to the Express backend (see vite.config.js).
// Once hosted (Vercel/Netlify), set VITE_API_URL to your deployed backend's
// URL, e.g. https://voting-backend.onrender.com
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('bv_token');
      localStorage.removeItem('bv_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;