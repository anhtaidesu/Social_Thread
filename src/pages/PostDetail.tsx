import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Divider, 
  Button,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { fetchPostById } from '../features/posts/postsSlice';
import { 
  fetchComments, 
  addComment,
  likeComment,
  unlikeComment
} from '../features/comments/commentsSlice';
import type { AppDispatch, RootState } from '../app/store';
import PostItem from '../components/PostItem';
import CommentSection from '../components/CommentSection';

const PostDetail: React.FC = () => {
  const theme = useTheme();
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { singlePost, isLoading: postLoading, error: postError } = useSelector((state: RootState) => state.posts);
  const { comments, isLoading: commentsLoading, error: commentsError } = useSelector((state: RootState) => state.comments);
  const { user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId));
      dispatch(fetchComments({ postId }));
    }
  }, [dispatch, postId]);
  
  const handleAddComment = (content: string) => {
    if (!postId || !content.trim()) return;
    
    dispatch(addComment({ postId, content }));
  };
  
  const handleLikeComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    if (comment.isLiked) {
      dispatch(unlikeComment(commentId));
    } else {
      dispatch(likeComment(commentId));
    }
  };
  
  const handleReplyComment = (commentId: string) => {
    // TODO: Implement reply functionality
    console.log('Reply to comment', commentId);
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (postLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (postError || !singlePost) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          {postError || 'Post not found'}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          Thread
        </Typography>
      </Box>
      
      <PostItem post={singlePost} />
      
      <Divider sx={{ my: 2 }} />
      
      <CommentSection 
        postId={postId || ''}
        comments={comments}
        isLoading={commentsLoading}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onReplyComment={handleReplyComment}
      />
    </Box>
  );
};

export default PostDetail; 