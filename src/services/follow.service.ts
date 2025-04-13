import axiosInstance from '../utils/axiosConfig';
import { User } from '../types';

// URL của Social Service API
const SOCIAL_API_URL = process.env.REACT_APP_SOCIAL_API_URL || 'http://localhost:8081';

interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Service để gọi các API liên quan đến follow/unfollow
 */
export const FollowService = {
  /**
   * Theo dõi một người dùng
   */
  followUser: async (userId: string) => {
    try {
      const response = await axiosInstance.post(`${SOCIAL_API_URL}/api/v1/follows/${userId}`);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data.data.follow,
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể theo dõi người dùng'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi theo dõi người dùng'
      };
    }
  },

  /**
   * Bỏ theo dõi một người dùng
   */
  unfollowUser: async (userId: string) => {
    try {
      const response = await axiosInstance.delete(`${SOCIAL_API_URL}/api/v1/follows/${userId}`);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: true,
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể bỏ theo dõi người dùng'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi bỏ theo dõi người dùng'
      };
    }
  },

  /**
   * Lấy danh sách người đang theo dõi người dùng
   */
  getFollowers: async (userId: string, page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(
        `${SOCIAL_API_URL}/api/v1/follows/followers/${userId}?page=${page}&limit=${limit}`
      );
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            followers: response.data.data.followers,
            pagination: response.data.data.pagination
          },
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể lấy danh sách người theo dõi'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi lấy danh sách người theo dõi'
      };
    }
  },

  /**
   * Lấy danh sách người mà người dùng đang theo dõi
   */
  getFollowing: async (userId: string, page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(
        `${SOCIAL_API_URL}/api/v1/follows/following/${userId}?page=${page}&limit=${limit}`
      );
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            following: response.data.data.following,
            pagination: response.data.data.pagination
          },
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể lấy danh sách đang theo dõi'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi lấy danh sách đang theo dõi'
      };
    }
  }
};

export default FollowService; 