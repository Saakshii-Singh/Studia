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

// Automatically handle token expiration (401 Unauthorized) globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user info on session expiration
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("dev_verification_code");
      window.dispatchEvent(new Event("studia_login_state_change"));
      
      // Force redirect to login screen
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
