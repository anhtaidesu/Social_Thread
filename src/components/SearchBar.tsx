import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Typography,
  ClickAwayListener,
  CircularProgress,
  Divider,
  styled,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import UserAvatar from './UserAvatar';
import { User, Post } from '../types';
import { debounce } from 'lodash';

interface SearchResult {
  users: User[];
  posts: Post[];
  tags: string[];
}

const StyledPopper = styled(Popper)(({ theme }) => ({
  zIndex: 1100,
  width: '100%',
  maxWidth: 500,
  overflow: 'hidden',
  marginTop: theme.spacing(1),
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const SearchResultItem = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1.5),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(0, 0, 0, 0.04)',
  },
}));

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Tìm kiếm người dùng, bài viết, hashtag...',
  fullWidth = true
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const anchorRef = useRef<HTMLDivElement>(null);
  
  // Handle input change with debounce
  const debouncedSearch = useRef(
    debounce(async (q: string) => {
      if (!q || q.length < 2) {
        setResults(null);
        setLoading(false);
        return;
      }
      
      try {
        // Call search API
        const response = await fetch(`${process.env.REACT_APP_SOCIAL_API_URL}/api/v1/search?q=${encodeURIComponent(q)}&limit=5`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Search request failed');
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setResults({
            users: data.data.users || [],
            posts: data.data.posts || [],
            tags: data.data.tags || []
          });
        } else {
          setResults(null);
        }
      } catch (error) {
        console.error('Error searching:', error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;
  
  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= 2) {
      setLoading(true);
      setOpen(true);
      debouncedSearch(value);
    } else {
      setOpen(false);
      setResults(null);
    }
  };
  
  const handleClear = () => {
    setQuery('');
    setOpen(false);
    setResults(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = getTotalItems();
    
    if (open && totalItems > 0) {
      // Arrow down
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex + 1) % totalItems);
      }
      // Arrow up
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
      }
      // Enter
      else if (e.key === 'Enter') {
        e.preventDefault();
        handleItemSelection(selectedIndex);
      }
    } else if (e.key === 'Enter' && query.trim()) {
      // Navigate to search page
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setOpen(false);
      if (onSearch) {
        onSearch(query);
      }
    }
  };
  
  const getTotalItems = () => {
    if (!results) return 0;
    return (results.users?.length || 0) + (results.tags?.length || 0) + (results.posts?.length || 0);
  };
  
  const handleItemSelection = (index: number) => {
    if (!results) return;
    
    let currentIndex = 0;
    
    // Check if it's a user
    const userCount = results.users?.length || 0;
    if (index < userCount) {
      const user = results.users[index];
      navigate(`/@${user.username}`);
      setOpen(false);
      return;
    }
    currentIndex += userCount;
    
    // Check if it's a tag
    const tagCount = results.tags?.length || 0;
    if (index < currentIndex + tagCount) {
      const tag = results.tags[index - currentIndex];
      navigate(`/search?tag=${encodeURIComponent(tag)}`);
      setOpen(false);
      return;
    }
    currentIndex += tagCount;
    
    // Check if it's a post
    const postCount = results.posts?.length || 0;
    if (index < currentIndex + postCount) {
      const post = results.posts[index - currentIndex];
      navigate(`/post/${post.id}`);
      setOpen(false);
      return;
    }
  };
  
  const handleUserClick = (username: string) => {
    navigate(`/@${username}`);
    setOpen(false);
  };
  
  const handleTagClick = (tag: string) => {
    navigate(`/search?tag=${encodeURIComponent(tag)}`);
    setOpen(false);
  };
  
  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
    setOpen(false);
  };
  
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box ref={anchorRef} sx={{ position: 'relative', width: fullWidth ? '100%' : 300 }}>
        <TextField
          fullWidth
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setOpen(true)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : query ? (
                  <IconButton
                    size="small"
                    aria-label="clear"
                    onClick={handleClear}
                    edge="end"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ) : null}
              </InputAdornment>
            ),
            sx: {
              borderRadius: 10,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.07)'
                  : 'rgba(0, 0, 0, 0.06)'
              },
              border: 'none',
              pl: 2,
              '& fieldset': { border: 'none' }
            }
          }}
          variant="outlined"
          size="small"
        />
        
        <StyledPopper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
        >
          <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            
            {!loading && results && (
              <List disablePadding>
                {/* Users section */}
                {results.users && results.users.length > 0 && (
                  <Box>
                    <ListItem sx={{ py: 1, px: 2 }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" color="text.secondary">
                            Người dùng
                          </Typography>
                        }
                      />
                    </ListItem>
                    {results.users.map((user, index) => (
                      <SearchResultItem
                        key={user.id}
                        onClick={() => handleUserClick(user.username)}
                        selected={selectedIndex === index}
                      >
                        <ListItemAvatar>
                          <UserAvatar 
                            src={user.profilePicture} 
                            username={user.username}
                            sx={{ width: 40, height: 40 }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="medium">
                              {user.displayName || user.username}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              @{user.username}
                            </Typography>
                          }
                        />
                      </SearchResultItem>
                    ))}
                    <Divider />
                  </Box>
                )}
                
                {/* Tags section */}
                {results.tags && results.tags.length > 0 && (
                  <Box>
                    <ListItem sx={{ py: 1, px: 2 }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" color="text.secondary">
                            Hashtags
                          </Typography>
                        }
                      />
                    </ListItem>
                    {results.tags.map((tag, index) => (
                      <SearchResultItem
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        selected={selectedIndex === (results.users?.length || 0) + index}
                      >
                        <ListItemAvatar>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.primary.main,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: theme.palette.primary.contrastText
                            }}
                          >
                            <TagIcon />
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="medium">
                              #{tag}
                            </Typography>
                          }
                        />
                      </SearchResultItem>
                    ))}
                    <Divider />
                  </Box>
                )}
                
                {/* Posts section */}
                {results.posts && results.posts.length > 0 && (
                  <Box>
                    <ListItem sx={{ py: 1, px: 2 }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" color="text.secondary">
                            Bài viết
                          </Typography>
                        }
                      />
                    </ListItem>
                    {results.posts.map((post, index) => (
                      <SearchResultItem
                        key={post.id}
                        onClick={() => handlePostClick(post.id)}
                        selected={selectedIndex === (results.users?.length || 0) + (results.tags?.length || 0) + index}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1" noWrap>
                              {post.content}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {post.author?.username ? `@${post.author.username}` : 'Unknown'}
                            </Typography>
                          }
                        />
                      </SearchResultItem>
                    ))}
                  </Box>
                )}
                
                {getTotalItems() === 0 && (
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography align="center" color="text.secondary">
                          Không tìm thấy kết quả
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
                
                {getTotalItems() > 0 && (
                  <ListItemButton
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(query)}`);
                      setOpen(false);
                    }}
                    sx={{ py: 2, justifyContent: 'center' }}
                  >
                    <Typography color="primary">
                      Xem tất cả kết quả
                    </Typography>
                  </ListItemButton>
                )}
              </List>
            )}
          </Paper>
        </StyledPopper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar; 