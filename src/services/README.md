# Frontend Services

This directory contains service modules that handle API interactions with backend services. Each service encapsulates the logic for communicating with specific backend endpoints.

## Available Services

### ProfileService

The `ProfileService` provides methods for interacting with user profile-related endpoints:

- `getProfile(identifier)`: Get a user profile by username or ID
- `getCurrentProfile()`: Get the current user's profile
- `updateProfile(userData)`: Update the current user's profile
- `searchProfiles(query, page, limit)`: Search for profiles matching a query
- `getSuggestedProfiles(limit)`: Get suggested profiles to follow

### PostService

The `PostService` provides methods for interacting with post-related endpoints:

- `createPost(postData)`: Create a new post
- `createRepost(originalPostId, content)`: Create a repost of an existing post
- `createReply(parentId, content, mediaUrls)`: Create a reply to an existing post
- `getPost(id)`: Get a post by ID
- `getPostReplies(postId, page, limit)`: Get replies to a post
- `getProfilePosts(identifier, page, limit)`: Get posts from a user profile
- `deletePost(id)`: Delete a post

## Service Structure

Each service follows a consistent pattern:

1. Makes API calls using the configured axios instance
2. Returns a standardized response format:
   ```typescript
   {
     success: boolean;
     data: T | null;
     error: string | null;
   }
   ```
3. Handles errors and provides meaningful error messages

## Usage Example

```typescript
import PostService from '../services/post.service';

// Create a new post
const createPost = async () => {
  const result = await PostService.createPost({
    content: 'Hello world!',
    mediaUrls: ['https://example.com/image.jpg'],
    isPublic: true
  });
  
  if (result.success) {
    console.log('Post created:', result.data);
  } else {
    console.error('Error creating post:', result.error);
  }
};

// Get a post by ID
const getPost = async (postId) => {
  const result = await PostService.getPost(postId);
  
  if (result.success) {
    console.log('Post retrieved:', result.data);
  } else {
    console.error('Error retrieving post:', result.error);
  }
};
```

## Testing Services

You can use the `PostApiTester` and `ProfileApiTester` components to interactively test the service functions in development mode. 