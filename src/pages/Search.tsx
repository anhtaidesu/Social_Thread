import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Divider,
  Paper,
  CircularProgress,
  Button,
  useTheme,
  Tab,
  Tabs
} from '@mui/material';
import { Search as SearchIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import UserAvatar from '../components/UserAvatar';
import ProfileService from '../services/profile.service';

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
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
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
    id: `search-tab-${index}`,
    'aria-controls': `search-tabpanel-${index}`,
  };
};

const Search: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<User[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const result = await ProfileService.searchProfiles(query, 1, 20);
      
      if (result.success && result.data) {
        setResults(result.data.profiles);
        setPagination(result.data.pagination);
      } else {
        setResults([]);
        setPagination(null);
        console.error('Error searching profiles:', result.error);
      }
    } catch (error) {
      console.error('Error searching profiles:', error);
      setResults([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => { 
    setTabValue(newValue);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Search
      </Typography>

      <Paper
        component="form"
        onSubmit={handleSearch}
        elevation={0}
        sx={{
          p: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: 3,
          mb: 2
        }}
      >
        <InputAdornment position="start" sx={{ pl: 1 }}>
          <SearchIcon color="action" />
        </InputAdornment>
        <TextField
          fullWidth
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
          }}
          sx={{ ml: 1 }}
        />
      </Paper>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.mode === 'dark' ? 'white' : 'black', 
          },
          '& .Mui-selected': {
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            fontWeight: 'bold',
          },
        }}
      >
        <Tab label="Top" {...a11yProps(0)} />
        <Tab label="Accounts" {...a11yProps(1)} />
        <Tab label="Threads" {...a11yProps(2)} />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {!query && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary">
              Search for users or threads
            </Typography>
          </Box>
        )}

        {query && isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>     
            <CircularProgress />
          </Box>
        )}

        {query && !isLoading && results.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary">
              No results found for "{query}"
            </Typography>
          </Box>
        )}

        {query && !isLoading && results.length > 0 && (
          <List sx={{ width: '100%' }}>
            {results.map((user) => (
              <React.Fragment key={user.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    py: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    }
                  }}
                  onClick={() => handleUserClick(user.id)}
                >
                  <ListItemAvatar>
                    <UserAvatar
                      alt={user.username}
                      src={user.profilePicture}
                      username={user.username}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
                        <Typography variant="subtitle1" fontWeight="bold">
                          {user.username}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonAddIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle follow action
                          }}
                          sx={{ borderRadius: 5 }}
                        >
                          Follow
                        </Button>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {user.displayName || user.fullName}
                        </Typography>
                        {user.bio && (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              display: '-webkit-box',
                              overflow: 'hidden',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                            }}
                          >
                            {user.bio}
                          </Typography>
                        )}
                        <Typography variant="caption" color="textSecondary" component="div" sx={{ mt: 0.5 }}>
                          {(user.followerCount || user.followersCount || 0).toLocaleString()} followers
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="textSecondary">
            Search for accounts by username
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="textSecondary">
            Search for threads by keywords
          </Typography>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default Search; 