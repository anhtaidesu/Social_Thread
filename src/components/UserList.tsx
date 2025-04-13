import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, CircularProgress, Button } from '@mui/material';
import UserCard from './UserCard';
import { User } from '../types';

interface UserListProps {
  title: string;
  users: User[];
  emptyMessage: string;
  loading: boolean;
  currentUserId?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFollowing?: (userId: string) => boolean;
}

const UserList: React.FC<UserListProps> = ({
  title,
  users,
  emptyMessage,
  loading,
  currentUserId,
  onLoadMore,
  hasMore = false,
  isFollowing
}) => {
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize following status for each user if isFollowing function is provided
    if (isFollowing && users.length > 0) {
      const newFollowingMap: Record<string, boolean> = {};
      users.forEach(user => {
        newFollowingMap[user.id] = isFollowing(user.id);
      });
      setFollowingMap(newFollowingMap);
    }
  }, [users, isFollowing]);

  const handleFollowToggle = (userId: string) => {
    if (isFollowing) {
      setFollowingMap(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading && users.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          {emptyMessage}
        </Typography>
      ) : (
        <Box>
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUserId}
              isFollowing={isFollowing ? followingMap[user.id] : false}
              onFollowToggle={() => handleFollowToggle(user.id)}
            />
          ))}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={30} />
            </Box>
          )}

          {hasMore && !loading && onLoadMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                onClick={onLoadMore} 
                variant="outlined"
                sx={{ borderRadius: 6 }}
              >
                Load More
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UserList; 