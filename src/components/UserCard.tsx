import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Button, 
  Box,
  Skeleton
} from '@mui/material';
import { User } from '../types';
import { followUser, unfollowUser } from '../features/userProfile/userProfileSlice';
import { RootState } from '../app/store';
import { AppDispatch } from '../app/store';
import UserAvatar from './UserAvatar';

interface UserCardProps {
  user: User;
  isFollowing?: boolean;
  isCurrentUser?: boolean;
  onFollowToggle?: () => void;
  loading?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  isFollowing = false, 
  isCurrentUser = false,
  onFollowToggle,
  loading = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state: RootState) => state.userProfile);
  
  const handleProfileClick = () => {
    navigate(`/profile/${user.id}`);
  };
  
  const handleFollowToggle = async () => {
    if (isFollowing) {
      await dispatch(unfollowUser(user.id));
    } else {
      await dispatch(followUser(user.id));
    }
    if (onFollowToggle) onFollowToggle();
  };
  
  if (loading) {
    return (
      <Card 
        sx={{ 
          mb: 2, 
          borderRadius: 2, 
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' 
              ? theme.palette.threadsDark.cardBackground 
              : theme.palette.threadsLight.cardBackground
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ ml: 2, flexGrow: 1 }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={36} />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        },
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' 
            ? theme.palette.threadsDark.cardBackground 
            : theme.palette.threadsLight.cardBackground
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
        <UserAvatar 
          src={user.profilePicture}
          username={user.username}
          sx={{ 
            width: 40, 
            height: 40, 
            cursor: 'pointer'
          }}
          onClick={handleProfileClick}
        />
        <Box sx={{ ml: 2, flexGrow: 1, cursor: 'pointer' }} onClick={handleProfileClick}>
          <Typography variant="subtitle2" fontWeight="bold">
            {user.username}
          </Typography>
          {user.fullName && (
            <Typography variant="body2" color="text.secondary">
              {user.fullName}
            </Typography>
          )}
          {!user.fullName && user.bio && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.2em',
                maxHeight: '1.2em'
              }}
            >
              {user.bio}
            </Typography>
          )}
        </Box>
        {!isCurrentUser && (
          <Button 
            variant={isFollowing ? "outlined" : "contained"}
            size="small"
            onClick={handleFollowToggle}
            disabled={isLoading}
            sx={{ 
              minWidth: 80,
              borderRadius: 6,
              px: 2
            }}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard; 