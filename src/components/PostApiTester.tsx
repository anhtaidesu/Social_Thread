import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Paper, Divider, Switch, FormControlLabel } from '@mui/material';
import PostService from '../services/post.service';

/**
 * Component để kiểm tra các API post
 * Chỉ sử dụng trong môi trường phát triển
 */
const PostApiTester: React.FC = () => {
  const [postId, setPostId] = useState('');
  const [profileId, setProfileId] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [parentId, setParentId] = useState('');
  const [originalPostId, setOriginalPostId] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isRepost, setIsRepost] = useState(false);
  const [page, setPage] = useState('1');
  const [limit, setLimit] = useState('20');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async () => {
    setLoading(true);
    const mediaUrls = mediaUrl ? [mediaUrl] : [];
    const response = await PostService.createPost({
      content,
      mediaUrls,
      isPublic
    });
    setResult(response);
    setLoading(false);
  };

  const handleCreateRepost = async () => {
    setLoading(true);
    const response = await PostService.createRepost(originalPostId, content);
    setResult(response);
    setLoading(false);
  };

  const handleCreateReply = async () => {
    setLoading(true);
    const mediaUrls = mediaUrl ? [mediaUrl] : [];
    const response = await PostService.createReply(parentId, content, mediaUrls);
    setResult(response);
    setLoading(false);
  };

  const handleGetPost = async () => {
    setLoading(true);
    const response = await PostService.getPost(postId);
    setResult(response);
    setLoading(false);
  };

  const handleGetReplies = async () => {
    setLoading(true);
    const response = await PostService.getPostReplies(postId, parseInt(page), parseInt(limit));
    setResult(response);
    setLoading(false);
  };

  const handleGetProfilePosts = async () => {
    setLoading(true);
    const response = await PostService.getProfilePosts(profileId, parseInt(page), parseInt(limit));
    setResult(response);
    setLoading(false);
  };

  const handleDeletePost = async () => {
    setLoading(true);
    const response = await PostService.deletePost(postId);
    setResult(response);
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        API Post Tester
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Create Post
        </Typography>
        <TextField
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          size="small"
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <TextField
          label="Media URL"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
        <FormControlLabel
          control={
            <Switch 
              checked={isPublic} 
              onChange={(e) => setIsPublic(e.target.checked)} 
            />
          }
          label="Public Post"
        />
        <Button 
          variant="contained" 
          onClick={handleCreatePost}
          disabled={loading}
          sx={{ mt: 1 }}
        >
          Create Post
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Create Repost
        </Typography>
        <TextField
          label="Original Post ID"
          value={originalPostId}
          onChange={(e) => setOriginalPostId(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
        <TextField
          label="Additional Content (Optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          size="small"
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <Button 
          variant="contained" 
          onClick={handleCreateRepost}
          disabled={!originalPostId || loading}
        >
          Create Repost
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Create Reply
        </Typography>
        <TextField
          label="Parent Post ID"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
        <TextField
          label="Reply Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          size="small"
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <TextField
          label="Media URL (Optional)"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
        <Button 
          variant="contained" 
          onClick={handleCreateReply}
          disabled={!parentId || !content || loading}
        >
          Create Reply
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Get Post
        </Typography>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <TextField
            label="Post ID"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            size="small"
            sx={{ mr: 1, flexGrow: 1 }}
          />
          <Button 
            variant="contained" 
            onClick={handleGetPost}
            disabled={!postId || loading}
          >
            Get Post
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Get Replies
        </Typography>
        <TextField
          label="Post ID"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', mb: 1 }}>
          <TextField
            label="Page"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            size="small"
            sx={{ mr: 1, width: '100px' }}
            type="number"
          />
          <TextField
            label="Limit"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            size="small"
            sx={{ mr: 1, width: '100px' }}
            type="number"
          />
          <Button 
            variant="contained" 
            onClick={handleGetReplies}
            disabled={!postId || loading}
          >
            Get Replies
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Get Profile Posts
        </Typography>
        <TextField
          label="Profile ID or Username"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', mb: 1 }}>
          <TextField
            label="Page"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            size="small"
            sx={{ mr: 1, width: '100px' }}
            type="number"
          />
          <TextField
            label="Limit"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            size="small"
            sx={{ mr: 1, width: '100px' }}
            type="number"
          />
          <Button 
            variant="contained" 
            onClick={handleGetProfilePosts}
            disabled={!profileId || loading}
          >
            Get Profile Posts
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Delete Post
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <TextField
            label="Post ID"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            size="small"
            sx={{ mr: 1, flexGrow: 1 }}
          />
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeletePost}
            disabled={!postId || loading}
          >
            Delete Post
          </Button>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Result:
        </Typography>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            bgcolor: '#f5f5f5', 
            maxHeight: 300, 
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.85rem'
          }}
        >
          {loading ? (
            "Loading..."
          ) : result ? (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          ) : (
            "No result yet"
          )}
        </Paper>
      </Box>
    </Paper>
  );
};

export default PostApiTester; 