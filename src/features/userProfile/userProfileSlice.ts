import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types';
import { ProfileService } from '../../services/profile.service';
import { FollowService } from '../../services/follow.service';
import profileHelper, { 
  normalizeUserProfile, 
  incrementFollowerCount, 
  decrementFollowerCount 
} from '../../utils/profileHelper';

interface PaginationState {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface UserProfileState {
  profile: User | null;
  followers: User[];
  followersPagination: PaginationState;
  following: User[];
  followingPagination: PaginationState;
  suggestedUsers: User[];
  searchResults: {
    profiles: User[];
    pagination: PaginationState;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: UserProfileState = {
  profile: null,
  followers: [],
  followersPagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  },
  following: [],
  followingPagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  },
  suggestedUsers: [],
  searchResults: {
    profiles: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      pages: 0
    }
  },
  isLoading: false,
  error: null,
};

// Fetch user profile by ID or username
export const fetchUserProfile = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>('userProfile/fetchUserProfile', async (identifier, { rejectWithValue }) => {
  try {
    console.log(`Fetching profile for identifier: ${identifier}`);
    
    const result = await ProfileService.getProfile(identifier);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return rejectWithValue(result.error || 'Failed to fetch profile');
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return rejectWithValue(error.message || 'Failed to fetch user profile');
  }
});

// Fetch user profile by userId
export const fetchUserProfileByUserId = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>('userProfile/fetchUserProfileByUserId', async (userId, { rejectWithValue, dispatch }) => {
  try {
    console.log(`Fetching profile for userId: ${userId}`);
    
    // Thử phương thức 1: Tìm theo userId trực tiếp
    const result = await ProfileService.getProfileByUserId(userId);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    console.log(`Profile not found by user ID ${userId}, trying alternative methods...`);
    
    // Thử phương thức 2: Tìm theo identifier thông thường
    console.log(`Trying to fetch with general identifier: ${userId}`);
    const generalResult = await ProfileService.getProfile(userId);
    
    if (generalResult.success && generalResult.data) {
      console.log(`Successfully found profile using general identifier method`);
      return generalResult.data;
    }
    
    // Nếu ID trông giống username (không phải UUID), thử tìm theo username
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      console.log(`UserId does not look like UUID, trying username lookup for: ${userId}`);
      const usernameResult = await ProfileService.getProfileByUsername(userId);
      
      if (usernameResult.success && usernameResult.data) {
        console.log(`Successfully found profile by username: ${userId}`);
        return usernameResult.data;
      }
    }
    
    // Tất cả các phương thức đều thất bại
    console.error('All profile lookup methods failed for:', userId);
    return rejectWithValue(result.error || 'Failed to fetch profile by userId');
  } catch (error: any) {
    console.error('Error fetching profile by userId:', error);
    return rejectWithValue(error.message || 'Failed to fetch user profile by userId');
  }
});

// Fetch user profile by username
export const fetchUserProfileByUsername = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>('userProfile/fetchUserProfileByUsername', async (username, { rejectWithValue }) => {
  try {
    console.log(`Fetching profile for username: ${username}`);
    
    // Đảm bảo username không có @ ở đầu
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    console.log(`Clean username: ${cleanUsername}`);
    
    // Sử dụng API endpoint mới, rõ ràng
    const result = await ProfileService.getProfileByUsername(cleanUsername);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    console.error('Failed to fetch profile by username:', result.error);
    return rejectWithValue(result.error || 'Failed to fetch profile by username');
  } catch (error: any) {
    console.error('Error fetching profile by username:', error);
    return rejectWithValue(error.message || 'Failed to fetch user profile by username');
  }
});

// Fetch current user profile
export const fetchCurrentUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('userProfile/fetchCurrentUserProfile', async (_, { rejectWithValue }) => {
  try {
    const result = await ProfileService.getCurrentProfile();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return rejectWithValue(result.error || 'Failed to fetch profile');
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch user profile');
  }
});

// Update user profile
export const updateUserProfile = createAsyncThunk<
  User,
  Partial<User>,
  { rejectValue: string }
>('userProfile/updateUserProfile', async (userData, { rejectWithValue }) => {
  try {
    const result = await ProfileService.updateProfile(userData);
    
    if (result.success) {
      return result.data;
    }
    
    return rejectWithValue(result.error || 'Failed to update profile');
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update user profile');
  }
});

// Follow a user
export const followUser = createAsyncThunk<
  { success: boolean; followingId: string },
  string,
  { rejectValue: string }
>('userProfile/followUser', async (targetId, { rejectWithValue }) => {
  try {
    const result = await FollowService.followUser(targetId);
    
    if (result.success) {
      return { success: true, followingId: targetId };
    }
    
    return rejectWithValue(result.error || 'Failed to follow user');
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to follow user');
  }
});

// Unfollow a user
export const unfollowUser = createAsyncThunk<
  { success: boolean; followingId: string },
  string,
  { rejectValue: string }
>('userProfile/unfollowUser', async (targetId, { rejectWithValue }) => {
  try {
    const result = await FollowService.unfollowUser(targetId);
    
    if (result.success) {
      return { success: true, followingId: targetId };
    }
    
    return rejectWithValue(result.error || 'Failed to unfollow user');
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to unfollow user');
  }
});

// Fetch user followers
export const fetchUserFollowers = createAsyncThunk<
  { users: User[], pagination: PaginationState },
  { identifier: string, page?: number, limit?: number },
  { rejectValue: string }
>('userProfile/fetchUserFollowers', async (params, { rejectWithValue }) => {
  const { identifier, page = 1, limit = 20 } = params;
  
  try {
    const result = await FollowService.getFollowers(identifier, page, limit);
    
    if (!result.success || !result.data) {
      return rejectWithValue(result.error || 'Failed to fetch followers');
    }
    
    // Safely access data with null check
    return {
      users: result.data.followers || [],
      pagination: result.data.pagination || {
        total: 0,
        page: page,
        limit: limit,
        pages: 0
      }
    };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch followers');
  }
});

// Fetch user following
export const fetchUserFollowing = createAsyncThunk<
  { users: User[], pagination: PaginationState },
  { identifier: string, page?: number, limit?: number },
  { rejectValue: string }
>('userProfile/fetchUserFollowing', async (params, { rejectWithValue }) => {
  const { identifier, page = 1, limit = 20 } = params;
  
  try {
    const result = await FollowService.getFollowing(identifier, page, limit);
    
    if (!result.success || !result.data) {
      return rejectWithValue(result.error || 'Failed to fetch following');
    }
    
    // Safely access data with null check
    return {
      users: result.data.following || [],
      pagination: result.data.pagination || {
        total: 0,
        page: page,
        limit: limit,
        pages: 0
      }
    };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch following');
  }
});

// Fetch suggested users to follow
export const fetchSuggestedUsers = createAsyncThunk<
  User[],
  { limit?: number },
  { rejectValue: string }
>('userProfile/fetchSuggestedUsers', async (params, { rejectWithValue }) => {
  const { limit = 5 } = params;
  
  try {
    const result = await ProfileService.getSuggestedProfiles(limit);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return rejectWithValue(result.error || 'Failed to fetch suggested users');
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch suggested users');
  }
});

// Search profiles
export const searchProfiles = createAsyncThunk<
  { profiles: User[]; pagination: PaginationState },
  { query: string; page?: number; limit?: number },
  { rejectValue: string }
>(
  'userProfile/searchProfiles',
  async (
    {
      query,
      page = 1,
      limit = 10,
    }: { query: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      console.log('Calling searchProfiles with query:', query, 'page:', page, 'limit:', limit);
      const result = await ProfileService.searchProfiles(query, page, limit);
      console.log('Search profiles result:', result);

      if (!result.success) {
        console.error('Error in searchProfiles:', result.error);
        return rejectWithValue(result.error || 'Failed to search profiles');
      }

      if (!result.data) {
        console.error('No data returned from searchProfiles');
        return rejectWithValue('No data returned from search');
      }

      console.log('Processing search results:', {
        profiles: result.data.profiles || [],
        pagination: result.data.pagination || {}
      });

      // Ensure we return the correct structure with proper defaulting for all fields
      return {
        profiles: Array.isArray(result.data.profiles) ? result.data.profiles : [],
        pagination: {
          total: typeof result.data.pagination?.total === 'number' ? result.data.pagination.total : 0,
          page: typeof result.data.pagination?.page === 'number' ? result.data.pagination.page : page,
          limit: typeof result.data.pagination?.limit === 'number' ? result.data.pagination.limit : limit,
          pages: typeof result.data.pagination?.pages === 'number' ? result.data.pagination.pages : 0
        }
      };
    } catch (error: any) {
      console.error('Error in searchProfiles:', error);
      return rejectWithValue(error.message || 'An error occurred while searching profiles');
    }
  }
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.followers = [];
      state.following = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch user profile cases
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = normalizeUserProfile(action.payload);
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profile';
      });
    
    // Fetch user profile by userId cases
    builder
      .addCase(fetchUserProfileByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = normalizeUserProfile(action.payload);
        state.error = null;
      })
      .addCase(fetchUserProfileByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profile by userId';
      });
      
    // Fetch user profile by username cases
    builder
      .addCase(fetchUserProfileByUsername.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileByUsername.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = normalizeUserProfile(action.payload);
        state.error = null;
      })
      .addCase(fetchUserProfileByUsername.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profile by username';
      });
    
    // Fetch current user profile cases
    builder
      .addCase(fetchCurrentUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = normalizeUserProfile(action.payload);
        state.error = null;
      })
      .addCase(fetchCurrentUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profile';
      });

    // Update user profile cases
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = normalizeUserProfile(action.payload);
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to update profile';
      });

    // Follow user cases
    builder
      .addCase(followUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile && state.profile.id === action.payload.followingId) {
          state.profile = incrementFollowerCount(state.profile);
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to follow user';
      });

    // Unfollow user cases
    builder
      .addCase(unfollowUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile && state.profile.id === action.payload.followingId) {
          state.profile = decrementFollowerCount(state.profile);
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to unfollow user';
      });

    // Fetch user followers cases
    builder
      .addCase(fetchUserFollowers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserFollowers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.followers = action.payload.users;
        state.followersPagination = action.payload.pagination;
      })
      .addCase(fetchUserFollowers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch followers';
      });

    // Fetch user following cases
    builder
      .addCase(fetchUserFollowing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserFollowing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.following = action.payload.users;
        state.followingPagination = action.payload.pagination;
      })
      .addCase(fetchUserFollowing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch following';
      });

    // Fetch suggested users cases
    builder
      .addCase(fetchSuggestedUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suggestedUsers = action.payload;
      })
      .addCase(fetchSuggestedUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch suggested users';
      });

    // Search profiles cases
    builder
      .addCase(searchProfiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to search profiles';
      });
  },
});

// Utility function để thử nghiệm API (có thể gọi từ console cho mục đích debug)
export const testProfileAPI = {
  getProfile: async (identifier: string) => {
    try {
      const result = await ProfileService.getProfile(identifier);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        data: null,
        error: 'Lỗi khi gọi API'
      };
    }
  },
  
  getCurrentProfile: async () => {
    try {
      const result = await ProfileService.getCurrentProfile();
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        data: null, 
        error: 'Lỗi khi gọi API'
      };
    }
  },
  
  updateProfile: async (userData: Partial<User>) => {
    try {
      const result = await ProfileService.updateProfile(userData);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        data: null,
        error: 'Lỗi khi gọi API'
      };
    }
  },
  
  searchProfiles: async (query: string, page = 1, limit = 20) => {
    try {
      const result = await ProfileService.searchProfiles(query, page, limit);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        data: null,
        error: 'Lỗi khi gọi API'
      };
    }
  }
};

export const { clearUserProfile } = userProfileSlice.actions;

export default userProfileSlice.reducer;

 