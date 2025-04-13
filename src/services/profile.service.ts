import axiosInstance from '../utils/axiosConfig';
import { User } from '../types';

// Định nghĩa kiểu dữ liệu trả về
interface ProfileResponse {
  success: boolean;
  data: User | null;
  error: string | null;
}

// URL của Social Service API
const SOCIAL_API_URL = process.env.REACT_APP_SOCIAL_API_URL || 'http://localhost:8081';

/**
 * Service để gọi các API profile
 */
export const ProfileService = {
  /**
   * Lấy thông tin profile theo identifier (có thể là username hoặc ID)
   * Sử dụng route mặc định để tự động phát hiện
   */
  getProfile: async (identifier: string): Promise<ProfileResponse> => {
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
      console.log(`Requesting profile with identifier: ${identifier}`);
      console.log(`Full API URL: ${SOCIAL_API_URL}/api/v1/profiles/${identifier}`);
      
      try {
        const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/${identifier}`);
        console.log('Profile API response status:', response.status, response.statusText);
        console.log('Profile API response data:', JSON.stringify(response.data, null, 2));
        
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
        // Nếu kết nối đến API chính thất bại, thử phương pháp khác
        console.error('Primary profile lookup failed, trying alternative methods:', error);
        
        // Thử phương pháp 1: Tìm theo userId nếu identifier trông giống UUID
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)) {
          console.log('Identifier looks like UUID, trying userId lookup');
          const userIdResult = await ProfileService.getProfileByUserId(identifier);
          if (userIdResult.success) {
            return userIdResult;
          }
        } 
        // Thử phương pháp 2: Tìm theo username
        else {
          console.log('Trying username lookup with:', identifier);
          const usernameResult = await ProfileService.getProfileByUsername(identifier);
          if (usernameResult.success) {
            return usernameResult;
          }
        }
        
        // Trả về lỗi gốc
        console.error('All profile lookup methods failed:', error);
        
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
    } catch (error: any) {
      console.error('Profile service exception:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Lỗi không xác định khi lấy thông tin hồ sơ'
      };
    }
  },

  /**
   * Lấy thông tin profile theo userId (ID từ auth service)
   * Sử dụng route rõ ràng
   */
  getProfileByUserId: async (userId: string): Promise<ProfileResponse> => {
    try {
      if (!userId || userId.trim() === '') {
        return {
          success: false,
          data: null,
          error: 'UserId không được để trống'
        };
      }
      
      console.log(`Requesting profile by userId: ${userId}`);
      
      // Sử dụng endpoint mới, rõ ràng
      const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/by-user-id/${userId}`);
      
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
        error: response.data.message || 'Không thể lấy thông tin hồ sơ theo userId'
      };
    } catch (error: any) {
      console.error('Error getting profile by userId:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Lỗi khi lấy hồ sơ theo userId'
      };
    }
  },

  /**
   * Lấy thông tin profile theo username
   * Sử dụng route rõ ràng
   */
  getProfileByUsername: async (username: string): Promise<ProfileResponse> => {
    try {
      if (!username || username.trim() === '') {
        return {
          success: false,
          data: null,
          error: 'Username không được để trống'
        };
      }
      
      // Xóa @ ở đầu nếu có
      let cleanUsername = username;
      if (username.startsWith('@')) {
        cleanUsername = username.substring(1);
      }
      
      console.log(`Requesting profile by username: ${cleanUsername}`);
      
      // Sử dụng endpoint mới, rõ ràng
      const url = `${SOCIAL_API_URL}/api/v1/profiles/username/${cleanUsername}`;
      console.log(`Making API call to: ${url}`);
      
      const response = await axiosInstance.get(url);
      
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
        error: response.data.message || 'Không thể lấy thông tin hồ sơ theo username'
      };
    } catch (error: any) {
      console.error('Error getting profile by username:', error);
      
      // Provide more specific error messages based on status code
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          return {
            success: false,
            data: null,
            error: `Không tìm thấy hồ sơ với username: ${username}`
          };
        }
      }
      
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Lỗi khi lấy hồ sơ theo username'
      };
    }
  },

  /**
   * Lấy thông tin profile của người dùng hiện tại
   */
  getCurrentProfile: async (): Promise<ProfileResponse> => {
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
      console.log(`Searching profiles with query: "${query}", page: ${page}, limit: ${limit}`);
      const url = `${SOCIAL_API_URL}/api/v1/profiles/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      console.log(`Making API call to: ${url}`);
      
      const response = await axiosInstance.get(url);
      console.log('Search profiles API response:', response.status, response.data);
      
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
      
      console.error('Search profiles error:', response.data);
      return {
        success: false,
        data: null,
        error: response.data.message || 'Không thể tìm kiếm hồ sơ'
      };
    } catch (error: any) {
      console.error('Error searching profiles:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Lỗi khi tìm kiếm hồ sơ'
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
  },

  /**
   * Công cụ kiểm tra API để giúp debug các vấn đề profile
   * Thử tất cả các phương thức để lấy profile và trả về kết quả chi tiết
   */
  testAllProfileMethods: async (identifier: string) => {
    console.log('🔍 PROFILE API TESTING TOOL 🔍');
    console.log(`Testing all methods for identifier: ${identifier}`);
    
    const results = {
      identifier,
      generalMethod: null as any,
      userIdMethod: null as any,
      usernameMethod: null as any,
      summary: '',
      success: false,
      profile: null as User | null
    };
    
    try {
      // Method 1: General profile endpoint
      console.log('Method 1: Testing general profile endpoint...');
      const generalResult = await ProfileService.getProfile(identifier);
      results.generalMethod = {
        success: generalResult.success,
        error: generalResult.error,
        data: generalResult.data ? {
          id: generalResult.data.id,
          username: generalResult.data.username,
          displayName: generalResult.data.displayName
        } : null
      };
      
      if (generalResult.success) {
        results.success = true;
        results.profile = generalResult.data;
      }
      
      // Method 2: By userId endpoint
      console.log('Method 2: Testing by-user-id endpoint...');
      const userIdResult = await ProfileService.getProfileByUserId(identifier);
      results.userIdMethod = {
        success: userIdResult.success,
        error: userIdResult.error,
        data: userIdResult.data ? {
          id: userIdResult.data.id,
          username: userIdResult.data.username,
          displayName: userIdResult.data.displayName
        } : null
      };
      
      if (!results.success && userIdResult.success) {
        results.success = true;
        results.profile = userIdResult.data;
      }
      
      // Method 3: By username endpoint
      console.log('Method 3: Testing username endpoint...');
      const usernameResult = await ProfileService.getProfileByUsername(identifier);
      results.usernameMethod = {
        success: usernameResult.success,
        error: usernameResult.error,
        data: usernameResult.data ? {
          id: usernameResult.data.id,
          username: usernameResult.data.username,
          displayName: usernameResult.data.displayName
        } : null
      };
      
      if (!results.success && usernameResult.success) {
        results.success = true;
        results.profile = usernameResult.data;
      }
      
      // Generate summary
      if (results.success) {
        const method = results.generalMethod.success ? 'general' : 
                      (results.userIdMethod.success ? 'userId' : 'username');
        results.summary = `✅ Profile found using ${method} method. User: ${results.profile?.username} (ID: ${results.profile?.id})`;
      } else {
        results.summary = `❌ Profile not found with any method. Please check if this user exists in the database.`;
      }
      
      return results;
    } catch (error: any) {
      console.error('Error in profile testing tool:', error);
      results.summary = `⚠️ Error occurred during testing: ${error.message}`;
      return results;
    }
  }
};

export default ProfileService; 