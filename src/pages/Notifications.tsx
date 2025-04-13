import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Divider, 
  Button,
  CircularProgress,
  Paper,
  useTheme
} from '@mui/material';
import { 
  Favorite as LikeIcon,
  ChatBubble as CommentIcon,
  Repeat as RepostIcon,
  Person as FollowIcon,
  AlternateEmail as MentionIcon
} from '@mui/icons-material';
import { fetchNotifications, markAllAsRead } from '../features/notifications/notificationsSlice';
import { formatDistance } from 'date-fns';
import type { AppDispatch, RootState } from '../app/store';
import { Notification } from '../types';
import UserAvatar from '../components/UserAvatar';

// Helper to get icon based on notification type
const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return <LikeIcon fontSize="small" color="error" />;
    case 'comment':
      return <CommentIcon fontSize="small" color="primary" />;
    case 'follow':
      return <FollowIcon fontSize="small" color="success" />;
    case 'repost':
      return <RepostIcon fontSize="small" color="secondary" />;
    case 'mention':
      return <MentionIcon fontSize="small" color="info" />;
    default:
      return null;
  }
};

// Helper to get notification text
const getNotificationText = (notification: Notification) => {
  const { type, sender } = notification;
  
  switch (type) {
    case 'like':
      return `${sender.username} liked your post`;
    case 'comment':
      return `${sender.username} commented on your post`;
    case 'follow':
      return `${sender.username} started following you`;
    case 'repost':
      return `${sender.username} reposted your thread`;
    case 'mention':
      return `${sender.username} mentioned you in a post`;
    default:
      return '';
  }
};

const Notifications: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const notifications = useSelector((state: RootState) => state.notifications) as {
    notifications: Notification[];
    isLoading: boolean;
    error: string | null;
    unreadCount: number;
  };
  const { notifications: notificationList, isLoading, error, unreadCount } = notifications;
  
  const auth = useSelector((state: RootState) => state.auth) as {
    isAuthenticated: boolean;
  };
  const { isAuthenticated } = auth;
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ page: 1, limit: 50 }));
    } else {
      navigate('/login');
    }
  }, [dispatch, isAuthenticated, navigate]);
  
  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.post) {
      navigate(`/post/${notification.post}`);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.sender.id}`);
    }
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          {error}
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" fontWeight="bold">
          Notifications
        </Typography>
        
        {unreadCount > 0 && (
          <Button 
            variant="text" 
            onClick={handleMarkAllAsRead}
            size="small"
          >
            Mark all as read
          </Button>
        )}
      </Box>
      
      {notificationList.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.threadsDark.cardBackground : theme.palette.threadsLight.cardBackground,
            border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.threadsDark.border : theme.palette.threadsLight.border}`,
            borderRadius: 2
          }}
        >
          <Typography variant="body1" color="textSecondary">
            No notifications yet
          </Typography>
        </Paper>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
          {notificationList.map((notification: Notification) => (
            <React.Fragment key={notification.id}>
              <ListItem 
                alignItems="flex-start" 
                onClick={() => handleNotificationClick(notification)}
                sx={{ 
                  py: 2, 
                  cursor: 'pointer',
                  backgroundColor: !notification.read 
                    ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                <ListItemAvatar>
                  <UserAvatar
                    alt={notification.sender.username}
                    src={notification.sender.profilePicture}
                    username={notification.sender.username}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getNotificationIcon(notification.type)}
                      <Typography 
                        variant="body1" 
                        component="span"
                        fontWeight={!notification.read ? 'bold' : 'normal'}
                      >
                        {getNotificationText(notification)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      component="span"
                    >
                      {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Notifications; 