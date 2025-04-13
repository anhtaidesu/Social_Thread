import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Avatar, 
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  useTheme
} from '@mui/material';
import { 
  ImageOutlined as ImageIcon,
  Clear as ClearIcon,
  GifBoxOutlined as GifIcon,
  TagOutlined as TagIcon,
  SentimentSatisfiedOutlined as EmojiIcon,
  LocationOnOutlined as LocationIcon
} from '@mui/icons-material';
import { createPost } from '../features/posts/postsSlice';
import type { AppDispatch, RootState } from '../app/store';
import { PostsState } from '../features/posts/postsSlice';
import { AuthState } from '../types';
import UserAvatar from '../components/UserAvatar';

const MAX_CONTENT_LENGTH = 500;
const MAX_IMAGES = 4;

const CreatePost: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth as AuthState);
  const { isLoading, error } = useSelector((state: RootState) => state.posts as PostsState);
  
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CONTENT_LENGTH) {
      setContent(newContent);
      setFormError('');
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    if (images.length + files.length > MAX_IMAGES) {
      setFormError(`You can upload a maximum of ${MAX_IMAGES} images`);
      return;
    }
    
    const newImages = [...images];
    const newImageUrls = [...imagePreviewUrls];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        newImages.push(file);
        newImageUrls.push(URL.createObjectURL(file));
      }
    });
    
    setImages(newImages);
    setImagePreviewUrls(newImageUrls);
    setFormError('');
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageUrls = [...imagePreviewUrls];
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newImageUrls[index]);
    
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImages(newImages);
    setImagePreviewUrls(newImageUrls);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && images.length === 0) {
      setFormError('Please enter some content or add an image');
      return;
    }
    
    const postData = {
      content: content.trim(),
      images: images.length > 0 ? images : undefined
    };
    
    const resultAction = await dispatch(createPost(postData));
    
    if (createPost.fulfilled.match(resultAction)) {
      // Post was created successfully
      setContent('');
      setImages([]);
      setImagePreviewUrls([]);
      navigate('/');
    }
  };
  
  if (!user) {
    return null; // Or a loading state
  }
  
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Create Thread
      </Typography>
      
      <Paper 
        sx={{ 
          p: 3, 
          mt: 2,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.threadsDark.cardBackground : theme.palette.threadsLight.cardBackground,
          border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.threadsDark.border : theme.palette.threadsLight.border}`,
          borderRadius: 2
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {formError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <UserAvatar
              src={user.profilePicture}
              username={user.username}
              sx={{ width: 40, height: 40 }}
            />
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user.username}
              </Typography>
              
              <TextField
                multiline
                fullWidth
                placeholder="What's happening?"
                value={content}
                onChange={handleContentChange}
                variant="standard"
                InputProps={{ disableUnderline: true }}
                sx={{ 
                  my: 2,
                  '& .MuiInputBase-input': {
                    fontSize: '1.1rem',
                  }
                }}
              />
              
              {imagePreviewUrls.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {imagePreviewUrls.map((url, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          position: 'relative',
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <img 
                          src={url} 
                          alt={`Upload preview ${index}`} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }} 
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            },
                            padding: '4px'
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.threadsDark.border : theme.palette.threadsLight.border}`,
                pt: 2
              }}>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <IconButton component="span" color="primary">
                      <ImageIcon />
                    </IconButton>
                  </label>
                  
                  <IconButton color="primary">
                    <GifIcon />
                  </IconButton>
                  
                  <IconButton color="primary">
                    <TagIcon />
                  </IconButton>
                  
                  <IconButton color="primary">
                    <EmojiIcon />
                  </IconButton>
                  
                  <IconButton color="primary">
                    <LocationIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography 
                    variant="body2" 
                    color={content.length > MAX_CONTENT_LENGTH * 0.9 ? 'error' : 'textSecondary'}
                  >
                    {content.length}/{MAX_CONTENT_LENGTH}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isLoading || (!content.trim() && images.length === 0) || content.length > MAX_CONTENT_LENGTH}
                    sx={{ borderRadius: 5, px: 3 }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Post'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreatePost; 