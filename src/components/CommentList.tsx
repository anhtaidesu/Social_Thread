import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  Avatar,
  IconButton,
  List,
  ListItem,
  Collapse,
  styled,
  useTheme
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { formatDistance } from 'date-fns';
import CommentForm from './CommentForm';
import { Comment } from '../types';
import UserAvatar from './UserAvatar';

const CommentContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
  '&:last-child': {
    paddingBottom: 0,
  },
}));

const ReplyContainer = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(5),
  marginTop: theme.spacing(1),
}));

const CommentContent = styled(Box)({
  marginLeft: 48,
  marginTop: -32,
});

interface CommentListProps {
  comments: Comment[];
  postId: string;
  onAddComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  loadMoreComments?: () => Promise<void>;
  hasMoreComments?: boolean;
  isLoadingMore?: boolean;
}

// Recursive component for threaded comments
const CommentItem: React.FC<{
  comment: Comment;
  postId: string;
  onAddComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  level?: number;
}> = ({ comment, postId, onAddComment, onLikeComment, level = 0 }) => {
  const theme = useTheme();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(level < 2);
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  const handleReplyToggle = () => {
    setShowReplyForm(!showReplyForm);
  };
  
  const handleExpandReplies = () => {
    setShowReplies(!showReplies);
  };
  
  const handleCommentSubmit = async (postId: string, content: string, parentId?: string) => {
    await onAddComment(postId, content, parentId);
    setShowReplyForm(false);
  };
  
  const handleLike = async () => {
    await onLikeComment(comment.id);
  };
  
  return (
    <CommentContainer>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <UserAvatar
          src={comment.author?.profilePicture}
          username={comment.author?.username || ''}
          sx={{ width: 32, height: 32 }}
        />
        
        <CommentContent>
          <Box sx={{ 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            p: 1.5,
            borderRadius: 2,
            mb: 0.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mr: 1 }}>
                {comment.author?.displayName || comment.author?.username || 'Unknown User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
              </Typography>
            </Box>
            
            <Typography variant="body2">
              {comment.content}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
            <IconButton 
              size="small" 
              onClick={handleLike}
              color={comment.isLiked ? "error" : "inherit"}
              sx={{ p: 0.5 }}
            >
              {comment.isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, mr: 1.5 }}>
              {comment.likeCount || 0}
            </Typography>
            
            <Button 
              variant="text" 
              size="small" 
              onClick={handleReplyToggle}
              startIcon={<ReplyIcon fontSize="small" />}
              sx={{ 
                p: 0, 
                minWidth: 'auto', 
                textTransform: 'none',
                color: 'text.secondary',
                fontWeight: 'normal'
              }}
            >
              Phản hồi
            </Button>
          </Box>
          
          {/* Reply form */}
          {showReplyForm && (
            <Box sx={{ mt: 1 }}>
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onCommentSubmit={handleCommentSubmit}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Viết phản hồi..."
                autoFocus
              />
            </Box>
          )}
          
          {/* Show replies toggle button if there are replies */}
          {comment.replies && comment.replies.length > 0 && (
            <ReplyContainer>
              <Button
                startIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={handleExpandReplies}
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 'normal',
                  p: 0.5,
                  mb: 1
                }}
                size="small"
              >
                {showReplies ? 'Ẩn phản hồi' : `Xem ${comment.replies.length} phản hồi`}
              </Button>
              
              <Collapse in={showReplies}>
                <List disablePadding>
                  {comment.replies.map((reply) => (
                    <ListItem key={reply.id} sx={{ p: 0, mb: 1 }}>
                      <CommentItem
                        comment={reply}
                        postId={postId}
                        onAddComment={onAddComment}
                        onLikeComment={onLikeComment}
                        level={level + 1}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </ReplyContainer>
          )}
        </CommentContent>
      </Box>
    </CommentContainer>
  );
};

const CommentList: React.FC<CommentListProps> = ({
  comments,
  postId,
  onAddComment,
  onLikeComment,
  loadMoreComments,
  hasMoreComments,
  isLoadingMore
}) => {
  const theme = useTheme();
  
  // Get root comments (no parent)
  const rootComments = comments.filter(comment => !comment.parentId);
  
  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="h6" gutterBottom>
        Bình luận ({comments.length})
      </Typography>
      
      {/* Comment form for top-level comments */}
      <CommentForm 
        postId={postId}
        onCommentSubmit={onAddComment}
        placeholder="Viết bình luận..."
      />
      
      {/* Load more button */}
      {hasMoreComments && (
        <Button
          fullWidth
          variant="outlined"
          onClick={loadMoreComments}
          disabled={isLoadingMore}
          sx={{ mb: 2 }}
        >
          {isLoadingMore ? 'Đang tải...' : 'Xem thêm bình luận'}
        </Button>
      )}
      
      {/* Comments list */}
      {rootComments.length > 0 ? (
        <List disablePadding>
          {rootComments.map((comment) => (
            <React.Fragment key={comment.id}>
              <ListItem sx={{ p: 0, mb: 2 }}>
                <CommentItem
                  comment={comment}
                  postId={postId}
                  onAddComment={onAddComment}
                  onLikeComment={onLikeComment}
                />
              </ListItem>
              <Divider sx={{ mb: 2 }} />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 4 }}>
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </Typography>
      )}
    </Box>
  );
};

export default CommentList; 