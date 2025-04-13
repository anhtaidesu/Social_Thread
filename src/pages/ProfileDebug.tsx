import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider, 
  CircularProgress, 
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Chip,
  Avatar,
} from '@mui/material';
import { ProfileService } from '../services/profile.service';
import { User } from '../types';

/**
 * Trang gỡ lỗi cho các vấn đề liên quan đến profile
 * Cung cấp công cụ để kiểm tra API profile
 */
const ProfileDebug: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Search debug states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Kiểm tra URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const idParam = searchParams.get('id');
    
    if (idParam) {
      console.log('Debug: ID parameter found in URL:', idParam);
      setIdentifier(idParam);
      
      // Tự động test nếu có ID
      handleTestAllMethods(idParam);
    }
  }, []);
  
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
  };
  
  const handleTestAllMethods = async (paramId?: string) => {
    const idToTest = paramId || identifier;
    
    if (!idToTest.trim()) {
      setError('Please enter a user ID or username');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const testResults = await ProfileService.testAllProfileMethods(idToTest);
      setResults(testResults);
    } catch (err: any) {
      setError(err.message || 'An error occurred during testing');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchProfiles = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      return;
    }
    
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults(null);
    
    try {
      const result = await ProfileService.searchProfiles(searchQuery);
      console.log('Search debug result:', result);
      setSearchResults(result);
    } catch (err: any) {
      setSearchError(err.message || 'An error occurred during search');
    } finally {
      setSearchLoading(false);
    }
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Profile Debug Tool
      </Typography>
      
      <Typography variant="body1" paragraph>
        This tool helps identify issues with profile lookups. Enter a user ID or username to test all available methods.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Profile Lookup Test
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="User ID or Username"
            variant="outlined"
            fullWidth
            value={identifier}
            onChange={handleIdentifierChange}
            placeholder="Enter user ID or username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  @
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="contained"
            onClick={() => handleTestAllMethods()}
            disabled={isLoading || !identifier.trim()}
            sx={{ minWidth: 120 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Test All Methods'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {results && (
          <Box sx={{ mt: 3 }}>
            <Alert 
              severity={results.success ? "success" : "error"}
              sx={{ mb: 3 }}
            >
              {results.summary}
            </Alert>
            
            {results.success && results.profile && (
              <Card sx={{ mb: 3, bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Found Profile
                  </Typography>
                  <Typography variant="body1">
                    <strong>ID:</strong> {results.profile.id}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Username:</strong> {results.profile.username}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Display Name:</strong> {results.profile.displayName}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Access this profile at:</strong>
                  </Typography>
                  <Typography component="div" sx={{ mt: 1 }}>
                    <ul>
                      <li>
                        <code>/profile/{results.profile.id}</code> (ID-based)
                      </li>
                      <li>
                        <code>/@{results.profile.username}</code> (Username-based)
                      </li>
                    </ul>
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            <Typography variant="h6" gutterBottom>
              Method Results
            </Typography>
            
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Method</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Details</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>General Profile</TableCell>
                    <TableCell>
                      {results.generalMethod?.success ? (
                        <Typography color="success.main">✅ Success</Typography>
                      ) : (
                        <Typography color="error.main">❌ Failed</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {results.generalMethod?.success ? (
                        <Typography variant="body2">
                          Found user: {results.generalMethod.data?.username}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="error">
                          {results.generalMethod?.error || 'Unknown error'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>By User ID</TableCell>
                    <TableCell>
                      {results.userIdMethod?.success ? (
                        <Typography color="success.main">✅ Success</Typography>
                      ) : (
                        <Typography color="error.main">❌ Failed</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {results.userIdMethod?.success ? (
                        <Typography variant="body2">
                          Found user: {results.userIdMethod.data?.username}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="error">
                          {results.userIdMethod?.error || 'Unknown error'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>By Username</TableCell>
                    <TableCell>
                      {results.usernameMethod?.success ? (
                        <Typography color="success.main">✅ Success</Typography>
                      ) : (
                        <Typography color="error.main">❌ Failed</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {results.usernameMethod?.success ? (
                        <Typography variant="body2">
                          Found user: {results.usernameMethod.data?.username}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="error">
                          {results.usernameMethod?.error || 'Unknown error'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            <Typography variant="h6" gutterBottom>
              Raw Data
            </Typography>
            
            <Box 
              component="pre" 
              sx={{ 
                p: 2, 
                borderRadius: 1, 
                bgcolor: 'grey.100', 
                overflow: 'auto',
                maxHeight: 300
              }}
            >
              {formatJSON(results)}
            </Box>
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Search Profiles Test
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Search Query"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Enter search term"
          />
          
          <Button
            variant="contained"
            onClick={handleSearchProfiles}
            disabled={searchLoading || !searchQuery.trim()}
            sx={{ minWidth: 120 }}
          >
            {searchLoading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Box>
        
        {searchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {searchError}
          </Alert>
        )}
        
        {searchResults && (
          <Box sx={{ mt: 3 }}>
            <Alert 
              severity={searchResults.success ? "success" : "error"}
              sx={{ mb: 3 }}
            >
              {searchResults.success 
                ? `Found ${searchResults.data?.profiles?.length || 0} profiles` 
                : `Search failed: ${searchResults.error}`}
            </Alert>
            
            {searchResults.success && searchResults.data?.profiles && (
              <>
                <Typography variant="h6" gutterBottom>
                  Search Results
                </Typography>
                
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Profile</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>ID</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchResults.data.profiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography align="center">No results found</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        searchResults.data.profiles.map((profile: User) => (
                          <TableRow key={profile.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  src={profile.profilePicture || undefined} 
                                  sx={{ mr: 2 }}
                                >
                                  {profile.displayName?.charAt(0) || profile.username.charAt(0)}
                                </Avatar>
                                <Typography>{profile.displayName || profile.username}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{profile.username}</TableCell>
                            <TableCell>{profile.id}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Typography variant="h6" gutterBottom>
                  Pagination Info
                </Typography>
                
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Chip label={`Total: ${searchResults.data.pagination?.total || 0}`} />
                      <Chip label={`Page: ${searchResults.data.pagination?.page || 1}`} />
                      <Chip label={`Limit: ${searchResults.data.pagination?.limit || 0}`} />
                      <Chip label={`Pages: ${searchResults.data.pagination?.pages || 0}`} />
                    </Box>
                  </CardContent>
                </Card>
                
                <Typography variant="h6" gutterBottom>
                  Raw Response
                </Typography>
                
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                    {JSON.stringify(searchResults, null, 2)}
                  </pre>
                </Paper>
              </>
            )}
          </Box>
        )}
      </Paper>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Troubleshooting Tips
        </Typography>
        
        <Typography component="div">
          <ul>
            <li>If you're using a user ID and it's not found, check if the user exists in your database.</li>
            <li>Try accessing the profile with username instead (e.g., /@username).</li>
            <li>Check server logs for database connection issues.</li>
            <li>Verify that the Auth service and Social service are properly synchronized.</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileDebug; 