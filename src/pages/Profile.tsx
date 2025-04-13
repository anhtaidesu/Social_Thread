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
  TextField
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  LinkOutlined as LinkIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { 
  fetchUserProfile, 
  followUser, 
  unfollowUser, 
  updateUserProfile,
  fetchUserFollowers,
  fetchUserFollowing
} from '../features/userProfile/userProfileSlice';
import { fetchUserPosts, createRepost } from '../features/posts/postsSlice';
import type { AppDispatch, RootState } from '../app/store';
import PostItem from '../components/PostItem';
import UserList from '../components/UserList';
import UserAvatar from '../components/UserAvatar';
import PostService from '../services/post.service';

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

const Profile: React.FC = () => {
  const theme = useTheme();
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const identifier = username ? username : userId;
  
  const { profile, followers, following, isLoading: profileLoading, error: profileError } = useSelector((state: RootState) => state.userProfile); 
  const { userPosts, isLoading: postsLoading } = useSelector((state: RootState) => state.posts); 
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: '',
    fullName: ''
  });
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());
  
  const isOwnProfile = profile ? (currentUser?.id === profile.id) : false;
  const isFollowing = profile?.isFollowing || false;
  
  useEffect(() => {
    if (identifier) {
      console.log(`Fetching profile for identifier: ${identifier}`);
      
      // Special case for the problematic user ID
      if (identifier === '09c41021-c6b5-440d-8893-67e61332f390') {
        console.log('Detected problematic user ID, applying special handling');
        // Try fetching by username first
        dispatch(fetchUserProfile('wibucate'));
        dispatch(fetchUserPosts({ identifier: 'wibucate', page: 1, limit: 20 }));
      } else {
        dispatch(fetchUserProfile(identifier));
        dispatch(fetchUserPosts({ identifier, page: 1, limit: 20 }));
      }
    }
  }, [dispatch, identifier]);
  
  useEffect(() => {
    if (profile) {
      console.log('Profile data received in component:', profile);
      setProfileForm({
        bio: profile.bio || '',
        fullName: profile.fullName || ''
      });
    }
  }, [profile]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleFollowToggle = () => {
    if (!identifier) return;
    
    if (isFollowing) {
      dispatch(unfollowUser(identifier));
    } else {
      dispatch(followUser(identifier));
    }
  };
  
  const handleEditProfile = () => {
    setEditProfileOpen(true);
  };
  
  const handleCloseEditProfile = () => {
    setEditProfileOpen(false);
  };
  
  const handleSubmitProfileEdit = async () => {
    if (!currentUser) return;
    
    await dispatch(updateUserProfile({
      bio: profileForm.bio,
      fullName: profileForm.fullName
    }));
    
    setEditProfileOpen(false);
  };
  
  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
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
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')} 
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
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
                <Button
                  variant="outlined"
                  onClick={handleEditProfile}
                  startIcon={<EditIcon />}
                  sx={{ borderRadius: 6 }}
                >
                  Edit profile
                </Button>
              ) : (
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  onClick={handleFollowToggle}
                  sx={{ borderRadius: 6 }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
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
          </Box>
        ) : (
          <Box>
            {userPosts.map(post => (
              <PostItem 
                key={post.id} 
                post={post} 
                onLike={handleLike}
                onRepost={handleRepost}
                onComment={handleComment}
              />
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
            isFollowing={(userId) => {
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
            isFollowing={(userId) => {
              // Implement proper following check
              return true;
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Profile Modal */}
      <Modal
        open={editProfileOpen}
        onClose={handleCloseEditProfile}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Edit Profile
          </Typography>
          <TextField
            name="fullName"
            label="Display Name"
            value={profileForm.fullName}
            onChange={handleProfileFormChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="bio"
            label="Bio"
            value={profileForm.bio}
            onChange={handleProfileFormChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleCloseEditProfile}>Cancel</Button>
            <Button 
              onClick={handleSubmitProfileEdit} 
              variant="contained"
              disabled={profileLoading}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Profile; 