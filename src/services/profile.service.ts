import axiosInstance from '../utils/axiosConfig';
import { User } from '../types';

// URL của Social Service API
const SOCIAL_API_URL = process.env.REACT_APP_SOCIAL_API_URL || 'http://localhost:8081';

/**
 * Service để gọi các API profile
 */
export const ProfileService = {
  /**
   * Lấy thông tin profile theo username hoặc ID
   */
  getProfile: async (identifier: string) => {
    try {
      // Validate the identifier
      if (!identifier || identifier.trim() === '') {
        console.error('Invalid identifier provided to getProfile:', identifier);
        return {
          success: false,
          data: null,
          error: 'Invalid identifier: ID or username cannot be empty'
        };
      }
      
      // Log the request being made
      console.log(`Requesting profile from: ${SOCIAL_API_URL}/api/v1/profiles/${identifier}`);
      
      const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/${identifier}`);
      console.log('Profile API response:', response.status, response.statusText);
      
      if (response.data.status === 'success' && response.data.data.profile) {
        return {
          success: true,
          data: response.data.data.profile,
          error: null
        };
      }
      
      console.error('Profile service error:', response.data);
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể lấy thông tin hồ sơ'
      };
    } catch (error: any) {
      console.error('Profile service exception:', error);
      
      // Provide more specific error messages based on status code
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          return {
            success: false,
            data: null,
            error: `Không tìm thấy hồ sơ với ID hoặc username: ${identifier}`
          };
        } else if (status === 401 || status === 403) {
          return {
            success: false,
            data: null,
            error: 'Bạn không có quyền xem hồ sơ này'
          };
        }
      }
      
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Lỗi khi lấy thông tin hồ sơ'
      };
    }
  },

  /**
   * Lấy thông tin profile của người dùng hiện tại
   */
  getCurrentProfile: async () => {
    try {
      const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/me`);
      if (response.data.status === 'success' && response.data.data.profile) {
        return {
          success: true,
          data: response.data.data.profile,
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể lấy thông tin hồ sơ'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi lấy thông tin hồ sơ'
      };
    }
  },

  /**
   * Cập nhật thông tin profile
   */
  updateProfile: async (userData: Partial<User>) => {
    try {
      const response = await axiosInstance.put(`${SOCIAL_API_URL}/api/v1/profiles`, userData);
      if (response.data.status === 'success' && response.data.data.profile) {
        return {
          success: true,
          data: response.data.data.profile,
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể cập nhật hồ sơ'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi cập nhật hồ sơ'
      };
    }
  },

  /**
   * Tìm kiếm profiles theo query
   */
  searchProfiles: async (query: string, page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(
        `${SOCIAL_API_URL}/api/v1/profiles/search?query=${query}&page=${page}&limit=${limit}`
      );
      if (response.data.status === 'success' && response.data.data.profiles) {
        return {
          success: true,
          data: {
            profiles: response.data.data.profiles,
            pagination: response.data.data.pagination
          },
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể tìm kiếm hồ sơ'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi tìm kiếm hồ sơ'
      };
    }
  },

  /**
   * Lấy danh sách người dùng được đề xuất
   */
  getSuggestedProfiles: async (limit = 5) => {
    try {
      const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/suggested?limit=${limit}`);
      if (response.data.status === 'success' && response.data.data.profiles) {
        return {
          success: true,
          data: response.data.data.profiles,
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể lấy danh sách đề xuất'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi lấy danh sách đề xuất'
      };
    }
  }
};

export default ProfileService; 