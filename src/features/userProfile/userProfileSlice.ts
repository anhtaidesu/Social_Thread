import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types';
import axiosInstance from '../../utils/axiosConfig';

// URL của Social Service API
const SOCIAL_API_URL = process.env.REACT_APP_SOCIAL_API_URL || 'http://localhost:8081';

interface UserProfileState {
  profile: User | null;
  followers: User[];
  following: User[];
  suggestedUsers: User[];
  searchResults: {
    profiles: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: UserProfileState = {
  profile: null,
  followers: [],
  following: [],
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
    
    const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/${identifier}`);
    
    if (response.data.status === 'success') {
      return response.data.data.profile;
    }
    
    return rejectWithValue(response.data.message || 'Failed to fetch profile');
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
  }
});

// Fetch current user profile
export const fetchCurrentUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('userProfile/fetchCurrentUserProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/me`);
    
    if (response.data.status === 'success') {
      return response.data.data.profile;
    }
    
    return rejectWithValue(response.data.message || 'Failed to fetch profile');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
  }
});

// Update user profile
export const updateUserProfile = createAsyncThunk<
  User,
  Partial<User>,
  { rejectValue: string }
>('userProfile/updateUserProfile', async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${SOCIAL_API_URL}/api/v1/profiles`, userData);
    
    if (response.data.status === 'success') {
      return response.data.data.profile;
    }
    
    return rejectWithValue(response.data.message || 'Failed to update profile');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update user profile');
  }
});

// Follow a user
export const followUser = createAsyncThunk<
  { success: boolean; followingId: string },
  string,
  { rejectValue: string }
>('userProfile/followUser', async (targetId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${SOCIAL_API_URL}/api/v1/follows/${targetId}`);
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to follow user');
    }
    
    return { success: true, followingId: targetId };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
  }
});

// Unfollow a user
export const unfollowUser = createAsyncThunk<
  { success: boolean; followingId: string },
  string,
  { rejectValue: string }
>('userProfile/unfollowUser', async (targetId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`${SOCIAL_API_URL}/api/v1/follows/${targetId}`);
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to unfollow user');
    }
    
    return { success: true, followingId: targetId };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
  }
});

// Fetch user followers
export const fetchUserFollowers = createAsyncThunk<
  User[],
  { identifier: string; page?: number; limit?: number },
  { rejectValue: string }
>('userProfile/fetchUserFollowers', async (params, { rejectWithValue }) => {
  const { identifier, page = 1, limit = 10 } = params;
  
  try {
    const response = await axiosInstance.get(
      `${SOCIAL_API_URL}/api/v1/follows/followers/${identifier}?page=${page}&limit=${limit}`
    );
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to fetch followers');
    }
    
    // Đảm bảo chúng ta truy cập đúng dữ liệu từ response
    return response.data.data.profiles || response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch followers');
  }
});

// Fetch user following
export const fetchUserFollowing = createAsyncThunk<
  User[],
  { identifier: string; page?: number; limit?: number },
  { rejectValue: string }
>('userProfile/fetchUserFollowing', async (params, { rejectWithValue }) => {
  const { identifier, page = 1, limit = 10 } = params;
  
  try {
    const response = await axiosInstance.get(
      `${SOCIAL_API_URL}/api/v1/follows/following/${identifier}?page=${page}&limit=${limit}`
    );
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to fetch following');
    }
    
    // Đảm bảo chúng ta truy cập đúng dữ liệu từ response
    return response.data.data.profiles || response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch following');
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
    const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/suggested?limit=${limit}`);
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to fetch suggested users');
    }
    
    // Đảm bảo chúng ta truy cập đúng dữ liệu từ response
    return response.data.data.profiles || response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch suggested users');
  }
});

// Search profiles
export const searchProfiles = createAsyncThunk<
  { profiles: User[]; pagination: { total: number; page: number; limit: number; pages: number } },
  { query: string; page?: number; limit?: number },
  { rejectValue: string }
>('userProfile/searchProfiles', async (params, { rejectWithValue }) => {
  const { query, page = 1, limit = 20 } = params;
  
  try {
    const response = await axiosInstance.get(
      `${SOCIAL_API_URL}/api/v1/profiles/search?query=${query}&page=${page}&limit=${limit}`
    );
    
    if (response.data.status === 'success') {
      return {
        profiles: response.data.data.profiles,
        pagination: response.data.data.pagination
      };
    }
    
    return rejectWithValue(response.data.message || 'Failed to search profiles');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to search profiles');
  }
});

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
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profile';
      });
    
    // Fetch current user profile cases
    builder
      .addCase(fetchCurrentUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
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
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update profile';
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
          if (state.profile.followersCount !== undefined) {
            state.profile.followersCount += 1;
          }
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
          if (state.profile.followersCount !== undefined && state.profile.followersCount > 0) {
            state.profile.followersCount -= 1;
          }
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
        state.followers = action.payload;
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
        state.following = action.payload;
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
      const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/${identifier}`);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },
  
  getCurrentProfile: async () => {
    try {
      const response = await axiosInstance.get(`${SOCIAL_API_URL}/api/v1/profiles/me`);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },
  
  updateProfile: async (userData: Partial<User>) => {
    try {
      const response = await axiosInstance.put(`${SOCIAL_API_URL}/api/v1/profiles`, userData);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },
  
  searchProfiles: async (query: string, page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(
        `${SOCIAL_API_URL}/api/v1/profiles/search?query=${query}&page=${page}&limit=${limit}`
      );
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  }
};

export const { clearUserProfile } = userProfileSlice.actions;

export default userProfileSlice.reducer;

 