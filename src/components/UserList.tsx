import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Divider, CircularProgress } from '@mui/material';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import Pagination from './Pagination';

interface UserListProps {
  users: User[];
  title?: string;
  emptyMessage?: string;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
  loading?: boolean;
  showPagination?: boolean;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
  currentUserId?: string;
  isFollowing?: (userId: string) => boolean;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  title, 
  emptyMessage = 'Không có người dùng nào', 
  onFollowToggle,
  loading = false,
  showPagination = false,
  pagination,
  onPageChange,
  currentUserId,
  isFollowing
}) => {
  const navigate = useNavigate();

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleFollowToggle = (userId: string, isFollowing: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFollowToggle) {
      onFollowToggle(userId, isFollowing);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      
      {users.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          {emptyMessage}
        </Typography>
      ) : (
        <>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {users.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem
                  alignItems="center"
                  onClick={() => handleUserClick(user.id)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    },
                    py: 1.5
                  }}
                >
                  <ListItemAvatar>
                    <UserAvatar user={user} size={50} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold">
                        {user.displayName || user.username}
                        {user.isVerified && ' ✓'}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        @{user.username}
                        {user.bio && (
                          <Box component="div" sx={{ mt: 0.5 }}>
                            {user.bio.length > 50 ? `${user.bio.slice(0, 50)}...` : user.bio}
                          </Box>
                        )}
                      </Typography>
                    }
                    sx={{ mr: 2 }}
                  />
                  {onFollowToggle && user.id !== currentUserId && (
                    <Button
                      variant={user.isFollowing ? "outlined" : "contained"}
                      size="small"
                      onClick={(e) => handleFollowToggle(user.id, !!user.isFollowing, e)}
                      sx={{ minWidth: 100 }}
                    >
                      {user.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                    </Button>
                  )}
                </ListItem>
                {index < users.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
          
          {showPagination && pagination && onPageChange && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              onPageChange={onPageChange}
              itemsPerPage={pagination.limit}
              loading={loading}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default UserList; 