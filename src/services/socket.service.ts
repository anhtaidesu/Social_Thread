import { io, Socket } from 'socket.io-client';
import { store } from '../app/store';
import { addNotification } from '../features/notifications/notificationsSlice';
import { Notification } from '../types';
import { updateSocketStatus, SocketStatus, handleProfileMissingError, scheduleReconnect } from '../utils/socketManager';
import { toast } from 'react-toastify';

// Socket.io configuration
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || (process.env.REACT_APP_SOCIAL_API_URL ? process.env.REACT_APP_SOCIAL_API_URL.replace('http://', 'ws://') : 'ws://localhost:8081');

class SocketService {
  private socket: Socket | null = null;
  private initialized = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize the socket connection
   */
  public init(): void {
    if (this.initialized && this.socket) {
      console.log('Socket already initialized, reconnecting...');
      this.connect();
      return;
    }

    try {
      console.log('Initializing socket connection to:', SOCKET_URL);
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: false,
        reconnection: false, // We'll handle reconnection manually
        auth: (cb) => {
          // Get the token from Redux store or localStorage
          const token = store.getState().auth?.token || localStorage.getItem('token');
          console.log('Providing auth token for socket connection:', token ? 'Token available' : 'No token available');
          if (!token) {
            console.warn('No token available for socket authentication');
          }
          cb({ token });
        }
      });

      this.setupEventListeners();
      this.connect();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing socket:', error);
      updateSocketStatus(SocketStatus.ERROR, error instanceof Error ? error.message : 'Failed to initialize socket');
    }
  }

  /**
   * Reset socket connection (for when token changes)
   */
  public reset(): void {
    console.log('Resetting socket connection...');
    this.disconnect();
    this.initialized = false;
    this.socket = null;
    this.init();
  }

  /**
   * Connect to the socket server
   */
  public connect(): void {
    if (!this.socket) {
      console.error('Socket not initialized, cannot connect');
      updateSocketStatus(SocketStatus.ERROR, 'Socket not initialized');
      return;
    }

    console.log('Connecting to socket server at:', SOCKET_URL);
    try {
      this.socket.connect();
      console.log('Socket connection initiated');
    } catch (error) {
      console.error('Error connecting to socket server:', error);
      updateSocketStatus(SocketStatus.ERROR, error instanceof Error ? error.message : 'Failed to connect to socket server');
      // Let the manager handle reconnection
      scheduleReconnect();
    }
  }

  /**
   * Disconnect from the socket server
   */
  public disconnect(): void {
    if (!this.socket) return;

    console.log('Disconnecting from socket server...');
    this.socket.disconnect();
    
    // Clear any reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Register a handler for a custom event
   */
  public on(event: string, callback: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    this.eventHandlers.get(event)?.push(callback);
    
    // If socket already exists, add the listener
    if (this.socket) {
      this.socket.on(event, (...args) => callback(...args));
    }
  }

  /**
   * Remove handlers for a specific event
   */
  public off(event: string): void {
    this.eventHandlers.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  /**
   * Emit an event to the server
   */
  public emit(event: string, ...args: any[]): void {
    if (!this.socket || !this.socket.connected) {
      console.warn(`Cannot emit ${event}: socket not connected`);
      toast.warning('Cannot send data: not connected to server. Please check your connection.', { 
        position: 'top-right', 
        autoClose: 3000 
      });
      return;
    }

    this.socket.emit(event, ...args);
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('connect_error', this.handleConnectError.bind(this));

    // Application events
    this.socket.on('notification', this.handleNotification.bind(this));
    
    // Register any event handlers that were added before socket initialization
    this.eventHandlers.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, (...args) => callback(...args));
      });
    });
  }

  /**
   * Handle socket connection
   */
  private handleConnect(): void {
    console.log('Socket connected with ID:', this.socket?.id);
    updateSocketStatus(SocketStatus.CONNECTED);
    this.reconnectAttempts = 0;
    
    // Notify the user of successful connection
    if (this.reconnectAttempts > 0) {
      toast.success('Reconnected to real-time services!', { 
        position: 'top-right', 
        autoClose: 3000 
      });
    }
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnect(reason: string): void {
    console.log('Socket disconnected. Reason:', reason);
    
    // Known disconnection reasons that shouldn't trigger a reconnect
    const plannedDisconnects = ['io client disconnect', 'io server disconnect'];
    
    if (plannedDisconnects.includes(reason)) {
      console.log('Planned disconnect, not attempting reconnect');
      updateSocketStatus(SocketStatus.DISCONNECTED);
    } else {
      console.log('Unplanned disconnect, scheduling reconnect');
      updateSocketStatus(SocketStatus.DISCONNECTED, `Disconnected: ${reason}`);
      // Use the manager's reconnection strategy
      scheduleReconnect();
    }
  }

  /**
   * Handle connection error
   */
  private handleConnectError(error: Error): void {
    console.error('Socket connection error:', error);
    
    // Check for specific error messages
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('User profile not found') || errorMessage.includes('profile not found')) {
      console.log('Profile missing error detected. This may be normal for new users.');
      handleProfileMissingError(errorMessage);
    } else {
      updateSocketStatus(SocketStatus.ERROR, errorMessage);
      // Use the manager's reconnection strategy
      scheduleReconnect();
    }
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(notification: Notification): void {
    console.log('New notification received:', notification);
    store.dispatch(addNotification(notification));
    
    // Show a toast notification for real-time alerts
    const message = notification.message || 'You have a new notification';
    toast.info(message, {
      position: 'top-right',
      autoClose: 5000
    });
  }

  /**
   * Join a room (e.g., for direct messages or specific notification channels)
   */
  public joinRoom(room: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot join room: socket not connected');
      return;
    }

    console.log('Joining room:', room);
    this.socket.emit('join', { room });
  }

  /**
   * Leave a room
   */
  public leaveRoom(room: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot leave room: socket not connected');
      return;
    }

    console.log('Leaving room:', room);
    this.socket.emit('leave', { room });
  }

  /**
   * Get the current connection status
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create a singleton instance
export const socketService = new SocketService();

export default socketService; 