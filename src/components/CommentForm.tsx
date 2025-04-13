import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Avatar, 
  CircularProgress, 
  Typography,
  styled
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { User } from '../types';

const MAX_COMMENT_LENGTH = 300;

const StyledCommentForm = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  width: '100%',
}));

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentSubmit: (postId: string, content: string, parentId?: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentId,
  onCommentSubmit,
  onCancel,
  placeholder = 'Viết bình luận...',
  autoFocus = false
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentUser = useSelector((state: RootState) => state.auth.user) as User;
  
  const charactersLeft = MAX_COMMENT_LENGTH - content.length;
  const isContentValid = content.trim().length > 0 && content.length <= MAX_COMMENT_LENGTH;
  
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_COMMENT_LENGTH) {
      setContent(newContent);
    }
  };
  
  const handleSubmit = async () => {
    if (!isContentValid) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onCommentSubmit(postId, content.trim(), parentId);
      setContent('');
    } catch (err: any) {
      setError(err.message || 'Không thể đăng bình luận. Vui lòng thử lại.');
      console.error('Error submitting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <StyledCommentForm>
      <Avatar 
        src={currentUser?.profilePicture || undefined} 
        alt={currentUser?.displayName || currentUser?.username || 'User'}
        sx={{ width: 36, height: 36 }}
      />
      
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={3}
          placeholder={placeholder}
          value={content}
          onChange={handleContentChange}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          variant="outlined"
          size="small"
          InputProps={{
            sx: { borderRadius: 5 },
          }}
        />
        
        {error && (
          <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
            {error}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography 
            variant="caption" 
            color={charactersLeft < 0 ? 'error' : charactersLeft < 20 ? 'warning.main' : 'text.secondary'}
          >
            {charactersLeft < MAX_COMMENT_LENGTH && `${charactersLeft} ký tự còn lại`}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onCancel && (
              <Button
                size="small"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
            )}
            
            <Button
              variant="contained"
              size="small"
              disabled={!isContentValid || isSubmitting}
              onClick={handleSubmit}
              sx={{ borderRadius: 5, px: 2 }}
            >
              {isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : 'Đăng'}
            </Button>
          </Box>
        </Box>
      </Box>
    </StyledCommentForm>
  );
};

export default CommentForm; 