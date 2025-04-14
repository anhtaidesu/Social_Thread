import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Tooltip, 
  Button, 
  Popover,
  CircularProgress
} from '@mui/material';
import { 
  WifiOff as DisconnectedIcon,
  Wifi as ConnectedIcon,
  SyncProblem as ErrorIcon,
  Sync as ConnectingIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import socketManager, { SocketStatus } from '../utils/socketManager';
import { ProfileService } from '../services/profile.service';

/**
 * Component that displays the current socket connection status
 */
const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<SocketStatus>(socketManager.getSocketStatus());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [checkingProfile, setCheckingProfile] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (status === SocketStatus.ERROR || status === SocketStatus.DISCONNECTED || status === SocketStatus.PROFILE_MISSING) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleReconnect = () => {
    socketManager.reconnectNow();
    handleClose();
  };

  const handleVerifyProfile = async () => {
    setCheckingProfile(true);
    
    try {
      // Check profile status
      const statusCheck = await ProfileService.checkProfileStatus();
      
      if (statusCheck.success) {
        if (statusCheck.exists) {
          // Profile exists, reconnect
          socketManager.reconnectNow();
          handleClose();
        } else if (statusCheck.isInitializing) {
          // Profile is being created, show waitForProfileCreation 
          const waitResult = await ProfileService.waitForProfileCreation();
          if (waitResult.success) {
            // Profile is now created, reconnect
            socketManager.reconnectNow();
            handleClose();
          }
        }
      }
    } catch (error) {
      console.error('Error verifying profile:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'connection-popover' : undefined;

  useEffect(() => {
    // Add listener for socket status changes
    const statusListener = (newStatus: SocketStatus) => {
      setStatus(newStatus);
      setErrorMessage(socketManager.getLastError());
    };
    
    socketManager.addSocketStatusListener(statusListener);
    
    // Clean up on unmount
    return () => {
      socketManager.removeSocketStatusListener(statusListener);
    };
  }, []);

  // Determine status display details
  const getStatusDisplay = () => {
    switch (status) {
      case SocketStatus.CONNECTED:
        return {
          label: 'Connected',
          color: 'success' as const,
          icon: <ConnectedIcon fontSize="small" />,
          tooltip: 'Real-time connection established'
        };
      case SocketStatus.CONNECTING:
        return {
          label: 'Connecting',
          color: 'warning' as const,
          icon: <ConnectingIcon fontSize="small" className="rotating" />,
          tooltip: 'Establishing connection...'
        };
      case SocketStatus.DISCONNECTED:
        return {
          label: 'Disconnected',
          color: 'default' as const,
          icon: <DisconnectedIcon fontSize="small" />,
          tooltip: 'Not connected to real-time services. Click to reconnect.'
        };
      case SocketStatus.PROFILE_MISSING:
        return {
          label: 'Profile Setup',
          color: 'info' as const,
          icon: <PersonIcon fontSize="small" />,
          tooltip: 'Waiting for your profile to be created. Click for details.'
        };
      case SocketStatus.ERROR:
        return {
          label: 'Error',
          color: 'error' as const,
          icon: <ErrorIcon fontSize="small" />,
          tooltip: 'Connection error. Click to see details and reconnect.'
        };
      default:
        return {
          label: 'Unknown',
          color: 'default' as const,
          icon: <DisconnectedIcon fontSize="small" />,
          tooltip: 'Connection status unknown'
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const isClickable = status === SocketStatus.ERROR || 
                     status === SocketStatus.DISCONNECTED || 
                     status === SocketStatus.PROFILE_MISSING;

  return (
    <>
      <Tooltip title={statusDisplay.tooltip}>
        <Chip
          icon={statusDisplay.icon}
          label={statusDisplay.label}
          color={statusDisplay.color}
          size="small"
          onClick={isClickable ? handleClick : undefined}
          sx={{ 
            height: '24px',
            '& .MuiChip-label': {
              fontSize: '0.7rem'
            },
            cursor: isClickable ? 'pointer' : 'default',
            '& .rotating': {
              animation: 'spin 2s linear infinite',
              '@keyframes spin': {
                '0%': {
                  transform: 'rotate(0deg)',
                },
                '100%': {
                  transform: 'rotate(360deg)',
                },
              },
            }
          }}
        />
      </Tooltip>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle1" gutterBottom>
            {status === SocketStatus.PROFILE_MISSING 
              ? 'Profile Setup in Progress' 
              : `Connection Status: ${statusDisplay.label}`}
          </Typography>
          
          {errorMessage && (
            <Typography variant="body2" color="error" sx={{ my: 1 }}>
              {errorMessage}
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            {status === SocketStatus.PROFILE_MISSING 
              ? 'Your profile is being created for the first time. Real-time features will work once this is complete.' 
              : 'Real-time features like notifications may not work correctly. Would you like to try reconnecting?'}
          </Typography>
          
          {status === SocketStatus.PROFILE_MISSING ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerifyProfile}
              disabled={checkingProfile}
              startIcon={checkingProfile ? <CircularProgress size={20} /> : <PersonIcon />}
              fullWidth
            >
              {checkingProfile ? 'Checking Profile Status...' : 'Verify Profile Status'}
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleReconnect}
              fullWidth
            >
              Reconnect Now
            </Button>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default ConnectionStatus; 