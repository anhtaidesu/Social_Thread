import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';
import axiosInstance from '../../utils/axiosConfig';
import socketService from '../../services/socket.service';

// API URL is now handled by axiosInstance in the config file

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  otpSent: false,
  otpEmail: null,
};

// Request OTP for registration or login
export const requestOtp = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: string }
>('auth/requestOtp', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`/api/v1/sendOTP`, { email: data.email });
    return { message: response.data.EM || 'OTP sent successfully' };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.EM || 'Failed to send OTP');
  }
});

// Login thunk
export const login = createAsyncThunk<
  { user: User; token: string; refreshToken: string; isAuthenticated: boolean },
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Login credentials:', credentials);
      const response = await axiosInstance.post('/api/v1/login', credentials);
      console.log('API login response:', response);

      // Check if the response has the expected structure
      const data = response.data;
      console.log('Response data:', data);

      if (data.EC !== 0) {
        console.error('Login failed with EC:', data.EC, 'EM:', data.EM);
        return rejectWithValue(data.EM || 'Login failed');
      }

      // Check if we received the user data in the correct format
      if (!data.DT || typeof data.DT !== 'object') {
        console.error('Invalid response data structure:', data);
        return rejectWithValue('Invalid response format');
      }

      const userData = data.DT;
      console.log('User data from response:', userData);

      // Extract user information from userData
      const user: User = {
        id: userData.userId || '',
        email: userData.email || '',
        username: userData.email || '',
        profilePicture: userData.picture || '',
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString()
      };

      // Store tokens
      if (userData.access_token) {
        localStorage.setItem('token', userData.access_token);
        console.log('Access token stored successfully');
      } else {
        console.warn('No access token in response');
      }

      if (userData.refresh_token) {
        localStorage.setItem('refreshToken', userData.refresh_token);
        console.log('Refresh token stored successfully');
      }

      return {
        user,
        token: userData.access_token,
        refreshToken: userData.refresh_token,
        isAuthenticated: true
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        // If the server returned a specific error message, use it
        if (error.response.data && error.response.data.EM) {
          return rejectWithValue(error.response.data.EM);
        }
        
        return rejectWithValue(`Server error: ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        return rejectWithValue('No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        // Use a default error message
        console.error('Error occurred:', error);
        return rejectWithValue('Unknown error occurred');
      }
    }
  }
);

// Register thunk
export const register = createAsyncThunk<
  { user: User; token: string; refreshToken: string },
  { email: string; password: string; otp: string },
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`/api/v1/register`, userData);
    
    if (response.data.EC !== 0) {
      return rejectWithValue(response.data.EM || 'Registration failed');
    }
    
    const data = response.data.DT;
    const token = data.access_token;
    const refreshToken = data.refresh_token;
    const user = {
      id: data.userId,
      username: data.email,
      email: data.email,
      fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      profilePicture: data.picture || '',
      role: data.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      followersCount: 0,
      followingCount: 0,
      bio: ''
    };
    
    // Store tokens in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    return { user, token, refreshToken };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.EM || 'Registration failed');
  }
});

// Logout thunk
export const logout = createAsyncThunk('auth/logout', async () => {
  // Disconnect socket
  socketService.disconnect();
  
  // Also try to call the logout endpoint if available
  try {
    await axiosInstance.post('/api/v1/logout');
  } catch (error) {
    // Ignore errors on logout endpoint
  }
  
  // Clear tokens regardless of API success
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  return null;
});

// Reset password thunk
export const resetPassword = createAsyncThunk<
  { message: string },
  { email: string; otp: string; password: string },
  { rejectValue: string }
>('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    console.log('Resetting password for:', data.email);
    const response = await axiosInstance.post('/api/v1/resetPassword', data);
    console.log('Reset password response:', response);
    
    if (response.data.EC !== 0) {
      console.error('Password reset failed with EC:', response.data.EC, 'EM:', response.data.EM);
      return rejectWithValue(response.data.EM || 'Password reset failed');
    }
    
    return { message: response.data.EM || 'Password reset successful' };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      return rejectWithValue(error.response.data?.EM || `Server error: ${error.response.status}`);
    } else if (error.request) {
      console.error('Error request:', error.request);
      return rejectWithValue('No response from server');
    }
    
    return rejectWithValue('Unknown error occurred');
  }
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    clearOtpState: (state) => {
      state.otpSent = false;
      state.otpEmail = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Request OTP cases
    builder
      .addCase(requestOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.error = null;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to send OTP';
      });
    
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.otpSent = false;
        state.otpEmail = null;
        
        // Connect to websocket when user is authenticated
        socketService.connect();
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      });

    // Register cases
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.otpSent = false;
        state.otpEmail = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      });

    // Logout cases
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        state.otpEmail = null;
      });

    // Reset password cases
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.otpSent = false;
        state.otpEmail = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to reset password';
      });
  },
});

export const { setCredentials, clearCredentials, clearOtpState } = authSlice.actions;

export default authSlice.reducer; 