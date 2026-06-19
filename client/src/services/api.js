import axios from 'axios';

// Get the base URL and ensure it ends with '/api' if not already present
let baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

if (baseURL && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
    baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const API = axios.create({
    baseURL: baseURL,
});

// Automatically inject JWT token in the Authorization header if it exists in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;