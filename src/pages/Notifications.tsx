import React, { useEffect, useState } from 'react';
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
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import { 
  Favorite as LikeIcon,
  ChatBubble as CommentIcon,
  Repeat as RepostIcon,
  Person as FollowIcon,
  AlternateEmail as MentionIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { fetchNotifications, markAllAsRead, deleteNotification } from '../features/notifications/notificationsSlice';
import { formatDistance } from 'date-fns';
import type { AppDispatch, RootState } from '../app/store';
import { Notification } from '../types';
import UserAvatar from '../components/UserAvatar';

// Helper to get icon based on notification type
const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'LIKE':
      return <LikeIcon fontSize="small" color="error" />;
    case 'COMMENT':
      return <CommentIcon fontSize="small" color="primary" />;
    case 'FOLLOW':
    case 'FOLLOW_REQUEST':
    case 'FOLLOW_APPROVED':
      return <FollowIcon fontSize="small" color="success" />;
    case 'REPOST':
      return <RepostIcon fontSize="small" color="secondary" />;
    case 'MENTION':
      return <MentionIcon fontSize="small" color="info" />;
    default:
      return null;
  }
};

// Helper to get notification text
const getNotificationText = (notification: Notification) => {
  return notification.message;
};

const Notifications: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  
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
    if (notification.entityType === 'POST' && notification.entityId) {
      navigate(`/post/${notification.entityId}`);
    } else if (notification.type === 'FOLLOW' && notification.sender) {
      navigate(`/profile/${notification.sender.id}`);
    }
  };
  
  const handleDeleteClick = (notificationId: string, event: React.MouseEvent) => {
    // Stop propagation to prevent navigation
    event.stopPropagation();
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      dispatch(deleteNotification(notificationToDelete));
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setNotificationToDelete(null);
  };
  
  if (isLoading && notificationList.length === 0) {
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
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.threadsDark?.cardBackground : theme.palette.threadsLight?.cardBackground,
            border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.threadsDark?.border : theme.palette.threadsLight?.border}`,
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
                sx={{ 
                  py: 2, 
                  cursor: 'pointer',
                  backgroundColor: !notification.isRead 
                    ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  },
                  position: 'relative'
                }}
                onClick={() => handleNotificationClick(notification)}
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
                        fontWeight={!notification.isRead ? 'bold' : 'normal'}
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
                
                {/* Delete button */}
                <Tooltip title="Delete notification">
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleDeleteClick(notification.id, e)}
                    sx={{ 
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        color: theme.palette.error.main
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Delete Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this notification? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications; 