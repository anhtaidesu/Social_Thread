import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, Divider } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { fetchFeed, createRepost } from '../features/posts/postsSlice';
import PostItem from '../components/PostItem';
import PostForm from '../components/PostForm';
import { Post } from '../types';
import PostService from '../services/post.service';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector((state: RootState) => state.posts) as {
    feed: Post[];
    isLoading: boolean;
    error: string | null;
  };
  const { feed, isLoading, error } = posts;
  
  const auth = useSelector((state: RootState) => state.auth) as {
    isAuthenticated: boolean;
  };
  const { isAuthenticated } = auth;
  
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFeed({ page: 1, limit: 20 }));
    }
  }, [dispatch, isAuthenticated]);
  
  const handleLike = async (postId: string) => {
    if (likingPosts.has(postId)) return;
    
    try {
      setLikingPosts(prev => new Set(prev).add(postId));
      
      // Call PostService.toggleLike
      const result = await PostService.toggleLike(postId);
      
      if (result.success) {
        // Refresh the feed after liking
        dispatch(fetchFeed({ page: 1, limit: 20 }));
      } else {
        console.error('Error toggling like:', result.error);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };
  
  const handleRepost = (postId: string) => {
    // Show dialog to confirm repost
    if (window.confirm('Repost this post?')) {
      dispatch(createRepost({ originalPostId: postId }))
        .unwrap()
        .then(() => {
          // Refresh feed after repost
          dispatch(fetchFeed({ page: 1, limit: 20 }));
        })
        .catch(error => {
          console.error('Error reposting:', error);
        });
    }
  };

  const handlePostCreated = () => {
    // Refresh the feed after a new post is created
    dispatch(fetchFeed({ page: 1, limit: 20 }));
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Welcome to Threads
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">
            Please log in or register to see your feed.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && feed.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && feed.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="error" variant="body1">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Trang chủ
      </Typography>
      
      {/* Post creation form */}
      <PostForm onPostCreated={handlePostCreated} />
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      {feed.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1">
              Bảng tin của bạn hiện đang trống. Hãy theo dõi người dùng khác để xem bài đăng của họ.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ mt: 2 }}>
          {feed.map((post: Post) => (
            <PostItem 
              key={post.id} 
              post={post} 
              onLike={handleLike}
              onRepost={handleRepost}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Home; 