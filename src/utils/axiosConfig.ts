import axios from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_AUTH_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  // Cho phép gửi cookies trong request
  withCredentials: true,
});

// Debug các request và response
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Gửi request đến:', config.url, 'với method:', config.method);
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