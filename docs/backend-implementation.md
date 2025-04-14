# Backend Implementation Guide

## Required Backend Changes

To fully support the new frontend features, the following backend implementations are needed:

### 1. Update Post Endpoint

Add a PUT route to update posts in `post.route.js`:

```javascript
// Update post
router.put(
  '/:id',
  validate(idSchema, 'params'),
  authenticate,
  updatePost
);
```

Implement the `updatePost` controller function in `post.controller.js`:

```javascript
/**
 * Update a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isPublic } = req.body;
    const { profileId } = req.user;
    
    const post = await Post.findByPk(id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Ensure user owns the post
    if (post.profileId !== profileId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this post'
      });
    }
    
    // Update the post fields
    if (content !== undefined) {
      post.content = content;
    }
    
    if (isPublic !== undefined) {
      post.isPublic = isPublic;
    }
    
    await post.save();
    
    // Return the updated post
    return res.status(200).json({
      status: 'success',
      data: {
        post
      },
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update post'
    });
  }
};
```

### 2. Enhanced Delete Comment Functionality

Modify the `deletePost` controller function to also allow post owners to delete comments on their posts:

```javascript
export const deletePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { profileId } = req.user;
    
    const post = await Post.findByPk(id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Check if the user owns this post
    const isOwner = post.profileId === profileId;
    
    // If this is a comment (has a parentId), get the parent post to check if user is the parent post owner
    let isParentPostOwner = false;
    if (post.parentId) {
      const parentPost = await Post.findByPk(post.parentId);
      if (parentPost && parentPost.profileId === profileId) {
        isParentPostOwner = true;
      }
    }
    
    // User must either own the post/comment OR be the owner of the parent post if this is a comment
    if (!isOwner && !isParentPostOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this post'
      });
    }
    
    // Decrement parent's comment count if this was a reply
    if (post.parentId) {
      await Post.increment('commentCount', {
        by: -1,
        where: { id: post.parentId },
        transaction
      });
    }
    
    // Decrement profile's post count only if the user is the post author
    if (isOwner) {
      await Profile.increment('postCount', {
        by: -1,
        where: { id: profileId },
        transaction
      });
    }
    
    // Delete the post
    await post.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    return res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    
    console.error('Error deleting post:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete post'
    });
  }
};
```

### 3. Privacy Settings Implementation

Modify the Post model to include enhanced privacy settings:

```javascript
// In Post.model.js, update the schema:
const PostSchema = {
  // ... existing fields
  privacy: {
    type: DataTypes.ENUM('public', 'private', 'followers'),
    allowNull: false,
    defaultValue: 'public'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
};

// Add a hook to sync isPublic with privacy setting
Post.beforeSave((post) => {
  if (post.privacy === 'public') {
    post.isPublic = true;
  } else {
    post.isPublic = false;
  }
});
```

Update the `getPost` and `getFeed` functions to respect privacy settings:

```javascript
// In getPost:
export const getPost = async (req, res) => {
  try {
    // ... existing code
    
    // For private posts, check if the requester is the owner
    if (!post.isPublic && (!currentUser || post.profileId !== currentUser.profileId)) {
      // For 'followers' privacy, check if the user is a follower
      if (post.privacy === 'followers' && currentUser) {
        const isFollowing = await Follow.findOne({
          where: {
            followerId: currentUser.profileId,
            followingId: post.profileId
          }
        });
        
        if (!isFollowing) {
          return res.status(403).json({
            status: 'error',
            message: 'This post is only visible to followers'
          });
        }
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'This post is private'
        });
      }
    }
    
    // ... rest of function
  }
};

// In getFeed:
export const getFeed = async (req, res) => {
  try {
    // ... existing code
    
    // Modify query to respect privacy settings
    const posts = await Post.findAndCountAll({
      where: {
        profileId: { [Op.in]: followingIds },
        parentId: null, // Only get original posts, not replies
        [Op.or]: [
          { isPublic: true },
          { 
            [Op.and]: [
              { privacy: 'followers' },
              { profileId: { [Op.in]: followingIds } }
            ]
          },
          { profileId: profileId } // Always include user's own posts
        ]
      },
      // ... rest of query
    });
    
    // ... rest of function
  }
};
```

## Frontend Enhancements

The frontend has already been updated with the following features:

1. Post privacy management with options for public, private, and followers-only
2. Post content editing functionality 
3. Comment management for post owners with the ability to delete any comment

These features connect to the backend through the `updatePost` Redux action and the `PostService` methods. 