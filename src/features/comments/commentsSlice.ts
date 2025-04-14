import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Comment } from '../../types';
import axiosInstance from '../../utils/axiosConfig';

interface CommentsState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  isLoading: false,
  error: null,
};

// Fetch comments for a post
export const fetchComments = createAsyncThunk<
  Comment[],
  { postId: string; page?: number; limit?: number },
  { rejectValue: string }
>('comments/fetchComments', async (params, { rejectWithValue }) => {
  const { postId, page = 1, limit = 20 } = params;
  
  try {
    const response = await axiosInstance.get(`/api/v1/posts/${postId}/comments?page=${page}&limit=${limit}`);
    
    console.log('Comments API response:', response.data);
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to fetch comments');
    }
    
    // The API returns { status, data: { replies: [...], pagination: {...} } }
    // We need to extract the replies array
    const replies = response.data.data?.replies || [];
    
    // Debug: Log the first reply to examine its structure
    if (replies.length > 0) {
      console.log('First reply structure:', JSON.stringify(replies[0], null, 2));
    }
    
    // Ensure each comment has proper author information
    const validatedReplies = replies.map((reply: any) => {
      // Log the author info to see what's coming from the API
      console.log('Reply author data:', reply.author, 'profile data:', reply.profile);
      
      // Check for author info in different possible locations
      const authorData = reply.author || reply.profile || (reply.user ? {
        id: reply.user.id,
        userId: reply.user.id,
        username: reply.user.username,
        displayName: reply.user.displayName || reply.user.username,
        profilePicture: reply.user.profilePicture
      } : null);
      
      if (!authorData) {
        // If author is missing, add a placeholder
        reply.author = {
          id: reply.profileId || reply.userId || 'unknown',
          username: 'Unknown',
          displayName: 'Unknown User',
          profilePicture: null,
          createdAt: reply.createdAt || new Date().toISOString()
        };
      } else {
        // Make sure author has consistent structure
        reply.author = {
          id: authorData.id || authorData.userId || 'unknown',
          username: authorData.username || 'Unknown',
          displayName: authorData.displayName || authorData.username || 'Unknown User',
          profilePicture: authorData.profilePicture || null,
          createdAt: authorData.createdAt || reply.createdAt || new Date().toISOString()
        };
      }
      
      return reply;
    });
    
    return validatedReplies;
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
  }
});

// Add a comment to a post
export const addComment = createAsyncThunk<
  Comment,
  { postId: string; content: string },
  { rejectValue: string }
>('comments/addComment', async (params, { rejectWithValue }) => {
  const { postId, content } = params;
  
  try {
    const response = await axiosInstance.post(`/api/v1/posts/${postId}/comments`, { content });
    console.log('Add comment API response:', response.data);
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to add comment');
    }
    
    // The API returns a post structure, we need to transform it to a comment structure
    const postData = response.data.data.post;
    
    // Debug: Log the post data to examine its structure
    console.log('Posted comment data:', JSON.stringify(postData, null, 2));
    
    // Extract author information from various possible locations
    const authorData = postData.profile || postData.author || postData.user || null;
    console.log('Author data from response:', authorData);

    // Get the current user from the store as a fallback
    const currentUser = await getCurrentUser();
    console.log('Current user from store:', currentUser);
    
    // Transform the post to a comment structure that our UI expects
    const comment: Comment = {
      id: postData.id,
      content: postData.content,
      postId: postId,
      post: postId,
      likes: postData.likes || postData.likeCount || 0,
      likeCount: postData.likeCount || 0,
      isLiked: false,
      parentId: postData.parentId,
      repliesCount: postData.repliesCount || postData.replies?.length || 0,
      createdAt: postData.createdAt,
      updatedAt: postData.updatedAt,
      author: {
        id: postData.author?.id || postData.profile?.id || postData.profileId || 'unknown',
        username: postData.author?.username || postData.profile?.username || 'Unknown User',
        displayName: postData.author?.displayName || postData.profile?.displayName || postData.author?.fullName || postData.profile?.fullName || postData.author?.username || postData.profile?.username || 'Unknown User',
        profilePicture: postData.author?.profilePicture || postData.profile?.profilePicture || null,
        createdAt: postData.author?.createdAt || postData.profile?.createdAt || postData.createdAt,
      },
    };
    
    return comment;
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
  }
});

// Helper function to get current user data from Redux store
const getCurrentUser = async () => {
  try {
    // This is a simplified example - you'd need to adjust based on your actual state structure
    const response = await axiosInstance.get('/api/v1/profiles/me');
    if (response.data.status === 'success' && response.data.data.profile) {
      return response.data.data.profile;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Like a comment
export const likeComment = createAsyncThunk<
  { commentId: string },
  string,
  { rejectValue: string }
>('comments/likeComment', async (commentId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`/api/v1/comments/${commentId}/like`);
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to like comment');
    }
    
    return { commentId };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to like comment');
  }
});

// Unlike a comment
export const unlikeComment = createAsyncThunk<
  { commentId: string },
  string,
  { rejectValue: string }
>('comments/unlikeComment', async (commentId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/comments/${commentId}/like`);
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to unlike comment');
    }
    
    return { commentId };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to unlike comment');
  }
});

// Reply to a comment
export const replyToComment = createAsyncThunk<
  Comment,
  { postId: string; parentId: string; content: string },
  { rejectValue: string }
>('comments/replyToComment', async (params, { rejectWithValue }) => {
  const { postId, parentId, content } = params;
  
  try {
    const response = await axiosInstance.post(`/api/v1/posts/${postId}/comments`, { 
      content,
      parentId
    });
    
    console.log('Reply to comment API response:', response.data);
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to reply to comment');
    }
    
    // The API returns a post structure, we need to transform it to a comment structure
    const postData = response.data.data.post || response.data.data;
    
    // Debug: Log the post data to examine its structure
    console.log('Reply data:', JSON.stringify(postData, null, 2));
    
    // Extract author information from various possible locations
    const authorData = postData.profile || postData.author || postData.user || null;
    console.log('Reply author data from response:', authorData);

    // Get the current user from the store as a fallback
    const currentUser = await getCurrentUser();
    
    // Transform the post to a comment structure that our UI expects
    const comment: Comment = {
      id: postData.id,
      content: postData.content,
      postId: postId,
      post: postId,
      likes: postData.likes || postData.likeCount || 0,
      likeCount: postData.likeCount || 0,
      isLiked: false,
      parentId: postData.parentId || parentId,
      repliesCount: postData.repliesCount || postData.replies?.length || 0,
      createdAt: postData.createdAt,
      updatedAt: postData.updatedAt,
      author: {
        id: postData.author?.id || postData.profile?.id || postData.profileId || 'unknown',
        username: postData.author?.username || postData.profile?.username || 'Unknown User',
        displayName: postData.author?.displayName || postData.profile?.displayName || postData.author?.fullName || postData.profile?.fullName || postData.author?.username || postData.profile?.username || 'Unknown User',
        profilePicture: postData.author?.profilePicture || postData.profile?.profilePicture || null,
        createdAt: postData.author?.createdAt || postData.profile?.createdAt || postData.createdAt,
      },
    };
    
    return comment;
  } catch (error: any) {
    console.error('Error replying to comment:', error);
    return rejectWithValue(error.response?.data?.message || 'Failed to reply to comment');
  }
});

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch comments cases
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch comments';
      });

    // Add comment cases
    builder
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments.unshift(action.payload);
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to add comment';
      });

    // Like comment cases
    builder
      .addCase(likeComment.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        const comment = state.comments.find(c => c.id === commentId);
        if (comment) {
          comment.isLiked = true;
          comment.likes = (comment.likes || 0) + 1;
        }
      });

    // Unlike comment cases
    builder
      .addCase(unlikeComment.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        const comment = state.comments.find(c => c.id === commentId);
        if (comment) {
          comment.isLiked = false;
          comment.likes = Math.max((comment.likes || 0) - 1, 0);
        }
      });

    // Reply to comment cases
    builder
      .addCase(replyToComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(replyToComment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Find the parent comment and increment its replies count
        const parentComment = state.comments.find(c => c.id === action.payload.parentId);
        if (parentComment) {
          parentComment.repliesCount = (parentComment.repliesCount || 0) + 1;
        }
        // Add the reply to the comments list (depends on the UI implementation)
        state.comments.push(action.payload);
      })
      .addCase(replyToComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to reply to comment';
      });
  },
});

export const { clearComments } = commentsSlice.actions;

export default commentsSlice.reducer; 