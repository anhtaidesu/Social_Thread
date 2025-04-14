import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  IconButton, 
  Divider,
  Grid as MuiGrid,
  CardMedia,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel
} from '@mui/material';
import { 
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as CommentIcon,
  RepeatOutlined as RepostIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as PrivacyIcon,
  Public as PublicIcon,
  People as PeopleIcon,
  Comment as CommentsIcon,
  Block as BlockIcon,
  Info as InfoIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { formatDistance } from 'date-fns';
import type { AppDispatch, RootState } from '../app/store';
import type { Post, User, Comment } from '../types';
import UserAvatar from './UserAvatar';
import { deletePost, updatePost } from '../features/posts/postsSlice';
import { toast } from 'react-toastify';
import PostService from '../services/post.service';

interface PostItemProps {
  post: Post;
  onLike?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

interface CommentItemProps {
  comment: Comment;
  onDelete: (commentId: string) => void;
  onEdit?: (commentId: string, newContent: string) => void;
  currentUser: User | null;
}

const Grid = MuiGrid;

const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete, onEdit, currentUser }) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content || '');
  
  // Add ownership check for comments using the same comprehensive approach as posts
  const isCommentOwner = currentUser && (
    comment.profileId === currentUser.id || 
    comment.author?.id === currentUser.id || 
    comment.profile?.id === currentUser.id || 
    comment.author?.userId === currentUser.id || 
    comment.profile?.userId === currentUser.id ||
    currentUser.userId === comment.author?.userId ||
    currentUser.userId === comment.profile?.userId ||
    comment.profileId === currentUser.userId ||
    comment.author?.username === currentUser.username ||
    comment.profile?.username === currentUser.username
  );
  
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  
  const handleDelete = () => {
    handleMenuClose();
    onDelete(comment.id);
  };
  
  const handleEdit = () => {
    handleMenuClose();
    setIsEditing(true);
  };
  
  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(comment.id, editedContent);
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(comment.content || '');
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        mb: 2, 
        p: 2, 
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <UserAvatar 
        src={comment.author?.profilePicture}
        username={comment.author?.username || ''}
        sx={{ width: 32, height: 32, mr: 2 }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2">
            {comment.author?.username}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
            </Typography>
            <IconButton 
              size="small"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
            >
              {isCommentOwner ? (
                <>
                  <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                      <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit Comment</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleDelete}>
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Delete Comment</ListItemText>
                  </MenuItem>
                </>
              ) : (
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <BlockIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Report Comment</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>
        {isEditing ? (
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={handleCancelEdit}
                size="small"
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSaveEdit}
                size="small"
              >
                Save
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2">{comment.content}</Typography>
        )}
      </Box>
    </Box>
  );
};

const PostItem: React.FC<PostItemProps> = ({ post, onLike, onRepost, onComment }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openSettings = Boolean(anchorEl);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content || '');
  const [commentContent, setCommentContent] = useState('');
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'private' | 'followers'>(
    (post as any).privacy || (post.isPublic === false ? 'private' : 'public')
  );
  const [openPrivacyDialog, setOpenPrivacyDialog] = useState(false);
  const [openCommentsManager, setOpenCommentsManager] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [debugForceOwnership, setDebugForceOwnership] = useState(false);
  const [debugModalOpen, setDebugModalOpen] = useState(false);
  
  // Xử lý trường hợp API trả về profile thay vì author
  const authorData = post.author || post.profile;
  
  // Nếu không có cả author và profile, tạo author mặc định
  const author: User = authorData || {
    id: 'unknown',
    username: 'Unknown User',
    profilePicture: undefined,
    fullName: undefined,
    createdAt: new Date().toISOString(),
  };
  
  // Add an effect to listen for a special debug key sequence (shift+ctrl+O)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Check for Shift+Ctrl+O key combination
        if (e.shiftKey && e.ctrlKey && e.key === 'O') {
          setDebugForceOwnership(prev => !prev);
          toast.info(`Debug mode: Post ownership ${!debugForceOwnership ? 'forced' : 'normal'}`);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [debugForceOwnership]);
  
  // Update the isPostOwner check to respect the debug force ownership mode
  const isPostOwner = debugForceOwnership || (currentUser && (
    // Check all possible ID fields and formats
    post.profileId === currentUser.id || 
    post.author?.id === currentUser.id || 
    post.profile?.id === currentUser.id || 
    post.author?.userId === currentUser.id || 
    post.profile?.userId === currentUser.id ||
    // Check userId against userId
    currentUser.userId === post.author?.userId ||
    currentUser.userId === post.profile?.userId ||
    // Check profileId against userId (in case they're mixed up)
    post.profileId === currentUser.userId ||
    // If username matches (as a fallback)
    post.author?.username === currentUser.username ||
    post.profile?.username === currentUser.username
  ));
  
  // Enhance debug logging with more detailed information
  useEffect(() => {
    if (currentUser && process.env.NODE_ENV === 'development') {
      console.log('Post ownership details:', { 
        postId: post.id,
        postContent: post.content?.substring(0, 30),
        // Post IDs
        postProfileId: post.profileId, 
        postAuthorId: post.author?.id,
        postAuthorUserId: post.author?.userId,
        postProfileObjId: post.profile?.id,
        postProfileUserId: post.profile?.userId,
        // User IDs
        currentUserId: currentUser?.id,
        currentUserUserId: currentUser?.userId,
        // Usernames
        currentUsername: currentUser?.username,
        postAuthorUsername: post.author?.username,
        postProfileUsername: post.profile?.username,
        // Result
        isPostOwner,
        // Check results
        check1: post.profileId === currentUser.id,
        check2: post.author?.id === currentUser.id, 
        check3: post.profile?.id === currentUser.id,
        check4: post.author?.userId === currentUser.id,
        check5: post.profile?.userId === currentUser.id,
        check6: currentUser.userId === post.author?.userId,
        check7: currentUser.userId === post.profile?.userId,
        check8: post.profileId === currentUser.userId,
        check9: post.author?.username === currentUser.username,
        check10: post.profile?.username === currentUser.username
      });
    }
  }, [post.id, currentUser]);
  
  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };
  
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${author.id}`);
  };
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(post.id);
    }
  };
  
  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComment) {
      onComment(post.id);
    } else {
      navigate(`/post/${post.id}`);
    }
  };
  
  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRepost) {
      onRepost(post.id);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleSettingsClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  const handleEditPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCloseSettingsMenu();
    
    if (!isPostOwner) {
      toast.error("You don't have permission to edit this post");
      return;
    }
    
    setIsEditing(true);
  };

  const handleDeletePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCloseSettingsMenu();
    
    if (!isPostOwner) {
      toast.error("You don't have permission to delete this post");
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      dispatch(deletePost(post.id))
        .unwrap()
        .then(() => {
          toast.success('Post deleted successfully');
        })
        .catch((error) => {
          console.error('Error deleting post:', error);
          toast.error(error.message || 'Failed to delete post');
        });
    }
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isPostOwner) {
      toast.error("You don't have permission to edit this post");
      setIsEditing(false);
      return;
    }
    
    console.log('Saving edited post', post.id, editedContent);
    
    // Use the Redux action to update the post
    dispatch(updatePost({ 
      id: post.id, 
      content: editedContent 
    }))
      .unwrap()
      .then(() => {
        toast.success('Post updated successfully');
        setIsEditing(false);
      })
      .catch((error) => {
        console.error('Error updating post:', error);
        toast.error(error.message || 'Failed to update post');
      });
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  // Handle comment management
  const handleOpenCommentsManager = () => {
    setOpenCommentsManager(true);
    fetchComments();
  };

  const handleCloseCommentsManager = () => {
    setOpenCommentsManager(false);
  };

  const fetchComments = async () => {
    if (!post.id) return;
    
    setLoadingComments(true);
    try {
      const response = await PostService.getPostReplies(post.id);
      if (response.success && response.data) {
        setComments(response.data.posts);
      } else {
        toast.error('Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error loading comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      // Find the comment to check ownership
      const commentToDelete = comments.find(comment => comment.id === commentId);
      if (!commentToDelete) {
        toast.error('Comment not found');
        return;
      }
      
      // Check if user owns the comment
      const commentAuthorId = commentToDelete.author?.id;
      const commentProfileId = commentToDelete.profileId;
      
      const isCommentOwner = currentUser && (
        commentToDelete.author?.id === currentUser.id || 
        commentToDelete.profileId === currentUser.id ||
        commentToDelete.author?.userId === currentUser.id ||
        currentUser.userId === commentToDelete.author?.userId ||
        commentToDelete.author?.username === currentUser.username
      );
      
      // Allow post owner and comment owner to delete comments
      if (!isPostOwner && !isCommentOwner) {
        toast.error("You don't have permission to delete this comment");
        return;
      }
      
      if (window.confirm('Are you sure you want to delete this comment?')) {
        const response = await PostService.deletePost(commentId);
        if (response.success) {
          toast.success('Comment deleted successfully');
          // Remove comment from state
          setComments(comments.filter(comment => comment.id !== commentId));
          // Update comment count on post
          if (post.commentCount) post.commentCount--;
          if (post.commentsCount) post.commentsCount--;
        } else {
          toast.error(response.error || 'Failed to delete comment');
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error deleting comment');
    }
  };

  // Add comment editing functionality
  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      // Find the comment to edit
      const commentToEdit = comments.find(comment => comment.id === commentId);
      if (!commentToEdit) {
        toast.error('Comment not found');
        return;
      }
      
      // Check if user owns the comment
      const isCommentOwner = currentUser && (
        commentToEdit.author?.id === currentUser.id || 
        commentToEdit.profileId === currentUser.id ||
        commentToEdit.author?.userId === currentUser.id ||
        currentUser.userId === commentToEdit.author?.userId ||
        commentToEdit.author?.username === currentUser.username
      );
      
      if (!isCommentOwner) {
        toast.error("You don't have permission to edit this comment");
        return;
      }
      
      // Call API to update the comment
      const response = await PostService.updatePost({
        id: commentId,
        content: newContent
      });
      
      if (response.success) {
        toast.success('Comment updated successfully');
        
        // Update comment in state
        setComments(comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: newContent, updatedAt: new Date().toISOString() } 
            : comment
        ));
      } else {
        toast.error(response.error || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error updating comment');
    }
  };

  // Privacy dialog handlers
  const handleOpenPrivacyDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
    
    if (!isPostOwner) {
      toast.error("You don't have permission to change privacy settings for this post");
      return;
    }
    
    setOpenPrivacyDialog(true);
  };

  const handleClosePrivacyDialog = () => {
    setOpenPrivacyDialog(false);
  };

  const handleSavePrivacy = () => {
    if (!isPostOwner) {
      toast.error("You don't have permission to change this post's privacy settings");
      setOpenPrivacyDialog(false);
      return;
    }
    
    // Use the Redux action to update the post privacy
    dispatch(updatePost({ 
      id: post.id, 
      privacy: postPrivacy,
      isPublic: postPrivacy === 'public' 
    }))
      .unwrap()
      .then(() => {
        toast.success(`Post is now ${postPrivacy}`);
        // Update the post object using type assertion
        (post as any).privacy = postPrivacy;
        post.isPublic = postPrivacy === 'public';
        setOpenPrivacyDialog(false);
      })
      .catch((error) => {
        console.error('Error updating privacy:', error);
        toast.error(error.message || 'Failed to update privacy settings');
      });
  };

  // Basic safe check to ensure post is properly initialized
  useEffect(() => {
    if (!post) {
      console.error('PostItem received null or undefined post');
    } else if (!post.id) {
      console.error('PostItem received post without id:', post);
    }
  }, [post]);

  // Safely initialize mediaUrls
  const [parsedMediaUrls, setParsedMediaUrls] = useState<string[]>([]);
  
  useEffect(() => {
    try {
      if (post && post.mediaUrls) {
        if (typeof post.mediaUrls === 'string') {
          try {
            const parsed = JSON.parse(post.mediaUrls);
            setParsedMediaUrls(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            console.error('Error parsing mediaUrls string:', e);
            setParsedMediaUrls([]);
          }
        } else if (Array.isArray(post.mediaUrls)) {
          setParsedMediaUrls(post.mediaUrls);
        } else {
          setParsedMediaUrls([]);
        }
      } else {
        setParsedMediaUrls([]);
      }
    } catch (error) {
      console.error('Error processing mediaUrls:', error);
      setParsedMediaUrls([]);
    }
  }, [post]);

  // Add the necessary functions near the other handler functions
  const handlePrivacySettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
    
    if (!isPostOwner) {
      toast.error("You don't have permission to change privacy settings for this post");
      return;
    }
    
    setOpenPrivacyDialog(true);
  };

  const handleCloseSettingsMenu = () => {
    setAnchorEl(null);
  };

  // Add debug modal open/close handlers 
  const handleOpenDebugModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDebugModalOpen(true);
  };

  const handleCloseDebugModal = () => {
    setDebugModalOpen(false);
  };

  // Add a function to test force ownership
  const toggleDebugForceOwnership = () => {
    setDebugForceOwnership(prev => !prev);
    toast.info(`Debug mode: Post ownership ${!debugForceOwnership ? 'forced' : 'normal'}`);
  };

  // Place this just before the return statement:
  // Debug features should only be available on your own posts
  const showDebugFeatures = process.env.NODE_ENV === 'development' && isPostOwner;

  return (
    <>
      <Card 
        sx={{ 
          mb: 2, 
          cursor: isEditing ? 'default' : 'pointer',
          borderRadius: 2,
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          },
          overflow: 'visible',
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' 
              ? theme.palette.threadsDark.cardBackground 
              : theme.palette.threadsLight.cardBackground
        }}
        onClick={isEditing ? undefined : handlePostClick}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <UserAvatar 
              src={author.profilePicture}
              username={author.username}
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 2,
                cursor: 'pointer'
              }}
              onClick={handleProfileClick}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="subtitle1" 
                  component="span" 
                  fontWeight="bold"
                  onClick={handleProfileClick}
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {author.username}
                  {showDebugFeatures && (
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                      <Typography 
                        component="span" 
                        variant="caption" 
                        sx={{ 
                          color: isPostOwner ? 'green' : 'red',
                          fontWeight: 'bold',
                          backgroundColor: isPostOwner ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                          px: 0.5,
                          borderRadius: 1
                        }}
                      >
                        {debugForceOwnership ? "FORCED" : (isPostOwner ? "✓" : "✗")}
                      </Typography>
                    </Box>
                  )}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    aria-label="settings"
                    onClick={handleSettingsClick}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>
              {(author.fullName || author.displayName) && (
                <Typography variant="body2" color="text.secondary">
                  {author.displayName || author.fullName}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={openSettings}
            onClose={handleSettingsClose}
            onClick={(e) => e.stopPropagation()}
          >
            {isPostOwner && (
              <>
                <MenuItem onClick={handlePrivacySettings}>
                  <ListItemIcon>
                    <PrivacyIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Privacy Settings</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleEditPost}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit Post</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDeletePost}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete Post</ListItemText>
                </MenuItem>
                {(post.commentCount !== undefined || post.commentsCount !== undefined) && 
                  (post.commentCount || post.commentsCount || 0) > 0 && (
                  <MenuItem onClick={handleOpenCommentsManager}>
                    <ListItemIcon>
                      <CommentsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Manage Comments</ListItemText>
                  </MenuItem>
                )}
                {showDebugFeatures && (
                  <>
                    <Divider />
                    <MenuItem onClick={(e) => {
                      e.stopPropagation();
                      toggleDebugForceOwnership();
                      handleCloseSettingsMenu();
                    }}>
                      <ListItemIcon>
                        <BugReportIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{debugForceOwnership ? "Disable Force Ownership" : "Force Ownership (Debug)"}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleOpenDebugModal}>
                      <ListItemIcon>
                        <InfoIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Show Debug Info</ListItemText>
                    </MenuItem>
                  </>
                )}
              </>
            )}
            {!isPostOwner && (
              <MenuItem onClick={handleCloseSettingsMenu}>
                <ListItemIcon>
                  <BlockIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Report Post</ListItemText>
              </MenuItem>
            )}
          </Menu>
          
          <CardContent sx={{ pt: 2, pb: 1 }}>
            {isEditing ? (
              <Box onClick={(e) => e.stopPropagation()}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={8}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  variant="outlined"
                  placeholder="Edit your post..."
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    onClick={handleCancelEdit}
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSaveEdit}
                    size="small"
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                {post.content && (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {post.content}
                  </Typography>
                )}
                
                {parsedMediaUrls && parsedMediaUrls.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {parsedMediaUrls.map((url: string, index: number) => (
                      <img 
                        key={index}
                        src={url}
                        alt={`Media ${index}`}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 300, 
                          borderRadius: 8,
                          marginBottom: 8
                        }}
                      />
                    ))}
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </CardContent>
        
        <Divider />
        
        <CardActions sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex' }}>
            <Tooltip title={post.isLiked ? "Unlike" : "Like"}>
              <IconButton onClick={handleLike} size="small" color={post.isLiked ? "error" : "inherit"}>
                {post.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {post.likeCount || post.likesCount || 0}
            </Typography>
            
            <Tooltip title="Comment">
              <IconButton size="small" onClick={handleComment}>
                <CommentIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {post.commentCount || post.commentsCount || 0}
            </Typography>
            
            <Tooltip title="Repost">
              <IconButton size="small" onClick={handleRepost}>
                <RepostIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {post.repostCount || post.repostsCount || 0}
            </Typography>
            
            <Tooltip title="Share">
              <IconButton size="small">
                <SendIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}
          </Typography>
        </CardActions>
      </Card>

      {/* Privacy Dialog */}
      <Dialog
        open={openPrivacyDialog}
        onClose={handleClosePrivacyDialog}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="privacy-dialog-title"
      >
        <DialogTitle id="privacy-dialog-title">Privacy Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose who can see your post.
          </DialogContentText>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              value={postPrivacy}
              onChange={(e) => setPostPrivacy(e.target.value as 'public' | 'private' | 'followers')}
            >
              <FormControlLabel 
                value="public" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PublicIcon sx={{ mr: 1 }} />
                    <Typography>Public - Anyone can see</Typography>
                  </Box>
                } 
              />
              <FormControlLabel 
                value="private" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PrivacyIcon sx={{ mr: 1 }} />
                    <Typography>Private - Only you can see</Typography>
                  </Box>
                } 
              />
              <FormControlLabel 
                value="followers" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ mr: 1 }} />
                    <Typography>Followers - Only people who follow you can see</Typography>
                  </Box>
                } 
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrivacyDialog}>Cancel</Button>
          <Button onClick={handleSavePrivacy} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments Manager Dialog */}
      <Dialog
        open={openCommentsManager}
        onClose={handleCloseCommentsManager}
        maxWidth="md"
        fullWidth
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="comments-dialog-title"
      >
        <DialogTitle id="comments-dialog-title">
          {isPostOwner ? "Manage Comments" : "View Comments"}
        </DialogTitle>
        <DialogContent>
          {/* Add defensive checks for comments array */}
          {loadingComments ? (
            <Typography>Loading comments...</Typography>
          ) : (
            <>
              {/* Add a new comment form for posts you own */}
              {isPostOwner && (
                <Box sx={{ mb: 3, mt: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="Add a reply to your post..."
                    variant="outlined"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={async () => {
                        if (!commentContent.trim()) return;
                        
                        try {
                          const response = await PostService.createReply(post.id, commentContent);
                          if (response.success && response.data) {
                            toast.success('Reply added successfully');
                            setCommentContent('');
                            // Add the new comment to the list
                            setComments([response.data, ...comments]);
                            // Update comment count
                            if (post.commentCount) post.commentCount++;
                            if (post.commentsCount) post.commentsCount++;
                          } else {
                            toast.error(response.error || 'Failed to add reply');
                          }
                        } catch (error) {
                          console.error('Error adding reply:', error);
                          toast.error('Error adding reply');
                        }
                      }}
                    >
                      Reply
                    </Button>
                  </Box>
                </Box>
              )}
              
              {!comments || comments.length === 0 ? (
                <Typography>No comments yet.</Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {comments.map((comment) => (
                    <CommentItem 
                      key={comment.id}
                      comment={comment}
                      onDelete={handleDeleteComment}
                      onEdit={handleEditComment}
                      currentUser={currentUser}
                    />
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommentsManager}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Debug Modal */}
      <Dialog
        open={debugModalOpen}
        onClose={handleCloseDebugModal}
        maxWidth="md"
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="debug-dialog-title"
      >
        <DialogTitle id="debug-dialog-title">Post Ownership Debug Information</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Post Information</Typography>
          <Box component="pre" sx={{ 
            backgroundColor: 'rgba(0,0,0,0.05)', 
            p: 2, 
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: '200px',
            fontSize: '12px'
          }}>
            {JSON.stringify({
              id: post.id,
              content: post.content ? (post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '')) : '',
              profileId: post.profileId,
              author: post.author ? {
                id: post.author.id,
                userId: post.author.userId,
                username: post.author.username
              } : null,
              profile: post.profile ? {
                id: post.profile.id,
                userId: post.profile.userId,
                username: post.profile.username
              } : null
            }, null, 2)}
          </Box>
          
          <Typography variant="h6" gutterBottom mt={3}>Current User Information</Typography>
          <Box component="pre" sx={{ 
            backgroundColor: 'rgba(0,0,0,0.05)', 
            p: 2, 
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: '200px',
            fontSize: '12px'
          }}>
            {JSON.stringify({
              id: currentUser?.id,
              userId: currentUser?.userId,
              username: currentUser?.username
            }, null, 2)}
          </Box>
          
          <Typography variant="h6" gutterBottom mt={3}>Ownership Checks</Typography>
          <Box component="table" sx={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '12px',
            '& th, & td': { 
              border: '1px solid rgba(0,0,0,0.1)',
              p: 1
            },
            '& th': {
              backgroundColor: 'rgba(0,0,0,0.05)'
            }
          }}>
            <thead>
              <tr>
                <th>Check</th>
                <th>Result</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>post.profileId === currentUser.id</td>
                <td style={{ color: post.profileId === currentUser?.id ? 'green' : 'red' }}>
                  {post.profileId === currentUser?.id ? '✓' : '✗'}
                </td>
                <td>{`${post.profileId || 'undefined'} === ${currentUser?.id || 'undefined'}`}</td>
              </tr>
              <tr>
                <td>post.author?.id === currentUser.id</td>
                <td style={{ color: post.author?.id === currentUser?.id ? 'green' : 'red' }}>
                  {post.author?.id === currentUser?.id ? '✓' : '✗'}
                </td>
                <td>{`${post.author?.id || 'undefined'} === ${currentUser?.id || 'undefined'}`}</td>
              </tr>
              <tr>
                <td>post.profile?.id === currentUser.id</td>
                <td style={{ color: post.profile?.id === currentUser?.id ? 'green' : 'red' }}>
                  {post.profile?.id === currentUser?.id ? '✓' : '✗'}
                </td>
                <td>{`${post.profile?.id || 'undefined'} === ${currentUser?.id || 'undefined'}`}</td>
              </tr>
              <tr>
                <td>post.author?.userId === currentUser.id</td>
                <td style={{ color: post.author?.userId === currentUser?.id ? 'green' : 'red' }}>
                  {post.author?.userId === currentUser?.id ? '✓' : '✗'}
                </td>
                <td>{`${post.author?.userId || 'undefined'} === ${currentUser?.id || 'undefined'}`}</td>
              </tr>
              <tr>
                <td>post.profile?.userId === currentUser.id</td>
                <td style={{ color: post.profile?.userId === currentUser?.id ? 'green' : 'red' }}>
                  {post.profile?.userId === currentUser?.id ? '✓' : '✗'}
                </td>
                <td>{`${post.profile?.userId || 'undefined'} === ${currentUser?.id || 'undefined'}`}</td>
              </tr>
              <tr>
                <td>currentUser.userId === post.author?.userId</td>
                <td style={{ color: currentUser?.userId === post.author?.userId ? 'green' : 'red' }}>
                  {currentUser?.userId === post.author?.userId ? '✓' : '✗'}
                </td>
                <td>{`${currentUser?.userId || 'undefined'} === ${post.author?.userId || 'undefined'}`}</td>
              </tr>
              <tr>
                <td>currentUser.userId === post.profile?.userId</td>
                <td style={{ color: currentUser?.userId === post.profile?.userId ? 'green' : 'red' }}>
                  {currentUser?.userId === post.profile?.userId ? '✓' : '✗'}
                </td>
                <td>{`${currentUser?.userId || 'undefined'} === ${post.profile?.userId || 'undefined'}`}</td>
              </tr>
              <tr>
                <td>post.profileId === currentUser.userId</td>
                <td style={{ color: post.profileId === currentUser?.userId ? 'green' : 'red' }}>
                  {post.profileId === currentUser?.userId ? '✓' : '✗'}
                </td>
                <td>{`${post.profileId || 'undefined'} === ${currentUser?.userId || 'undefined'}`}</td>
              </tr>
              <tr>
                <td>post.author?.username === currentUser.username</td>
                <td style={{ color: post.author?.username === currentUser?.username ? 'green' : 'red' }}>
                  {post.author?.username === currentUser?.username ? '✓' : '✗'}
                </td>
                <td>{`${post.author?.username || 'undefined'} === ${currentUser?.username || 'undefined'}`}</td>
              </tr>
              <tr>
                <td>post.profile?.username === currentUser.username</td>
                <td style={{ color: post.profile?.username === currentUser?.username ? 'green' : 'red' }}>
                  {post.profile?.username === currentUser?.username ? '✓' : '✗'}
                </td>
                <td>{`${post.profile?.username || 'undefined'} === ${currentUser?.username || 'undefined'}`}</td>
              </tr>
            </tbody>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDebugForceOwnership} color="warning">
            {debugForceOwnership ? "Disable Force Ownership" : "Force Ownership (Debug)"}
          </Button>
          <Button onClick={handleCloseDebugModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostItem; 