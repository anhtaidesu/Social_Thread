import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification, ErrorResponse } from '../../types';
import NotificationService from '../../services/notification.service';

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

// Fetch notifications
export const fetchNotifications = createAsyncThunk<
  Notification[],
  { page?: number; limit?: number },
  { rejectValue: ErrorResponse }
>('notifications/fetchNotifications', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 20 } = params;
    const result = await NotificationService.getNotifications(page, limit);
    
    if (!result.success) {
      console.error('Failed to fetch notifications:', result.error);
      return rejectWithValue({
        message: result.error || 'Failed to fetch notifications',
        status: 500,
      });
    }
    
    return result.data.notifications;
  } catch (error: any) {
    console.error('Error in fetchNotifications thunk:', error);
    return rejectWithValue({
      message: error.message || 'Failed to fetch notifications',
      status: 500,
    });
  }
});

// Mark notification as read
export const markAsRead = createAsyncThunk<
  string,
  string,
  { rejectValue: ErrorResponse }
>('notifications/markAsRead', async (notificationId, { rejectWithValue }) => {
  try {
    const result = await NotificationService.markAsRead(notificationId);
    
    if (!result.success) {
      console.error('Failed to mark notification as read:', result.error);
      return rejectWithValue({
        message: result.error || 'Failed to mark notification as read',
        status: 500,
      });
    }
    
    return notificationId;
  } catch (error: any) {
    console.error('Error in markAsRead thunk:', error);
    return rejectWithValue({
      message: error.message || 'Failed to mark notification as read',
      status: 500,
    });
  }
});

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: ErrorResponse }
>('notifications/markAllAsRead', async (_, { rejectWithValue }) => {
  try {
    const result = await NotificationService.markAllAsRead();
    
    if (!result.success) {
      console.error('Failed to mark all notifications as read:', result.error);
      return rejectWithValue({
        message: result.error || 'Failed to mark all notifications as read',
        status: 500,
      });
    }
  } catch (error: any) {
    console.error('Error in markAllAsRead thunk:', error);
    return rejectWithValue({
      message: error.message || 'Failed to mark all notifications as read',
      status: 500,
    });
  }
});

// Delete notification
export const deleteNotification = createAsyncThunk<
  string,
  string,
  { rejectValue: ErrorResponse }
>('notifications/deleteNotification', async (notificationId, { rejectWithValue }) => {
  try {
    const result = await NotificationService.deleteNotification(notificationId);
    
    if (!result.success) {
      console.error('Failed to delete notification:', result.error);
      return rejectWithValue({
        message: result.error || 'Failed to delete notification',
        status: 500,
      });
    }
    
    return notificationId;
  } catch (error: any) {
    console.error('Error in deleteNotification thunk:', error);
    return rejectWithValue({
      message: error.message || 'Failed to delete notification',
      status: 500,
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
      if (action.payload.isRead === false) {
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
          ? action.payload.filter(notification => notification.isRead === false).length 
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
          const wasUnread = state.notifications[index].isRead === false;
          state.notifications[index].isRead = true;
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
          isRead: true
        }));
        state.unreadCount = 0;
      });

    // Delete notification cases
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        // Recalculate unread count after deletion
        state.unreadCount = state.notifications.filter(n => n.isRead === false).length;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete notification';
      });
  },
});

export const { addNotification, clearNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer; 