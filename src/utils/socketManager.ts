/**
 * Socket Manager Utility
 * 
 * This utility helps manage socket connection lifecycle and provides
 * centralized error handling and reconnection logic.
 */
import socketService from "../services/socket.service";
import { toast } from 'react-toastify';

// Socket status enum
export enum SocketStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  ERROR = 'error',
  PROFILE_MISSING = 'profile_missing'
}

// Connection monitoring
let socketStatus: SocketStatus = SocketStatus.DISCONNECTED;
let connectionListeners: ((status: SocketStatus) => void)[] = [];
let lastError: string | null = null;
let reconnectTimerId: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Updates the socket status and notifies all listeners
 */
export const updateSocketStatus = (status: SocketStatus, errorMessage?: string): void => {
  socketStatus = status;
  
  if (errorMessage) {
    lastError = errorMessage;
    console.error(`Socket error: ${errorMessage}`);
  } else if (status === SocketStatus.CONNECTED) {
    // Clear error on successful connection
    lastError = null;
  }
  
  // Notify all listeners of the status change
  connectionListeners.forEach(listener => listener(status));
};

/**
 * Get the last error message
 */
export const getLastError = (): string | null => {
  return lastError;
};

/**
 * Add a listener for socket connection status changes
 */
export const addSocketStatusListener = (listener: (status: SocketStatus) => void): void => {
  connectionListeners.push(listener);
  // Immediately call with current status
  listener(socketStatus);
};

/**
 * Remove a socket status listener
 */
export const removeSocketStatusListener = (listener: (status: SocketStatus) => void): void => {
  connectionListeners = connectionListeners.filter(l => l !== listener);
};

/**
 * Get the current socket connection status
 */
export const getSocketStatus = (): SocketStatus => {
  return socketStatus;
};

/**
 * Calculate delay with exponential backoff
 */
const getReconnectDelay = (): number => {
  // Start with 1s delay, double each time, max 30s
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts), maxDelay);
  // Add some jitter to prevent all clients reconnecting simultaneously
  return delay + Math.random() * 1000;
};

/**
 * Clear any pending reconnect timers
 */
const clearReconnectTimer = (): void => {
  if (reconnectTimerId) {
    clearTimeout(reconnectTimerId);
    reconnectTimerId = null;
  }
};

/**
 * Schedule a reconnection attempt
 */
export const scheduleReconnect = (): void => {
  clearReconnectTimer();
  
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. User will need to refresh.`);
    updateSocketStatus(SocketStatus.ERROR, 'Connection failed after multiple attempts. Please refresh the page.');
    toast.error('Connection to real-time services failed. Please refresh the page.', {
      position: 'top-right',
      autoClose: false,
      closeOnClick: true
    });
    return;
  }
  
  reconnectAttempts++;
  const delay = getReconnectDelay();
  console.log(`Scheduling reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay/1000}s`);
  
  reconnectTimerId = setTimeout(() => {
    if (socketStatus !== SocketStatus.CONNECTED) {
      console.log(`Attempting reconnect #${reconnectAttempts}`);
      const token = localStorage.getItem('token');
      if (token) {
        initializeSocket(token);
      } else {
        updateSocketStatus(SocketStatus.ERROR, 'Authentication token not available for reconnection');
      }
    }
  }, delay);
};

/**
 * Initialize socket connection with handlers for connection events
 */
export const initializeSocket = (token: string | null): void => {
  if (!token) {
    console.warn('Cannot initialize socket without token');
    updateSocketStatus(SocketStatus.ERROR, 'No authentication token available');
    return;
  }
  
  try {
    clearReconnectTimer(); // Clear any pending reconnects
    updateSocketStatus(SocketStatus.CONNECTING);
    socketService.init();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Socket initialization error:', error);
    updateSocketStatus(SocketStatus.ERROR, errorMessage);
    scheduleReconnect();
  }
};

/**
 * Handle a profile missing error specifically
 */
export const handleProfileMissingError = (errorMessage: string): void => {
  // This indicates the profile is being created, show a notification
  updateSocketStatus(SocketStatus.PROFILE_MISSING, errorMessage);
  
  // Show a toast notification
  toast.info('Setting up your profile, this may take a moment...', {
    position: 'top-right',
    autoClose: 5000
  });
  
  // Reset reconnect counter and use a shorter initial delay for profile creation
  reconnectAttempts = 0;
  clearReconnectTimer();
  
  // Schedule a reconnection attempt after a delay
  reconnectTimerId = setTimeout(() => {
    if (socketStatus === SocketStatus.PROFILE_MISSING) {
      console.log('Attempting to reconnect after profile setup');
      const token = localStorage.getItem('token');
      if (token) {
        initializeSocket(token);
      }
    }
  }, 3000);
};

/**
 * Reconnect immediately with current token
 */
export const reconnectNow = (): void => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('Manual reconnection requested');
    reconnectAttempts = 0; // Reset counter for manual reconnect
    initializeSocket(token);
  } else {
    console.warn('Cannot reconnect: no token available');
  }
};

/**
 * Disconnect socket and clean up
 */
export const disconnectSocket = (): void => {
  clearReconnectTimer();
  reconnectAttempts = 0;
  socketService.disconnect();
  updateSocketStatus(SocketStatus.DISCONNECTED);
};

export default {
  initializeSocket,
  disconnectSocket,
  addSocketStatusListener,
  removeSocketStatusListener,
  getSocketStatus,
  getLastError,
  handleProfileMissingError,
  reconnectNow,
  scheduleReconnect,
  SocketStatus
}; 