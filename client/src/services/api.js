import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: false,
});

// Token provider — can be set from anywhere in the app (e.g. a React hook)
let _getToken = null;
export function setTokenProvider(fn) {
  _getToken = fn;
}

api.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') return config;
  try {
    // 1. Use the registered token provider (set by AuthProvider hook)
    if (_getToken) {
      const token = await _getToken();
      if (token) { config.headers.Authorization = `Bearer ${token}`; return config; }
    }
    // 2. Fallback: window.Clerk direct access
    if (window.Clerk?.session) {
      const token = await window.Clerk.session.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export default api;
