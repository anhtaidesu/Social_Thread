import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Paper, Divider } from '@mui/material';
import ProfileService from '../services/profile.service';

/**
 * Component để kiểm tra các API profile
 * Chỉ sử dụng trong môi trường phát triển
 */
const ProfileApiTester: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetProfile = async () => {
    setLoading(true);
    const response = await ProfileService.getProfile(identifier);
    setResult(response);
    setLoading(false);
  };

  const handleGetCurrentProfile = async () => {
    setLoading(true);
    const response = await ProfileService.getCurrentProfile();
    setResult(response);
    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const response = await ProfileService.updateProfile({
      displayName,
      bio
    });
    setResult(response);
    setLoading(false);
  };

  const handleSearchProfiles = async () => {
    setLoading(true);
    const response = await ProfileService.searchProfiles(searchQuery);
    setResult(response);
    setLoading(false);
  };

  const handleGetSuggestedProfiles = async () => {
    setLoading(true);
    const response = await ProfileService.getSuggestedProfiles();
    setResult(response);
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        API Profile Tester
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Get Profile
        </Typography>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <TextField
            label="Username/ID"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            size="small"
            sx={{ mr: 1, flexGrow: 1 }}
          />
          <Button 
            variant="contained" 
            onClick={handleGetProfile}
            disabled={!identifier || loading}
          >
            Get Profile
          </Button>
        </Box>
        <Button 
          variant="outlined" 
          onClick={handleGetCurrentProfile}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Get My Profile
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleGetSuggestedProfiles}
          disabled={loading}
        >
          Get Suggested Profiles
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Update Profile
        </Typography>
        <TextField
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
        <TextField
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          size="small"
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <Button 
          variant="contained" 
          onClick={handleUpdateProfile}
          disabled={loading}
        >
          Update Profile
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Search Profiles
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <TextField
            label="Search Query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ mr: 1, flexGrow: 1 }}
          />
          <Button 
            variant="contained" 
            onClick={handleSearchProfiles}
            disabled={!searchQuery || loading}
          >
            Search
          </Button>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Result:
        </Typography>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            bgcolor: '#f5f5f5', 
            maxHeight: 300, 
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.85rem'
          }}
        >
          {loading ? (
            "Loading..."
          ) : result ? (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          ) : (
            "No result yet"
          )}
        </Paper>
      </Box>
    </Paper>
  );
};

export default ProfileApiTester; 