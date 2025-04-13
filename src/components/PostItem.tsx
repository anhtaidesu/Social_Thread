import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  IconButton, 
  Divider,
  Grid as MuiGrid,
  CardMedia,
  Tooltip
} from '@mui/material';
import { 
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as CommentIcon,
  RepeatOutlined as RepostIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { formatDistance } from 'date-fns';
import type { AppDispatch } from '../app/store';
import type { Post, User } from '../types';
import UserAvatar from './UserAvatar';

interface PostItemProps {
  post: Post;
  onLike?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

const Grid = MuiGrid;

const PostItem: React.FC<PostItemProps> = ({ post, onLike, onRepost, onComment }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Xử lý trường hợp API trả về profile thay vì author
  const authorData = post.author || post.profile;
  
  // Nếu không có cả author và profile, tạo author mặc định
  const author: User = authorData || {
    id: 'unknown',
    username: 'Unknown User',
    profilePicture: undefined,
    fullName: undefined,
    createdAt: new Date().toISOString(),
  };
  
  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };
  
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${author.id}`);
  };
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(post.id);
    }
  };
  
  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComment) {
      onComment(post.id);
    } else {
      navigate(`/post/${post.id}`);
    }
  };
  
  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRepost) {
      onRepost(post.id);
    }
  };
  
  // Handle media URLs from backend which might be stored as JSON string
  const mediaUrls = post.mediaUrls ? 
    (typeof post.mediaUrls === 'string' ? 
      JSON.parse(post.mediaUrls) : 
      post.mediaUrls) : 
    [];
  
  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        borderRadius: 2,
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        },
        overflow: 'visible',
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' 
            ? theme.palette.threadsDark.cardBackground 
            : theme.palette.threadsLight.cardBackground
      }}
      onClick={handlePostClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <UserAvatar 
            src={author.profilePicture}
            username={author.username}
            sx={{ 
              width: 40, 
              height: 40, 
              mr: 2,
              cursor: 'pointer'
            }}
            onClick={handleProfileClick}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="subtitle1" 
                component="span" 
                fontWeight="bold"
                onClick={handleProfileClick}
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                {author.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}
              </Typography>
            </Box>
            {(author.fullName || author.displayName) && (
              <Typography variant="body2" color="text.secondary">
                {author.displayName || author.fullName}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ mb: mediaUrls.length ? 2 : 0 }}>
          {post.content}
        </Typography>
        
        {mediaUrls.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: mediaUrls.length === 1 ? '1fr' : 'repeat(2, 1fr)', 
                gap: 1 
              }}
            >
              {mediaUrls.map((image: string, index: number) => (
                <Box key={index}>
                  <CardMedia
                    component="img"
                    image={image}
                    alt={`Post image ${index + 1}`}
                    sx={{ 
                      height: mediaUrls.length === 1 ? 300 : 150, 
                      borderRadius: 1,
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ px: 2, py: 1 }}>
        <Tooltip title={post.isLiked ? "Unlike" : "Like"}>
          <IconButton onClick={handleLike} size="small" color={post.isLiked ? "error" : "inherit"}>
            {post.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {post.likeCount || post.likesCount || 0}
        </Typography>
        
        <Tooltip title="Comment">
          <IconButton size="small" onClick={handleComment}>
            <CommentIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {post.commentCount || post.commentsCount || 0}
        </Typography>
        
        <Tooltip title="Repost">
          <IconButton size="small" onClick={handleRepost}>
            <RepostIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {post.repostCount || post.repostsCount || 0}
        </Typography>
        
        <Tooltip title="Share">
          <IconButton size="small">
            <SendIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default PostItem; 