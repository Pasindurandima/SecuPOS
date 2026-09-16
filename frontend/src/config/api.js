import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

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
