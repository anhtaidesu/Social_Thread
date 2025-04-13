import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, ErrorResponse } from '../../types';
import PostService from '../../services/post.service';

// API URL của Social Service
const SOCIAL_API_URL = process.env.REACT_APP_SOCIAL_API_URL || 'http://localhost:8081';

export interface PostsState {
  feed: Post[];
  userPosts: Post[];
  singlePost: Post | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  feed: [],
  userPosts: [],
  singlePost: null,
  isLoading: false,
  error: null,
};

// Fetch single post
export const fetchPostById = createAsyncThunk<
  Post,
  string,
  { rejectValue: ErrorResponse }
>('posts/fetchPostById', async (postId, { rejectWithValue }) => {
  try {
    console.log(`Fetching post with ID: ${postId}`);
    const result = await PostService.getPost(postId);
    
    if (!result.success) {
      return rejectWithValue({
        message: result.error || 'Failed to fetch post',
        status: 400,
      });
    }
    
    if (!result.data) {
      return rejectWithValue({
        message: 'Invalid post data format',
        status: 500,
      });
    }
    
    // Đảm bảo post có trường author
    if (result.data.profile && !result.data.author) {
      return {
        ...result.data,
        author: result.data.profile
      };
    }
    
    return result.data;
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to fetch post',
      status: 500,
    });
  }
});

// Create post
export const createPost = createAsyncThunk<
  Post,
  { content: string; mediaUrls?: string[]; isPublic?: boolean },
  { rejectValue: ErrorResponse }
>('posts/createPost', async (postData, { rejectWithValue }) => {
  try {
    console.log('Creating post with data:', postData);
    const result = await PostService.createPost(postData);
    
    if (!result.success) {
      return rejectWithValue({
        message: result.error || 'Failed to create post',
        status: 400,
      });
    }
    
    return result.data;
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to create post',
      status: 500,
    });
  }
});

// Create repost
export const createRepost = createAsyncThunk<
  Post,
  { originalPostId: string; content?: string },
  { rejectValue: ErrorResponse }
>('posts/createRepost', async (postData, { rejectWithValue }) => {
  try {
    console.log('Creating repost with data:', postData);
    const result = await PostService.createRepost(postData.originalPostId, postData.content);
    
    if (!result.success) {
      return rejectWithValue({
        message: result.error || 'Failed to create repost',
        status: 400,
      });
    }
    
    return result.data;
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to create repost',
      status: 500,
    });
  }
});

// Create reply
export const createReply = createAsyncThunk<
  Post,
  { parentId: string; content: string; mediaUrls?: string[] },
  { rejectValue: ErrorResponse }
>('posts/createReply', async (postData, { rejectWithValue }) => {
  try {
    console.log('Creating reply with data:', postData);
    const result = await PostService.createReply(
      postData.parentId, 
      postData.content, 
      postData.mediaUrls
    );
    
    if (!result.success) {
      return rejectWithValue({
        message: result.error || 'Failed to create reply',
        status: 400,
      });
    }
    
    return result.data;
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to create reply',
      status: 500,
    });
  }
});

// Fetch user posts
export const fetchUserPosts = createAsyncThunk<
  Post[],
  { identifier: string; page?: number; limit?: number },
  { rejectValue: ErrorResponse }
>('posts/fetchUserPosts', async (params, { rejectWithValue }) => {
  try {
    const { identifier, page, limit } = params;
    console.log(`Fetching posts for user: ${identifier}`);
    
    const result = await PostService.getProfilePosts(identifier, page, limit);
    
    if (!result.success) {
      return rejectWithValue({
        message: result.error || 'Failed to fetch user posts',
        status: 400,
      });
    }
    
    return result.data?.posts || [];
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to fetch user posts',
      status: 500,
    });
  }
});

// Fetch post replies
export const fetchPostReplies = createAsyncThunk<
  Post[],
  { postId: string; page?: number; limit?: number },
  { rejectValue: ErrorResponse }
>('posts/fetchPostReplies', async (params, { rejectWithValue }) => {
  try {
    const { postId, page, limit } = params;
    console.log(`Fetching replies for post: ${postId}`);
    
    const result = await PostService.getPostReplies(postId, page, limit);
    
    if (!result.success) {
      return rejectWithValue({
        message: result.error || 'Failed to fetch post replies',
        status: 400,
      });
    }
    
    return result.data?.posts || [];
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to fetch post replies',
      status: 500,
    });
  }
});

// Delete post
export const deletePost = createAsyncThunk<
  string,
  string,
  { rejectValue: ErrorResponse }
>('posts/deletePost', async (postId, { rejectWithValue }) => {
  try {
    console.log(`Deleting post: ${postId}`);
    
    const result = await PostService.deletePost(postId);
    
    if (!result.success) {
      return rejectWithValue({
        message: result.error || 'Failed to delete post',
        status: 400,
      });
    }
    
    return postId;
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to delete post',
      status: 500,
    });
  }
});

// Fetch feed posts
export const fetchFeed = createAsyncThunk<
  Post[],
  { page?: number; limit?: number },
  { rejectValue: ErrorResponse }
>('posts/fetchFeed', async (params, { rejectWithValue }) => {
  try {
    const { page, limit } = params;
    console.log(`Fetching feed with page ${page} and limit ${limit}`);
    
    const result = await PostService.getFeed(page, limit);
    
    if (!result.success) {
      return rejectWithValue({
        message: result.error || 'Failed to fetch feed',
        status: 400,
      });
    }
    
    return result.data?.posts || [];
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'Failed to fetch feed',
      status: 500,
    });
  }
});

// Posts slice
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.feed = [];
      state.userPosts = [];
      state.singlePost = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user posts cases
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch user posts';
      });

    // Fetch post by ID cases
    builder
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singlePost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch post';
      });

    // Create post cases
    builder
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = [action.payload, ...state.userPosts];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create post';
      });

    // Create repost cases
    builder
      .addCase(createRepost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRepost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = [action.payload, ...state.userPosts];
      })
      .addCase(createRepost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create repost';
      });

    // Create reply cases
    builder
      .addCase(createReply.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReply.fulfilled, (state, action) => {
        state.isLoading = false;
        // Check if we have the parent post in our state and update its comment count
        const parentId = action.meta.arg.parentId;
        if (state.singlePost && state.singlePost.id === parentId) {
          state.singlePost = {
            ...state.singlePost,
            commentsCount: (state.singlePost.commentsCount || 0) + 1
          };
        }
      })
      .addCase(createReply.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create reply';
      });

    // Delete post cases
    builder
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = state.userPosts.filter(post => post.id !== action.payload);
        if (state.singlePost && state.singlePost.id === action.payload) {
          state.singlePost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete post';
      });

    // Fetch feed cases
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch feed';
      });
  },
});

export const { clearPosts } = postsSlice.actions;

export default postsSlice.reducer; 