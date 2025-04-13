import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Notification, ErrorResponse } from '../../types';

// API URL from env
const API_URL = process.env.REACT_APP_SOCIAL_API_URL || 'http://localhost:8081';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Helper function to set auth headers
const setAuthHeader = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk<
  Notification[],
  { page?: number; limit?: number },
  { rejectValue: ErrorResponse }
>('notifications/fetchNotifications', async (params, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: { token: string } };
    const token = state.auth.token;
    
    if (!token) {
      return rejectWithValue({
        message: 'No authentication token',
        status: 401,
      });
    }
    
    const { page = 1, limit = 20 } = params;
    const response = await axios.get(
      `${API_URL}/api/v1/notifications?page=${page}&limit=${limit}`,
      setAuthHeader(token)
    );
    
    return response.data.notifications;
  } catch (error: any) {
    return rejectWithValue({
      message: error.response?.data?.message || 'Failed to fetch notifications',
      status: error.response?.status || 500,
    });
  }
});

// Mark notification as read
export const markAsRead = createAsyncThunk<
  string,
  string,
  { rejectValue: ErrorResponse }
>('notifications/markAsRead', async (notificationId, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: { token: string } };
    const token = state.auth.token;
    
    if (!token) {
      return rejectWithValue({
        message: 'No authentication token',
        status: 401,
      });
    }
    
    await axios.patch(
      `${API_URL}/api/v1/notifications/${notificationId}/read`,
      {},
      setAuthHeader(token)
    );
    
    return notificationId;
  } catch (error: any) {
    return rejectWithValue({
      message: error.response?.data?.message || 'Failed to mark notification as read',
      status: error.response?.status || 500,
    });
  }
});

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: ErrorResponse }
>('notifications/markAllAsRead', async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: { token: string } };
    const token = state.auth.token;
    
    if (!token) {
      return rejectWithValue({
        message: 'No authentication token',
        status: 401,
      });
    }
    
    await axios.patch(
      `${API_URL}/api/v1/notifications/mark-all-read`,
      {},
      setAuthHeader(token)
    );
  } catch (error: any) {
    return rejectWithValue({
      message: error.response?.data?.message || 'Failed to mark all notifications as read',
      status: error.response?.status || 500,
    });
  }
});

// Notifications slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications = [action.payload, ...state.notifications];
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications cases
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload || [];
        state.unreadCount = Array.isArray(action.payload) 
          ? action.payload.filter(notification => !notification.read).length 
          : 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch notifications';
      });

    // Mark as read cases
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].read;
          state.notifications[index].read = true;
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });

    // Mark all as read cases
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          read: true
        }));
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, clearNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer; 