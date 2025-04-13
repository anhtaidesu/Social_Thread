import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  Divider, 
  CircularProgress,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { 
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon, 
  Reply as ReplyIcon,
  MoreHoriz as MoreIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Comment } from '../types';
import { formatDistance } from 'date-fns';
import { RootState } from '../app/store';
import { AppDispatch } from '../app/store';
import UserAvatar from './UserAvatar';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  isLoading: boolean;
  onAddComment: (content: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReplyComment?: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  isLoading,
  onAddComment,
  onLikeComment,
  onReplyComment
}) => {
  const [commentContent, setCommentContent] = useState('');
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentContent(e.target.value);
  };

  const handleSubmitComment = () => {
    if (commentContent.trim() === '') return;
    
    onAddComment(commentContent);
    setCommentContent('');
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleLikeComment = (commentId: string) => {
    if (onLikeComment) {
      onLikeComment(commentId);
    }
  };

  const handleReplyComment = (commentId: string) => {
    if (onReplyComment) {
      onReplyComment(commentId);
    }
  };

  const renderComments = () => {
    // Ensure comments is always an array
    const commentArray = Array.isArray(comments) ? comments : [];
    
    if (isLoading && commentArray.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (commentArray.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography color="text.secondary">
            No comments yet. Be the first to comment!
          </Typography>
        </Box>
      );
    }

    return commentArray.map(comment => (
      <Box key={comment.id} sx={{ mb: 2 }}>
        <Card 
          sx={{ 
            mb: 1,
            borderRadius: 2,
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' 
                ? theme.palette.threadsDark.cardBackground 
                : theme.palette.threadsLight.cardBackground
          }}
        >
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <UserAvatar 
                src={comment.author.profilePicture}
                username={comment.author.username}
                sx={{ 
                  width: 32, 
                  height: 32, 
                  mr: 1.5,
                  cursor: 'pointer'
                }}
                onClick={() => handleUserClick(comment.author.id)}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography 
                    variant="subtitle2" 
                    component="span" 
                    fontWeight="bold"
                    onClick={() => handleUserClick(comment.author.id)}
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {comment.author.username}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
                    </Typography>
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2">
                  {comment.content}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', ml: 5, mt: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => handleLikeComment(comment.id)}
                color={comment.isLiked ? "error" : "inherit"}
              >
                {comment.isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>
              <Typography variant="caption" sx={{ mt: 0.5, mr: 2 }}>
                {comment.likes || 0}
              </Typography>
              <IconButton size="small" onClick={() => handleReplyComment(comment.id)}>
                <ReplyIcon fontSize="small" />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Box>
    ));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Comments ({Array.isArray(comments) ? comments.length : 0})
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {currentUser && (
        <Box sx={{ display: 'flex', mb: 4, alignItems: 'flex-start' }}>
          <UserAvatar 
            src={currentUser.profilePicture}
            username={currentUser.username}
            sx={{ 
              width: 40, 
              height: 40, 
              mr: 2
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              placeholder="Add a comment..."
              value={commentContent}
              onChange={handleCommentChange}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={handleSubmitComment}
                disabled={commentContent.trim() === '' || isLoading}
                sx={{ borderRadius: 6 }}
              >
                Comment
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      
      {renderComments()}
    </Box>
  );
};

export default CommentSection; 