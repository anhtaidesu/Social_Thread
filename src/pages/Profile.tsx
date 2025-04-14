import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Divider,
  Paper,
  IconButton,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButtonProps,
  styled,
  Modal,
  TextField,
  Badge,
  Tooltip,
  LinearProgress,
  InputAdornment,
  Pagination,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  LinkOutlined as LinkIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { 
  fetchUserProfile, 
  fetchUserProfileByUserId,
  fetchUserProfileByUsername,
  followUser, 
  unfollowUser, 
  updateUserProfile,
  fetchUserFollowers,
  fetchUserFollowing
} from '../features/userProfile/userProfileSlice';
import { fetchUserPosts, createRepost, clearPosts, deletePost } from '../features/posts/postsSlice';
import type { AppDispatch, RootState } from '../app/store';
import PostItem from '../components/PostItem';
import UserList from '../components/UserList';
import UserAvatar from '../components/UserAvatar';
import PostService from '../services/post.service';
import Snackbar from '@mui/material/Snackbar';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
};

interface StyledIconButtonProps extends IconButtonProps {
  absolute?: boolean;
}

const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'absolute',
})<StyledIconButtonProps>(({ absolute, theme }) => ({
  position: absolute ? 'absolute' : 'relative',
  top: absolute ? 8 : 'auto',
  right: absolute ? 8 : 'auto',
  color: theme.palette.grey[500],
}));

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

interface DebugInfoProps {
  profile: any;
  currentUser: any;
  isOwnProfile: boolean;
  identifier: string | null;
  debugMode: boolean;
  toggleDebugMode: () => void;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ 
  profile, 
  currentUser, 
  isOwnProfile, 
  identifier,
  debugMode,
  toggleDebugMode 
}) => {
  // Gọi useParams trước câu lệnh điều kiện, không phụ thuộc vào debugMode
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const urlParams = new URLSearchParams(window.location.search);
  const queryParamId = urlParams.get('id');
  const urlId = userId || queryParamId;
  
  // Get Redux state for debugging
  const postsState = useSelector((state: RootState) => state.posts);
  
  // Điều kiện return sau khi đã gọi tất cả các hook
  if (!debugMode) return null;
  
  return (
    <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#f5f5f5' }}>
      <Typography variant="h6" color="primary">Debug Information</Typography>
      <Typography variant="body2"><strong>URL Identifier:</strong> {identifier || 'None'}</Typography>
      <Typography variant="body2"><strong>Is Own Profile:</strong> {isOwnProfile ? 'Yes' : 'No'}</Typography>
      
      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle2">URL Params:</Typography>
      <Box component="pre" sx={{ 
        maxHeight: 150, 
        overflow: 'auto', 
        fontSize: '0.75rem',
        p: 1,
        bgcolor: '#e0e0e0',
        borderRadius: 1
      }}>
        {JSON.stringify({
          path: window.location.pathname,
          userId,
          username,
          queryParamId,
          urlId
        }, null, 2)}
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="subtitle2">Current User:</Typography>
      {currentUser ? (
        <Box component="pre" sx={{ 
          maxHeight: 150, 
          overflow: 'auto', 
          fontSize: '0.75rem',
          p: 1,
          bgcolor: '#e0e0e0',
          borderRadius: 1
        }}>
          {JSON.stringify({
            id: currentUser.id,
            userId: currentUser.userId,
            username: currentUser.username,
            displayName: currentUser.displayName
          }, null, 2)}
        </Box>
      ) : (
        <Typography color="error">Not logged in</Typography>
      )}
      
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="subtitle2">Profile Data:</Typography>
      {profile ? (
        <Box component="pre" sx={{ 
          maxHeight: 150, 
          overflow: 'auto', 
          fontSize: '0.75rem',
          p: 1,
          bgcolor: '#e0e0e0',
          borderRadius: 1
        }}>
          {JSON.stringify({
            id: profile.id,
            userId: profile.userId,
            username: profile.username,
            displayName: profile.displayName,
            followersCount: profile.followersCount,
            followingCount: profile.followingCount,
            isFollowing: profile.isFollowing
          }, null, 2)}
        </Box>
      ) : (
        <Typography color="error">Profile not loaded</Typography>
      )}
      
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="subtitle2">Posts State:</Typography>
      <Box component="pre" sx={{ 
        maxHeight: 200, 
        overflow: 'auto', 
        fontSize: '0.75rem',
        p: 1,
        bgcolor: '#e0e0e0',
        borderRadius: 1
      }}>
        {JSON.stringify({
          postsLoading: postsState.isLoading,
          postsError: postsState.error,
          userPostsCount: postsState.userPosts.length,
          userPostsData: postsState.userPosts.map(p => ({
            id: p.id,
            content: p.content?.substring(0, 30) + (p.content && p.content.length > 30 ? '...' : ''),
            createdAt: p.createdAt
          }))
        }, null, 2)}
      </Box>
      
      <Button 
        variant="outlined" 
        size="small" 
        color="primary" 
        sx={{ mt: 1 }}
        onClick={toggleDebugMode}
      >
        Hide Debug Info
      </Button>
    </Box>
  );
};

const Profile: React.FC = () => {
  const theme = useTheme();
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Lấy identifier từ URL param
  const identifier = username ? username : userId;
  
  // Lấy ID từ URL param (có thể từ đường dẫn hoặc từ query parameters)
  const urlParams = new URLSearchParams(window.location.search);
  const queryParamId = urlParams.get('id');
  
  // ID có thể là userId từ path, hoặc từ query parameter id
  const urlId = userId || queryParamId;
  
  // Log thông tin chi tiết về identifier và ID
  console.log('URL Params:', { 
    path: window.location.pathname,
    userId, 
    username, 
    identifier,
    queryParamId,
    urlId
  });
  
  const { profile, followers, following, isLoading: profileLoading, error: profileError } = useSelector((state: RootState) => state.userProfile); 
  const { userPosts, isLoading: postsLoading } = useSelector((state: RootState) => state.posts); 
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    displayName: '',
    bio: '',
    profilePicture: ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formErrors, setFormErrors] = useState({
    username: '',
    displayName: '',
    bio: ''
  });
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [debugMode, setDebugMode] = useState<boolean>(false);
  
  // Add new state variables for managing post deletion and reposts
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [repostsFilter, setRepostsFilter] = useState<'all' | 'created' | 'reposted'>('all');
  
  // Add these state variables back near the other state variables (around line 314)
  const [postMenuAnchor, setPostMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // Enhanced isOwnProfile check with detailed logging
  const isOwnProfile = React.useMemo(() => {
    if (!currentUser || !profile) return false;
    
    // Compare userId if it exists in both objects
    const userIdMatch = currentUser.userId && profile.userId && currentUser.userId === profile.userId;
    
    // Or compare profile IDs directly
    const profileIdMatch = currentUser.id === profile.id;
    
    // Also check username as a fallback
    const usernameMatch = currentUser.username === profile.username;
    
    // Compare with URL ID param (userId from path or id from query param)
    const urlIdMatch = urlId ? (urlId === currentUser.id || urlId === currentUser.userId) : false;
    
    // Check if URL username matches current user
    const urlUsernameMatch = username ? username.replace(/^@/, '') === currentUser.username : false;
    
    const result = userIdMatch || profileIdMatch || usernameMatch || urlIdMatch || urlUsernameMatch;
    
    console.log('isOwnProfile check:', { 
      userIdMatch, 
      profileIdMatch, 
      usernameMatch,
      urlIdMatch,
      urlUsernameMatch,
      currentUserId: currentUser.id,
      currentUserUserId: currentUser.userId,
      profileId: profile.id,
      profileUserId: profile.userId,
      urlId,
      currentUserUsername: currentUser.username,
      profileUsername: profile.username,
      result 
    });
    
    return result;
  }, [currentUser, profile, urlId, username]);
  
  const isFollowing = profile?.isFollowing || false;
  
  useEffect(() => {
    if (identifier) {
      console.log(`[Profile] Fetching profile for identifier: ${identifier}, userId: ${userId}, username: ${username}, urlId: ${urlId}`);
      
      // Reset loading state and clear existing posts
      dispatch(clearPosts());
      
      // Determine the best identifier to use for post fetching
      let postIdentifier = '';
      
      // Trường hợp 1: Tham số username được cung cấp trong URL (/@username)
      if (username) {
        console.log('[Profile] Fetching by username route:', username);
        const cleanUsername = username.replace(/^@/, ''); // Loại bỏ @ nếu có
        console.log('[Profile] Clean username:', cleanUsername);
        postIdentifier = cleanUsername;
        
        // Thử fetchUserProfileByUsername trước
        dispatch(fetchUserProfileByUsername(cleanUsername))
          .unwrap()
          .then(profile => {
            console.log('[Profile] Successfully fetched profile by username:', profile);
            // Use userId from profile as identifier if available for better post fetching
            if (profile.id) {
              console.log('[Profile] Using profile.id for posts:', profile.id);
              postIdentifier = profile.id;
              dispatch(fetchUserPosts({ identifier: profile.id, page: 1, limit: 20 }));
            } else if (profile.userId) {
              console.log('[Profile] Using profile.userId as fallback for posts:', profile.userId);
              postIdentifier = profile.userId;
              dispatch(fetchUserPosts({ identifier: profile.userId, page: 1, limit: 20 }));
            } else {
              dispatch(fetchUserPosts({ identifier: cleanUsername, page: 1, limit: 20 }));
            }
          })
          .catch((error) => {
            console.log('[Profile] Username lookup failed, trying general lookup as fallback:', error);
            // Nếu thất bại, thử fetchUserProfile thông thường
            dispatch(fetchUserProfile(cleanUsername));
            dispatch(fetchUserPosts({ identifier: cleanUsername, page: 1, limit: 20 }));
          });
      } 
      // Trường hợp 2: Tham số userId được cung cấp trong URL (/profile/:userId)
      else if (userId) {
        console.log('[Profile] Fetching by userId route:', userId);
        postIdentifier = userId;
        
        // Thử fetchUserProfileByUserId trước
        dispatch(fetchUserProfileByUserId(userId))
          .unwrap()
          .then(profile => {
            console.log('[Profile] Successfully fetched profile by userId:', profile);
            // Use id directly from profile for posts
            if (profile.id) {
              console.log('[Profile] Using profile.id for posts:', profile.id);
              dispatch(fetchUserPosts({ identifier: profile.id, page: 1, limit: 20 }));
            } else {
              dispatch(fetchUserPosts({ identifier: userId, page: 1, limit: 20 }));
            }
          })
          .catch((error) => {
            console.log('[Profile] UserId lookup failed, trying general lookup as fallback:', error);
            // Nếu thất bại, thử fetchUserProfile thông thường
            dispatch(fetchUserProfile(userId));
            dispatch(fetchUserPosts({ identifier: userId, page: 1, limit: 20 }));
          });
      }
      // Trường hợp 3: Sử dụng query param id nếu có
      else if (queryParamId) {
        console.log('[Profile] Fetching by query param id:', queryParamId);
        postIdentifier = queryParamId;
        
        dispatch(fetchUserProfileByUserId(queryParamId))
          .unwrap()
          .then(profile => {
            console.log('[Profile] Successfully fetched profile by query param id:', profile);
            // Use profile.id for fetching posts
            if (profile.id) {
              console.log('[Profile] Using profile.id for posts:', profile.id);
              dispatch(fetchUserPosts({ identifier: profile.id, page: 1, limit: 20 }));
            } else {
              dispatch(fetchUserPosts({ identifier: queryParamId, page: 1, limit: 20 }));
            }
          })
          .catch((error) => {
            console.log('[Profile] Query param id lookup failed, trying general lookup as fallback:', error);
            dispatch(fetchUserProfile(queryParamId));
            dispatch(fetchUserPosts({ identifier: queryParamId, page: 1, limit: 20 }));
          });
      }
      // Trường hợp 4: Fallback vào phương thức thông thường nếu các tham số trên không được cung cấp
      else {
        console.log('[Profile] Fallback to general lookup with identifier:', identifier);
        postIdentifier = identifier;
        
        dispatch(fetchUserProfile(identifier))
          .unwrap()
          .then(profile => {
            console.log('[Profile] Successfully fetched profile by general identifier:', profile);
            // Use userId from profile as identifier if available for better post fetching
            if (profile.id) {
              console.log('[Profile] Using profile.id for posts:', profile.id);
              postIdentifier = profile.id;
              dispatch(fetchUserPosts({ identifier: profile.id, page: 1, limit: 20 }));
            } else if (profile.userId) {
              console.log('[Profile] Using profile.userId as fallback for posts:', profile.userId);
              postIdentifier = profile.userId;
              dispatch(fetchUserPosts({ identifier: profile.userId, page: 1, limit: 20 }));
            } else {
              dispatch(fetchUserPosts({ identifier, page: 1, limit: 20 }));
            }
          })
          .catch((error) => {
            console.log('[Profile] General lookup failed:', error);
            dispatch(fetchUserPosts({ identifier, page: 1, limit: 20 }));
          });
      }
      
      console.log('[Profile] Final postIdentifier being used:', postIdentifier);
    }
  }, [dispatch, identifier, userId, username, queryParamId, urlId]);
  
  useEffect(() => {
    if (profile) {
      console.log('Profile data received in component:', profile);
      setProfileForm({
        username: profile.username || '',
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        profilePicture: profile.profilePicture || ''
      });
    }
  }, [profile]);
  
  useEffect(() => {
    console.log('Tab value changed:', tabValue);
  }, [tabValue]);
  
  useEffect(() => {
    // Check URL for debug parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      setDebugMode(true);
    }
  }, []);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleFollowToggle = () => {
    if (!identifier) {
      console.error('No identifier provided for follow/unfollow action');
      return;
    }
    
    if (isOwnProfile) {
      console.error('Attempted to follow own profile - prevented');
      showErrorMessage('Bạn không thể theo dõi chính mình!');
      return;
    }
    
    console.log(`Handling follow toggle for: ${identifier}, current state: ${isFollowing ? 'following' : 'not following'}`);
    
    if (isFollowing) {
      dispatch(unfollowUser(identifier))
        .unwrap()
        .then(() => {
          console.log(`Successfully unfollowed ${identifier}`);
          showSuccessMessage(`Đã bỏ theo dõi`);
        })
        .catch(error => {
          console.error(`Error unfollowing ${identifier}:`, error);
          showErrorMessage(`Không thể bỏ theo dõi: ${error}`);
        });
    } else {
      dispatch(followUser(identifier))
        .unwrap()
        .then(() => {
          console.log(`Successfully followed ${identifier}`);
          showSuccessMessage(`Đã theo dõi thành công`);
        })
        .catch(error => {
          console.error(`Error following ${identifier}:`, error);
          showErrorMessage(`Không thể theo dõi: ${error}`);
        });
    }
  };
  
  const handleEditProfile = () => {
    setEditProfileOpen(true);
  };
  
  const handleCloseEditProfile = () => {
    setEditProfileOpen(false);
  };
  
  const validateProfileForm = () => {
    const errors = {
      username: '',
      displayName: '',
      bio: ''
    };
    let isValid = true;
    
    // Username validation
    if (!profileForm.username) {
      errors.username = 'Tên người dùng không được để trống';
      isValid = false;
    } else if (profileForm.username.length < 3) {
      errors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
      isValid = false;
    } else if (profileForm.username.length > 30) {
      errors.username = 'Tên người dùng không được vượt quá 30 ký tự';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(profileForm.username)) {
      errors.username = 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới';
      isValid = false;
    }
    
    // Display name validation
    if (!profileForm.displayName) {
      errors.displayName = 'Tên hiển thị không được để trống';
      isValid = false;
    }
    
    // Bio validation
    if (profileForm.bio && profileForm.bio.length > 160) {
      errors.bio = 'Tiểu sử không được vượt quá 160 ký tự';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({
          ...formErrors,
          displayName: 'Kích thước ảnh không được vượt quá 5MB'
        });
        return;
      }
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setFormErrors({
          ...formErrors,
          displayName: 'Vui lòng chọn file ảnh hợp lệ'
        });
        return;
      }
      
      setProfilePictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadProfilePicture = async () => {
    if (!profilePictureFile) return null;
    
    try {
      setUploading(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('profilePicture', profilePictureFile);
      
      // Simulated upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      // Make the upload API call
      const response = await fetch(`${process.env.REACT_APP_SOCIAL_API_URL}/api/v1/uploads/profile-picture`, {
        method: 'POST',
        body: formData,
        headers: {
          // No Content-Type header for FormData
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error response:', errorData);
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await response.json();
      setUploadProgress(100);
      
      console.log('Upload response:', data);
      
      // Validate URL format
      if (data.url && typeof data.url === 'string' && data.url.startsWith('http')) {
        return data.url;
      } else if (data.data && data.data.url && typeof data.data.url === 'string' && data.data.url.startsWith('http')) {
        return data.data.url;
      } else {
        console.error('Invalid URL format returned from upload API:', data);
        throw new Error('Server did not return a valid profile picture URL');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setFormErrors({
        ...formErrors,
        displayName: error instanceof Error ? error.message : 'Lỗi khi tải lên ảnh đại diện'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  const handleSubmitProfileEdit = async () => {
    if (!validateProfileForm()) return;
    
    setLoading(true);
    
    try {
      // Upload profile picture if changed
      let profilePictureUrl: string | undefined = profileForm.profilePicture;
      if (profilePictureFile) {
        const uploadedUrl = await uploadProfilePicture();
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        } else {
          // Nếu không thể tải lên ảnh mới, giữ nguyên ảnh cũ
          console.log('Unable to upload new profile picture, keeping existing one:', profilePictureUrl);
        }
      }
      
      // Validate profilePictureUrl is a valid URL or undefined
      if (profilePictureUrl && typeof profilePictureUrl === 'string') {
        // Đảm bảo URL bắt đầu bằng http hoặc https
        if (!profilePictureUrl.startsWith('http')) {
          console.log('Profile picture URL is not valid, clearing it:', profilePictureUrl);
          profilePictureUrl = undefined;
        }
      } else {
        // Nếu không phải string hợp lệ, đặt thành undefined
        profilePictureUrl = undefined;
      }
      
      console.log('Updating profile with picture URL:', profilePictureUrl);
      
      // Update profile with API
      await dispatch(updateUserProfile({
        username: profileForm.username,
        displayName: profileForm.displayName,
        bio: profileForm.bio,
        profilePicture: profilePictureUrl
      }));
      
      setSnackbarMessage('Hồ sơ đã được cập nhật thành công');
      setSnackbarOpen(true);
      setEditProfileOpen(false);
      
      // Clear temp data
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      
      // Update URL if username changed
      if (profileForm.username !== profile?.username) {
        navigate(`/@${profileForm.username}`);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error?.message || 'Lỗi khi cập nhật hồ sơ';
      setSnackbarMessage(`Lỗi: ${errorMessage}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenFollowers = () => {
    if (identifier && profile?.followersCount && profile.followersCount > 0) {
      dispatch(fetchUserFollowers({ identifier: identifier }));
      setFollowersOpen(true);
    }
  };
  
  const handleCloseFollowers = () => {
    setFollowersOpen(false);
  };
  
  const handleOpenFollowing = () => {
    if (identifier && profile?.followingCount && profile.followingCount > 0) {
      dispatch(fetchUserFollowing({ identifier: identifier }));
      setFollowingOpen(true);
    }
  };
  
  const handleCloseFollowing = () => {
    setFollowingOpen(false);
  };
  
  const handleLike = async (postId: string) => {
    if (likingPosts.has(postId)) return;
    
    try {
      setLikingPosts(prev => new Set(prev).add(postId));
      
      const result = await PostService.toggleLike(postId);
      
      if (result.success) {
        // Refresh the posts after liking
        dispatch(fetchUserPosts({ identifier: identifier || '', page: 1, limit: 20 }));
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
          // Refresh posts after repost
          dispatch(fetchUserPosts({ identifier: identifier || '', page: 1, limit: 20 }));
        })
        .catch((error: unknown) => {
          console.error('Error reposting:', error);
        });
    }
  };
  
  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };
  
  const showSuccessMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  const showErrorMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };
  
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };
  
  // Add handlers for post deletion
  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeletePost = () => {
    if (postToDelete) {
      dispatch(deletePost(postToDelete))
        .unwrap()
        .then(() => {
          showSuccessMessage('Post deleted successfully');
        })
        .catch((error) => {
          showErrorMessage(`Failed to delete post: ${error}`);
        });
    }
    setShowDeleteConfirm(false);
    setPostToDelete(null);
  };
  
  const cancelDeletePost = () => {
    setShowDeleteConfirm(false);
    setPostToDelete(null);
  };
  
  // Get user reposts
  const userReposts = userPosts.filter(post => post.isRepost || post.originalPostId);
  
  // Add this handler back
  const handleClosePostMenu = () => {
    setPostMenuAnchor(null);
    setSelectedPostId(null);
  };
  
  if (profileLoading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (profileError || !profile) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Profile Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          {profileError || `The user profile "${identifier}" could not be found.`}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          This may be because:
        </Typography>
        <ul style={{ textAlign: 'left', marginTop: 8 }}>
          <li>The user has deleted their account</li>
          <li>The URL you entered is incorrect</li>
          <li>The user ID doesn't exist in the system</li>
        </ul>
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/')} 
            sx={{ minWidth: 200 }}
          >
            Return to Home
          </Button>
          
          <Typography variant="body2" sx={{ mt: 1 }}>
            If you know the username, try accessing the profile directly:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, width: '100%', maxWidth: 300, mt: 1 }}>
            <TextField
              size="small"
              placeholder="Enter username"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">@</InputAdornment>,
              }}
              onChange={(e) => setSearchUsername(e.target.value)}
              value={searchUsername}
            />
            <Button 
              variant="outlined"
              onClick={() => navigate(`/@${searchUsername}`)}
              disabled={!searchUsername}
            >
              Go
            </Button>
          </Box>
          
          <Divider sx={{ width: '100%', my: 2 }} />
          
          <Typography variant="body2">
            Need help? Use our debugging tools:
          </Typography>
          
          <Button 
            variant="outlined" 
            color="info" 
            size="small"
            onClick={() => navigate(`/debug/profile`)}
            sx={{ mt: 1 }}
          >
            Debug Profile API
          </Button>
          
          {identifier && (
            <Button 
              variant="text" 
              color="secondary" 
              size="small"
              onClick={() => {
                // Chuyển sang chế độ debug với identifier hiện tại
                const debugParams = new URLSearchParams();
                debugParams.set('id', identifier);
                navigate(`/debug/profile?${debugParams.toString()}`);
              }}
              sx={{ mt: 1 }}
            >
              Debug this user ID
            </Button>
          )}
        </Box>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UserAvatar
              src={profile.profilePicture}
              username={profile.username}
              sx={{ width: 100, height: 100, mr: 3 }}
            />
            
            <Box>
              <Typography variant="h5" component="h1" fontWeight="bold">
                {profile.username}
              </Typography>
              
              {profile.fullName && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {profile.fullName}
                </Typography>
              )}
              
              {profile.bio && (
                <Typography variant="body2" sx={{ mb: 2, maxWidth: 600 }}>
                  {profile.bio}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LinkIcon fontSize="small" color="disabled" />
                <Typography variant="body2" color="textSecondary">
                  threads.net
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {currentUser && (
            <Box>
              {isOwnProfile ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleEditProfile}
                    startIcon={<EditIcon />}
                    sx={{ borderRadius: 6 }}
                  >
                    Edit profile
                  </Button>
                  {debugMode && (
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                      Showing Edit button (isOwnProfile: true)
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? "outlined" : "contained"}
                    onClick={handleFollowToggle}
                    sx={{ borderRadius: 6 }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  {debugMode && (
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                      Showing Follow button (isOwnProfile: false)
                    </Typography>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 2, 
              cursor: profile.followersCount ? 'pointer' : 'default',
              fontWeight: followersOpen ? 'bold' : 'normal'
            }}
            onClick={handleOpenFollowers}
          >
            <b>{profile.followersCount || 0}</b> followers
          </Typography>
          <Typography 
            variant="body2"
            sx={{ 
              cursor: profile.followingCount ? 'pointer' : 'default',
              fontWeight: followingOpen ? 'bold' : 'normal'
            }}
            onClick={handleOpenFollowing}
          >
            <b>{profile.followingCount || 0}</b> following
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        centered
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.mode === 'dark' ? 'white' : 'black',
          },
        }}
      >
        <Tab label="Posts" {...a11yProps(0)} />
        <Tab label="Replies" {...a11yProps(1)} />
        <Tab label="Media" {...a11yProps(2)} />
        <Tab label="Reposts" {...a11yProps(3)} />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        {postsLoading && userPosts.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : userPosts.length === 0 ? (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No posts yet
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => setDebugMode(!debugMode)}
            >
              {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
            </Button>
          </Box>
        ) : (
          <Box>
            {userPosts.map(post => (
              <Box key={post.id} sx={{ position: 'relative' }}>
                <PostItem 
                  post={post} 
                  onLike={handleLike}
                  onRepost={handleRepost}
                  onComment={handleComment}
                />
              </Box>
            ))}
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No replies yet
          </Typography>
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No media posts yet
          </Typography>
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 2 }}>
          <Button 
            variant={repostsFilter === 'all' ? 'contained' : 'outlined'} 
            size="small"
            onClick={() => setRepostsFilter('all')}
            sx={{ mr: 1 }}
          >
            All
          </Button>
          <Button 
            variant={repostsFilter === 'created' ? 'contained' : 'outlined'} 
            size="small"
            onClick={() => setRepostsFilter('created')}
            sx={{ mr: 1 }}
          >
            Created
          </Button>
          <Button 
            variant={repostsFilter === 'reposted' ? 'contained' : 'outlined'} 
            size="small"
            onClick={() => setRepostsFilter('reposted')}
          >
            Reposted
          </Button>
        </Box>
        
        {postsLoading && userReposts.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : userReposts.length === 0 ? (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No reposts yet
            </Typography>
          </Box>
        ) : (
          <Box>
            {userReposts
              .filter(post => {
                if (repostsFilter === 'all') return true;
                if (repostsFilter === 'created') return !post.isRepost;
                if (repostsFilter === 'reposted') return post.isRepost;
                return true;
              })
              .map(post => (
                <Box key={post.id} sx={{ position: 'relative' }}>
                  <PostItem 
                    post={post} 
                    onLike={handleLike}
                    onRepost={handleRepost}
                    onComment={handleComment}
                  />
                </Box>
              ))}
          </Box>
        )}
      </TabPanel>
      
      {/* Followers Dialog */}
      <Dialog 
        open={followersOpen} 
        onClose={handleCloseFollowers}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Followers
          <StyledIconButton
            onClick={handleCloseFollowers}
            absolute
          >
            <CloseIcon />
          </StyledIconButton>
        </DialogTitle>
        <DialogContent dividers>
          <UserList 
            title=""
            users={followers}
            emptyMessage="No followers yet"
            loading={profileLoading}
            currentUserId={currentUser?.id}
            isFollowing={(userId: string) => {
              // Implement proper following check
              return false;
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Following Dialog */}
      <Dialog 
        open={followingOpen} 
        onClose={handleCloseFollowing}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Following
          <StyledIconButton
            onClick={handleCloseFollowing}
            absolute
          >
            <CloseIcon />
          </StyledIconButton>
        </DialogTitle>
        <DialogContent dividers>
          <UserList 
            title=""
            users={following}
            emptyMessage="Not following anyone yet"
            loading={profileLoading}
            currentUserId={currentUser?.id}
            isFollowing={(userId: string) => {
              // Implement proper following check
              return true;
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Post Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={cancelDeletePost}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Post
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={cancelDeletePost} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDeletePost} 
            variant="contained" 
            color="error"
          >
            Delete
          </Button>
        </Box>
      </Dialog>
      
      {/* Edit Profile Modal */}
      <Modal
        open={editProfileOpen}
        onClose={handleCloseEditProfile}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Chỉnh sửa hồ sơ
          </Typography>
          
          {/* Profile Picture Upload */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Tooltip title="Thay đổi ảnh đại diện">
                  <IconButton 
                    component="label" 
                    sx={{ 
                      bgcolor: theme.palette.primary.main, 
                      color: 'white',
                      '&:hover': { bgcolor: theme.palette.primary.dark }
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon fontSize="small" />
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleProfilePictureChange}
                    />
                  </IconButton>
                </Tooltip>
              }
            >
              <Avatar
                alt={profileForm.displayName}
                src={profilePicturePreview || profileForm.profilePicture}
                sx={{ width: 100, height: 100 }}
              />
            </Badge>
          </Box>
          
          {uploading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
          
          <TextField
            name="username"
            label="Tên người dùng"
            value={profileForm.username}
            onChange={handleProfileFormChange}
            fullWidth
            margin="normal"
            error={!!formErrors.username}
            helperText={formErrors.username || "Tên người dùng dùng để truy cập hồ sơ của bạn (@username)"}
            InputProps={{
              startAdornment: <InputAdornment position="start">@</InputAdornment>,
            }}
          />
          
          <TextField
            name="displayName"
            label="Tên hiển thị"
            value={profileForm.displayName}
            onChange={handleProfileFormChange}
            fullWidth
            margin="normal"
            error={!!formErrors.displayName}
            helperText={formErrors.displayName}
          />
          
          <TextField
            name="bio"
            label="Tiểu sử"
            value={profileForm.bio}
            onChange={handleProfileFormChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            error={!!formErrors.bio}
            helperText={formErrors.bio || `${profileForm.bio.length}/160 ký tự`}
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleCloseEditProfile}>Hủy</Button>
            <Button 
              onClick={handleSubmitProfileEdit} 
              variant="contained"
              disabled={profileLoading || uploading}
            >
              Lưu thay đổi
            </Button>
          </Box>
        </Box>
      </Modal>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      <DebugInfo 
        profile={profile} 
        currentUser={currentUser} 
        isOwnProfile={isOwnProfile} 
        identifier={identifier || null}
        debugMode={debugMode}
        toggleDebugMode={toggleDebugMode}
      />
      
      {/* Post Options Menu - Empty but needed for references */}
      <Menu
        anchorEl={postMenuAnchor}
        open={Boolean(postMenuAnchor)}
        onClose={handleClosePostMenu}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => {
          if (selectedPostId) {
            handleDeletePost(selectedPostId);
            handleClosePostMenu();
          }
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Post</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Profile; 