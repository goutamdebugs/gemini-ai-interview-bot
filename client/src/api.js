import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Show error toast
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    // Redirect to login on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => API.post('/api/auth/register', userData),
  login: (credentials) => API.post('/api/auth/login', credentials),
};

// Chat API
export const chatAPI = {
  sendMessage: (messageData) => API.post('/api/chat/message', messageData),
  getHistory: (sessionId) => API.get(`/api/chat/history/${sessionId}`),
};

export default API;