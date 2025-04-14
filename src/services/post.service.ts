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
 * Converts a profile ID to a user ID if needed
 * The backend API is inconsistent and requires user ID for posts, not profile ID
 */
const convertToUserId = async (identifier: string): Promise<string> => {
  // Check if this looks like a profile ID (which won't work directly)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUUID = uuidRegex.test(identifier);
  
  // If it's a UUID and starts with 'e0', it might be a profile ID needing conversion
  if (isUUID && identifier.startsWith('e0')) {
    try {
      console.log(`This appears to be a profile ID: ${identifier}, trying to convert to userId`);
      // Try to fetch the profile to get the userId
      const profileResponse = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/by-id/${identifier}`);
      
      if (profileResponse.data.status === 'success' && profileResponse.data.data.profile) {
        const userId = profileResponse.data.data.profile.userId;
        console.log(`Successfully converted profile ID to userId: ${userId}`);
        return userId;
      }
    } catch (error) {
      console.error('Error converting profile ID to userId:', error);
      // If conversion fails, return the original identifier
    }
  }
  
  // If it's not a profile ID or conversion failed, return the original identifier
  return identifier;
};

/**
 * Validates if the current user owns the specified post
 */
const validatePostOwnership = async (postId: string): Promise<boolean> => {
  try {
    // Get the post details
    const postResponse = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/posts/${postId}`);
    if (postResponse.data.status !== 'success' || !postResponse.data.data.post) {
      return false;
    }
    
    // Get current user info
    const userResponse = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/me`);
    if (userResponse.data.status !== 'success' || !userResponse.data.data.profile) {
      return false;
    }
    
    const post = postResponse.data.data.post;
    const currentUser = userResponse.data.data.profile;
    
    // Comprehensive ownership check
    const isOwner = 
      post.profileId === currentUser.id || 
      post.author?.id === currentUser.id || 
      post.profile?.id === currentUser.id || 
      post.author?.userId === currentUser.id || 
      post.profile?.userId === currentUser.id ||
      currentUser.userId === post.author?.userId ||
      currentUser.userId === post.profile?.userId ||
      post.profileId === currentUser.userId ||
      post.author?.username === currentUser.username ||
      post.profile?.username === currentUser.username;
    
    console.log('Ownership validation result:', isOwner, {
      postId,
      postOwner: post.author?.username || post.profile?.username,
      currentUser: currentUser.username
    });
    
    return isOwner;
  } catch (error) {
    console.error('Error validating post ownership:', error);
    return false;
  }
};

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
      console.log(`Calling getProfilePosts API for identifier: ${identifier}, page: ${page}, limit: ${limit}`);
      
      // Make sure we have a valid identifier
      if (!identifier || identifier === 'undefined' || identifier === 'null') {
        console.error('Invalid identifier provided to getProfilePosts:', identifier);
        return {
          success: false,
          data: null,
          error: 'Invalid identifier provided'
        };
      }

      // IMPORTANT FIX: Convert profile ID to user ID if necessary
      // The API expects userId, not profileId
      const correctId = await convertToUserId(identifier);
      if (correctId !== identifier) {
        console.log(`Using converted ID: ${correctId} instead of ${identifier}`);
      }

      // API call with the correct ID
      console.log(`API URL: ${SOCIAL_API_URL}/api/v1/posts/profile/${correctId}?page=${page}&limit=${limit}`);
      
      const response = await axiosInstance.get(
        `${SOCIAL_API_URL}/api/v1/posts/profile/${correctId}?page=${page}&limit=${limit}`
      );
      
      console.log('Profile posts API response:', response.status, response.data);
      
      if (response.data.status === 'success') {
        const posts = response.data.data.posts || [];
        console.log(`Successfully retrieved ${posts.length} posts`);
        
        return {
          success: true,
          data: {
            posts: posts,
            pagination: response.data.data.pagination
          },
          error: null
        };
      }
      
      console.warn('API returned success:false for getProfilePosts:', response.data);
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể lấy danh sách bài đăng'
      };
    } catch (error: any) {
      console.error('Error in getProfilePosts:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      // Fallback attempt if the error was 404
      if (error.response?.status === 404) {
        try {
          console.log('First attempt failed with 404, checking if we can find user ID via profile API');
          
          // Try to get the profile information
          const profileResponse = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/${identifier}`);
          
          if (profileResponse.data.status === 'success' && profileResponse.data.data.profile) {
            const userId = profileResponse.data.data.profile.userId;
            console.log(`Found user ID: ${userId}, retrying post fetch`);
            
            // Retry with the user ID
            const retryResponse = await axiosInstance.get(
              `${SOCIAL_API_URL}/api/v1/posts/profile/${userId}?page=${page}&limit=${limit}`
            );
            
            if (retryResponse.data.status === 'success') {
              const posts = retryResponse.data.data.posts || [];
              console.log(`Successfully retrieved ${posts.length} posts using user ID on second attempt`);
              
              return {
                success: true,
                data: {
                  posts: posts,
                  pagination: retryResponse.data.data.pagination
                },
                error: null
              };
            }
          }
        } catch (retryError) {
          console.error('Error during fallback attempt:', retryError);
        }
      }
      
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
      // Verify ownership before proceeding
      const isOwner = await validatePostOwnership(id);
      if (!isOwner) {
        return {
          success: false,
          data: null,
          error: 'You do not have permission to delete this post'
        };
      }
      
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
   * Cập nhật nội dung hoặc cài đặt riêng tư của một bài đăng
   */
  updatePost: async (data: { id: string; content?: string; isPublic?: boolean; privacy?: 'public' | 'private' | 'followers' }) => {
    try {
      const { id, ...updateData } = data;
      
      // Verify ownership before proceeding
      const isOwner = await validatePostOwnership(id);
      if (!isOwner) {
        return {
          success: false,
          data: null,
          error: 'You do not have permission to update this post'
        };
      }
      
      const response = await axiosInstance.put(
        `${SOCIAL_API_URL}/api/v1/posts/${id}`,
        updateData
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
        error: response.data.message || 'Không thể cập nhật bài đăng'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Lỗi khi cập nhật bài đăng'
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