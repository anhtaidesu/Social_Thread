import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import ProfileService from '../services/profile.service';

const ProfileDebug: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProfileById = async () => {
    if (!identifier.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log(`Debug: Attempting to fetch profile with identifier: ${identifier}`);
      const response = await ProfileService.getProfile(identifier);
      
      console.log('Debug: Raw API response:', response);
      
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Unknown error fetching profile');
      }
    } catch (err: any) {
      console.error('Debug: Error fetching profile:', err);
      setError(err.message || 'Exception occurred while fetching profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUserByUsername = async () => {
    // Hardcoded to fetch the problematic user by username
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('Debug: Attempting to fetch profile with username: wibucate');
      const response = await ProfileService.getProfile('wibucate');
      
      console.log('Debug: Raw API response from username lookup:', response);
      
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Unknown error fetching profile by username');
      }
    } catch (err: any) {
      console.error('Debug: Error fetching profile by username:', err);
      setError(err.message || 'Exception occurred while fetching profile by username');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Profile API Debug Tool
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Fetch Profile by ID or Username
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            label="User ID or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={fetchProfileById}
            disabled={isLoading || !identifier.trim()}
          >
            Fetch
          </Button>
        </Box>
        
        <Button 
          variant="outlined" 
          onClick={fetchUserByUsername}
          disabled={isLoading}
          sx={{ mb: 2 }}
        >
          Fetch Wibucate User
        </Button>
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            <Typography color="error">Error: {error}</Typography>
          </Box>
        )}
        
        {result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Profile Data:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <List>
                <ListItem>
                  <ListItemText primary="ID" secondary={result.id} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Username" secondary={result.username} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Display Name" secondary={result.displayName || 'Not set'} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Bio" secondary={result.bio || 'Not set'} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Profile Picture" 
                    secondary={result.profilePicture || 'Not set'} 
                  />
                </ListItem>
              </List>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Raw Data:
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  p: 2, 
                  bgcolor: '#263238', 
                  color: '#fff', 
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}
              >
                {JSON.stringify(result, null, 2)}
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProfileDebug; 