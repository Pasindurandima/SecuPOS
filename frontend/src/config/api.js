import axios from 'axios';

// Vite exposes only VITE_* variables to browser code. Select the default by build mode.
const defaultApiBaseUrl = import.meta.env.PROD
  ? 'https://secupos-ggdmgdfje4gegghj.centralindia-01.azurewebsites.net/api'
  : 'http://localhost:8080/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Handle specific error codes
      if (error.response.status === 401) {
        // Keep the local session intact so a failed page request does not
        // make the permission-based navigation disappear.
        console.warn('Unauthorized access - Authentication required');
      } else if (error.response.status === 403) {
        console.error('Access forbidden:', error.response.data);
      } else if (error.response.status === 404) {
        console.error('Resource not found:', error.config.url);
      } else if (error.response.status >= 500) {
        console.error('Server error:', error.response.status);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server. Is the backend running?');
    } else {
      // Something else happened
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
