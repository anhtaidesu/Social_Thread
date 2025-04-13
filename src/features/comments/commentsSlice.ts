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
    
    console.log('Comments response:', response.data);
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to fetch comments');
    }
    
    // The API returns { status, data: { replies: [...], pagination: {...} } }
    // We need to extract the replies array
    const replies = response.data.data?.replies || [];
    return replies;
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
    console.log('Add comment response:', response.data);
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to add comment');
    }
    
    // The API returns a post structure, we need to transform it to a comment structure
    const postData = response.data.data.post;
    
    // Transform the post to a comment structure that our UI expects
    const comment: Comment = {
      id: postData.id,
      content: postData.content,
      post: postId,  // This is post ID
      likes: postData.likeCount || 0,
      likeCount: postData.likeCount || 0,
      isLiked: false,
      parentId: postData.parentId,
      repliesCount: 0,
      createdAt: postData.createdAt,
      updatedAt: postData.updatedAt,
      author: postData.profile || {
        id: postData.profileId,
        username: 'Unknown',
        displayName: 'Unknown User',
        profilePicture: null
      }
    };
    
    return comment;
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
  }
});

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
    
    if (response.data.status === 'error') {
      return rejectWithValue(response.data.message || 'Failed to reply to comment');
    }
    
    return response.data.data;
  } catch (error: any) {
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