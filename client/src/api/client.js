import axiosLib from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axiosLib.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatic JWT Authorization Header Attachment
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('carwash_admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle expired/invalid token gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const msg = error.response.data?.message || '';
      if (msg.includes('expired') || msg.includes('token') || msg.includes('inactive') || msg.includes('Access Denied') || msg.includes('Account inactive')) {
        localStorage.removeItem('carwash_admin_token');
        localStorage.removeItem('carwash_admin_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
