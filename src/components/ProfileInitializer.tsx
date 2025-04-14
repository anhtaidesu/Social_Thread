import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  LinearProgress,
  Button,
  Alert
} from '@mui/material';
import { RootState } from '../app/store';
import { AuthState } from '../types';
import { ProfileService } from '../services/profile.service';
import { toast } from 'react-toastify';

interface ProfileInitializerProps {
  children: React.ReactNode;
}

/**
 * Component that manages displaying a profile initialization screen
 * and automatically checks when profile is ready
 */
const ProfileInitializer: React.FC<ProfileInitializerProps> = ({ children }) => {
  const { isAuthenticated, token, user } = useSelector<RootState, AuthState>(state => state.auth);
  const [initializing, setInitializing] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [waitTimer, setWaitTimer] = useState<NodeJS.Timeout | null>(null);

  // Function to retry profile creation
  const handleRetry = () => {
    setError(null);
    setCheckingStatus(true);
    setInitializing(true);
    setProgress(0);
    setAttemptCount(0);
    checkProfileStatus();
  };

  // Function to check profile status
  const checkProfileStatus = async () => {
    if (!isAuthenticated || !token) {
      setCheckingStatus(false);
      return;
    }

    try {
      setCheckingStatus(true);
      const statusCheck = await ProfileService.checkProfileStatus();
      
      if (statusCheck.success) {
        if (statusCheck.exists) {
          // Profile exists, we can proceed
          setInitializing(false);
          setCheckingStatus(false);
        } else if (statusCheck.isInitializing) {
          // Profile is being created, show initializing UI
          setInitializing(true);
          
          // Start the wait timer if not already started
          if (!waitTimer) {
            startWaitingForProfile();
          }
        } else {
          // Not initializing, but doesn't exist. Strange case.
          setError('Your profile has not been created yet. Please refresh the page or try logging in again.');
          setInitializing(false);
          setCheckingStatus(false);
        }
      } else {
        // Check failed
        setError(statusCheck.error || 'Failed to check profile status');
        setInitializing(false);
        setCheckingStatus(false);
      }
    } catch (err) {
      console.error('Error checking profile status:', err);
      setError('An error occurred while checking your profile status');
      setInitializing(false);
      setCheckingStatus(false);
    }
  };

  // Function to start waiting for profile creation
  const startWaitingForProfile = () => {
    const maxAttempts = 15;
    const interval = 2000;
    let currentAttempt = 0;

    // Clear any existing timer
    if (waitTimer) {
      clearInterval(waitTimer);
    }

    // Start a new timer
    const timer = setInterval(async () => {
      currentAttempt++;
      setAttemptCount(currentAttempt);
      
      // Update progress based on current attempt
      const newProgress = Math.min((currentAttempt / maxAttempts) * 100, 95);
      setProgress(newProgress);

      try {
        const statusCheck = await ProfileService.checkProfileStatus();
        
        if (statusCheck.success && statusCheck.exists) {
          // Profile exists, we can proceed
          clearInterval(timer);
          setWaitTimer(null);
          setProgress(100);
          setInitializing(false);
          setCheckingStatus(false);
          toast.success('Your profile is ready!', { autoClose: 3000 });
        } else if (currentAttempt >= maxAttempts) {
          // Max attempts reached
          clearInterval(timer);
          setWaitTimer(null);
          setError('Profile creation is taking longer than expected. You can wait or try refreshing the page.');
          setInitializing(false);
          setCheckingStatus(false);
        }
      } catch (err) {
        console.error('Error waiting for profile:', err);
        if (currentAttempt >= maxAttempts) {
          clearInterval(timer);
          setWaitTimer(null);
          setError('Failed to check if your profile is ready. Please refresh the page.');
          setInitializing(false);
          setCheckingStatus(false);
        }
      }
    }, interval);

    setWaitTimer(timer);

    // Cleanup on component unmount
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  };

  // Check profile status when auth state changes
  useEffect(() => {
    // Only check if the user is authenticated
    if (isAuthenticated && token) {
      checkProfileStatus();
    } else {
      setInitializing(false);
      setCheckingStatus(false);
      setError(null);
    }

    // Cleanup on unmount
    return () => {
      if (waitTimer) {
        clearInterval(waitTimer);
      }
    };
  }, [isAuthenticated, token]);

  // If checking status or user is not authenticated, render children normally
  if (!isAuthenticated || (!initializing && !checkingStatus && !error)) {
    return <>{children}</>;
  }

  // Render loading screen when initializing or checking
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor={(theme) => theme.palette.background.default}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold">
          {initializing ? 'Setting Up Your Profile' : 'Checking Profile Status'}
        </Typography>

        {error ? (
          <>
            <Alert severity="error" sx={{ mb: 3, mt: 2 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRetry}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              {initializing
                ? `Please wait while we set up your profile (attempt ${attemptCount}/15)...`
                : 'Checking if your profile is ready...'}
            </Typography>

            {initializing ? (
              <Box sx={{ width: '100%', mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {Math.round(progress)}% Complete
                </Typography>
              </Box>
            ) : (
              <CircularProgress sx={{ my: 3 }} />
            )}

            <Typography variant="body2" color="text.secondary">
              This process may take a few moments.
              <br />
              We're creating your profile for the first time.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ProfileInitializer; 