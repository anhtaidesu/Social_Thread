import axiosInstance from '../utils/axiosConfig';
import { Post, User } from '../types';

// URL của Social Service API
const SOCIAL_API_URL = process.env.REACT_APP_SOCIAL_API_URL || 'http://localhost:8081';

// Interface for pagination
interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Interface for a create post request
interface CreatePostRequest {
  content?: string;
  mediaUrls?: string[];
  parentId?: string;
  isPublic?: boolean;
  isRepost?: boolean;
  originalPostId?: string;
}

/**
 * Service để gọi các API liên quan đến posts
 */
export const PostService = {
  /**
   * Tạo một bài đăng mới
   */
  createPost: async (postData: CreatePostRequest) => {
    try {
      const response = await axiosInstance.post(
        `${SOCIAL_API_URL}/api/v1/posts`,
        postData
      );

      if (response.data.status === 'success' && response.data.data.post) {
        return {
          success: true,
          data: response.data.data.post,
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể tạo bài đăng'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi tạo bài đăng'
      };
    }
  },

  /**
   * Tạo một bài đăng repost
   */
  createRepost: async (originalPostId: string, content?: string) => {
    try {
      const postData = {
        isRepost: true,
        originalPostId,
        content
      };

      const response = await axiosInstance.post(
        `${SOCIAL_API_URL}/api/v1/posts`,
        postData
      );

      if (response.data.status === 'success' && response.data.data.post) {
        return {
          success: true,
          data: response.data.data.post,
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể tạo bài repost'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi tạo bài repost'
      };
    }
  },

  /**
   * Tạo phản hồi cho một bài đăng
   */
  createReply: async (parentId: string, content: string, mediaUrls?: string[]) => {
    try {
      const postData = {
        parentId,
        content,
        mediaUrls
      };

      const response = await axiosInstance.post(
        `${SOCIAL_API_URL}/api/v1/posts`,
        postData
      );

      if (response.data.status === 'success' && response.data.data.post) {
        return {
          success: true,
          data: response.data.data.post,
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể tạo phản hồi'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi tạo phản hồi'
      };
    }
  },

  /**
   * Lấy thông tin của một bài đăng theo ID
   */
  getPost: async (id: string) => {
    try {
      const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/posts/${id}`);
      
      if (response.data.status === 'success' && response.data.data.post) {
        return {
          success: true,
          data: response.data.data.post,
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể lấy thông tin bài đăng'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi lấy thông tin bài đăng'
      };
    }
  },

  /**
   * Lấy danh sách phản hồi của một bài đăng
   */
  getPostReplies: async (postId: string, page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(
        `${SOCIAL_API_URL}/api/v1/posts/${postId}/replies?page=${page}&limit=${limit}`
      );
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            posts: response.data.data.posts,
            pagination: response.data.data.pagination
          },
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể lấy danh sách phản hồi'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi lấy danh sách phản hồi'
      };
    }
  },

  /**
   * Lấy danh sách bài đăng của một người dùng
   */
  getProfilePosts: async (identifier: string, page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(
        `${SOCIAL_API_URL}/api/v1/posts/profile/${identifier}?page=${page}&limit=${limit}`
      );
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            posts: response.data.data.posts,
            pagination: response.data.data.pagination
          },
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể lấy danh sách bài đăng'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi lấy danh sách bài đăng'
      };
    }
  },

  /**
   * Xóa một bài đăng
   */
  deletePost: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`${SOCIAL_API_URL}/api/v1/posts/${id}`);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: null,
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể xóa bài đăng'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi xóa bài đăng'
      };
    }
  },

  /**
   * Lấy feed của người dùng hiện tại
   */
  getFeed: async (page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(
        `${SOCIAL_API_URL}/api/v1/posts/feed?page=${page}&limit=${limit}`
      );
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            posts: response.data.data.posts,
            pagination: response.data.data.pagination
          },
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể lấy feed'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi lấy feed'
      };
    }
  },

  /**
   * Toggle like/unlike a post
   */
  toggleLike: async (postId: string) => {
    try {
      // Check if post is already liked
      const checkResponse = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/posts/${postId}`);
      
      if (checkResponse.data.status !== 'success' || !checkResponse.data.data.post) {
        return {
          success: false,
          data: null,
          error: 'Không thể kiểm tra trạng thái like của bài đăng'
        };
      }
      
      const isLiked = checkResponse.data.data.post.isLiked;
      let response;
      
      if (isLiked) {
        // Unlike
        response = await axiosInstance.delete(`${SOCIAL_API_URL}/api/v1/likes/${postId}`);
      } else {
        // Like
        response = await axiosInstance.post(`${SOCIAL_API_URL}/api/v1/likes/${postId}`);
      }
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            postId,
            isLiked: !isLiked
          },
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể thực hiện chức năng like/unlike'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi thực hiện chức năng like/unlike'
      };
    }
  }
};

export default PostService; 