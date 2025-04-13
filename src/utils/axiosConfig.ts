import axios from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';

// API URLs
const AUTH_API_URL = process.env.REACT_APP_AUTH_API_URL || 'http://localhost:8080';
const SOCIAL_API_URL = process.env.REACT_APP_SOCIAL_API_URL || 'http://localhost:8081';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Cho phép gửi cookies trong request
  withCredentials: true,
});

// Debug các request và response
axiosInstance.interceptors.request.use(
  (config) => {
    // Route-based API selection
    if (config.url?.startsWith('/api/v1/posts') || 
        config.url?.startsWith('/api/v1/profiles') ||
        config.url?.startsWith('/api/v1/follows') ||
        config.url?.startsWith('/api/v1/comments')) {
      // Social service endpoints
      config.baseURL = SOCIAL_API_URL;
      console.log('Using SOCIAL API:', SOCIAL_API_URL);
    } else {
      // Auth service endpoints
      config.baseURL = AUTH_API_URL;
      console.log('Using AUTH API:', AUTH_API_URL);
    }

    console.log('Gửi request đến:', config.baseURL + config.url, 'với method:', config.method);
    if (config.data) {
      console.log('Dữ liệu gửi đi:', JSON.stringify(config.data));
    }
    const token = localStorage.getItem('token');
    console.log('Token hiện tại:', token ? `${token.substring(0, 15)}...` : 'Không có token');
    
    if (token) {
      console.log('Đã thêm token vào request');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Không có token để xác thực request!');
    }
    
    // Log full request headers
    console.log('Request headers:', JSON.stringify(config.headers));
    return config;
  },
  (error) => {
    console.error('Lỗi khi gửi request:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Nhận phản hồi từ:', response.config.url, 'với status:', response.status);
    return response;
  },
  async (error) => {
    console.error('Lỗi khi nhận phản hồi:', error.response?.status, error.response?.data);
    
    const originalRequest = error.config;
    
    // If error is 401 and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Nhận lỗi 401, tự động đăng xuất');
        // Could implement token refresh here
        // For now, just logout the user if token is invalid
        store.dispatch(logout());
        // Redirect to login page handled by the MainLayout component
        return Promise.reject(error);
      } catch (refreshError) {
        // If refresh fails, logout
        console.error('Lỗi khi xử lý token hết hạn:', refreshError);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 