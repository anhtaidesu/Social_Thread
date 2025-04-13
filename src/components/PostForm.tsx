import React, { useState, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  IconButton, 
  Grid, 
  Paper,
  Avatar,
  CircularProgress,
  useTheme,
  Divider,
  styled,
  LinearProgress
} from '@mui/material';
import {
  ImageOutlined as ImageIcon,
  Close as CloseIcon,
  GifBoxOutlined as GifIcon,
  EmojiEmotionsOutlined as EmojiIcon,
  VideoLibraryOutlined as VideoIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { createPost } from '../features/posts/postsSlice';
import { User } from '../types';

const MAX_POST_LENGTH = 500;
const MAX_IMAGES = 4;

const MediaPreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '&:hover .delete-button': {
    opacity: 1,
  },
}));

const MediaPreview = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 8,
});

const VideoPreview = styled('video')({
  width: '100%',
  height: 'auto',
  maxHeight: 300,
  borderRadius: 8,
});

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#fff',
  opacity: 0,
  transition: 'opacity 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  zIndex: 1,
}));

interface PostFormProps {
  onPostCreated?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPostCreated }) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const currentUser = useSelector((state: RootState) => state.auth.user) as User;
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isContentValid = content.trim().length > 0 && content.length <= MAX_POST_LENGTH;
  const charactersLeft = MAX_POST_LENGTH - content.length;
  const isDisabled = !isContentValid || isSubmitting || isUploading;
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_POST_LENGTH) {
      setContent(newContent);
    }
  };
  
  const handleImageButtonClick = () => {
    if (fileInputRef.current && mediaFiles.length < MAX_IMAGES) {
      fileInputRef.current.click();
    }
  };
  
  const handleVideoButtonClick = () => {
    if (videoInputRef.current && mediaFiles.length === 0) {
      videoInputRef.current.click();
    }
  };
  
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Check if we're trying to add more than MAX_IMAGES
    if (mediaFiles.length + files.length > MAX_IMAGES) {
      setError(`You can only attach up to ${MAX_IMAGES} images`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Check if trying to add video when images exist
    if (mediaFiles.length > 0 && files[0].type.startsWith('video/')) {
      setError('You cannot mix images and videos');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Check if trying to add images when video exists
    if (mediaFiles.length > 0 && mediaFiles[0].type.startsWith('video/') && files[0].type.startsWith('image/')) {
      setError('You cannot mix images and videos');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Check file sizes
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Images: max 5MB, Videos: max 100MB
      const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
      
      if (file.size > maxSize) {
        const fileType = file.type.startsWith('video/') ? 'Video' : 'Image';
        const maxSizeMB = maxSize / (1024 * 1024);
        setError(`${fileType} size should not exceed ${maxSizeMB}MB`);
        setTimeout(() => setError(null), 3000);
        return;
      }
    }
    
    const newFiles = Array.from(files);
    const newFilesArray = [...mediaFiles, ...newFiles];
    setMediaFiles(newFilesArray);
    
    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset the input
    e.target.value = '';
  };
  
  const handleRemoveMedia = (index: number) => {
    const newMediaFiles = [...mediaFiles];
    newMediaFiles.splice(index, 1);
    setMediaFiles(newMediaFiles);
    
    const newMediaPreviews = [...mediaPreviews];
    newMediaPreviews.splice(index, 1);
    setMediaPreviews(newMediaPreviews);
  };
  
  const uploadMedia = async (): Promise<string[]> => {
    if (mediaFiles.length === 0) return [];
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadPromises = mediaFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulate progress
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 95) {
              clearInterval(interval);
              return 95;
            }
            return prev + 5;
          });
        }, 300);
        
        // Make API call to upload
        const response = await fetch(`${process.env.REACT_APP_SOCIAL_API_URL}/api/v1/uploads/post-media`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        clearInterval(interval);
        
        if (!response.ok) {
          throw new Error('Failed to upload media');
        }
        
        const data = await response.json();
        return data.url;
      });
      
      const mediaUrls = await Promise.all(uploadPromises);
      setUploadProgress(100);
      return mediaUrls;
    } catch (error) {
      console.error('Error uploading media:', error);
      setError('Failed to upload media. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isContentValid) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Upload media files first if any
      let mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        mediaUrls = await uploadMedia();
      }
      
      // Determine media type
      let mediaType = '';
      if (mediaUrls.length > 0) {
        mediaType = mediaFiles[0].type.startsWith('video/') ? 'video' : 'image';
      }
      
      // Create post with media attachments
      await dispatch(createPost({
        content: content.trim(),
        mediaUrls
      })).unwrap();
      
      // Reset form
      setContent('');
      setMediaFiles([]);
      setMediaPreviews([]);
      
      // Callback
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3, 
        mb: 3,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar 
          src={currentUser?.profilePicture || undefined} 
          alt={currentUser?.displayName || 'User'} 
        />
        <Box sx={{ width: '100%' }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={5}
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={handleContentChange}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: { 
                fontSize: '1rem',
                p: 1,
              }
            }}
          />
          
          {/* Media preview */}
          {mediaPreviews.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: mediaPreviews.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: 1, mt: 2 }}>
              {mediaPreviews.map((preview, index) => (
                <MediaPreviewContainer key={index}>
                  <DeleteButton 
                    size="small" 
                    className="delete-button"
                    onClick={() => handleRemoveMedia(index)}
                  >
                    <CloseIcon fontSize="small" />
                  </DeleteButton>
                  {mediaFiles[index]?.type.startsWith('video/') ? (
                    <VideoPreview controls src={preview} />
                  ) : (
                    <MediaPreview src={preview} alt={`Preview ${index}`} />
                  )}
                </MediaPreviewContainer>
              ))}
            </Box>
          )}
          
          {/* Upload progress */}
          {isUploading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                Uploading media ({uploadProgress}%)...
              </Typography>
            </Box>
          )}
          
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                color="primary" 
                onClick={handleImageButtonClick}
                disabled={isSubmitting || mediaFiles.length >= MAX_IMAGES || (mediaFiles.length > 0 && mediaFiles[0].type.startsWith('video/'))}
              >
                <ImageIcon />
              </IconButton>
              <IconButton 
                color="primary" 
                onClick={handleVideoButtonClick}
                disabled={isSubmitting || mediaFiles.length > 0}
              >
                <VideoIcon />
              </IconButton>
              <IconButton color="primary" disabled>
                <GifIcon />
              </IconButton>
              <IconButton color="primary" disabled>
                <EmojiIcon />
              </IconButton>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleMediaChange}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleMediaChange}
                accept="video/*"
                style={{ display: 'none' }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography 
                variant="body2" 
                color={charactersLeft < 0 ? 'error' : charactersLeft < 20 ? 'warning.main' : 'text.secondary'}
              >
                {charactersLeft}
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                disabled={isDisabled}
                onClick={handleSubmit}
                sx={{ borderRadius: 5, px: 3 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Đăng'
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default PostForm; 