import { io, Socket } from 'socket.io-client';
import { store } from '../app/store';
import { addNotification } from '../features/notifications/notificationsSlice';
import { Notification } from '../types';

// Socket.io configuration
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'ws://localhost:8081';

class SocketService {
  private socket: Socket | null = null;
  private initialized = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize the socket connection
   */
  public init(): void {
    if (this.initialized) {
      console.log('Socket already initialized');
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
          const token = store.getState().auth.token || localStorage.getItem('token');
          cb({ token });
        }
      });

      this.setupEventListeners();
      this.connect();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }

  /**
   * Connect to the socket server
   */
  public connect(): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    console.log('Connecting to socket server...');
    this.socket.connect();
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
  }

  /**
   * Handle socket connection
   */
  private handleConnect(): void {
    console.log('Socket connected with ID:', this.socket?.id);
    // Reset reconnect attempts on successful connection
    this.reconnectAttempts = 0;
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnect(reason: string): void {
    console.log('Socket disconnected. Reason:', reason);
    this.attemptReconnect();
  }

  /**
   * Handle connection error
   */
  private handleConnectError(error: Error): void {
    console.error('Socket connection error:', error);
    this.attemptReconnect();
  }

  /**
   * Attempt to reconnect to the socket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectInterval / 1000}s...`);

    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Set up reconnect timer
    this.reconnectTimer = setTimeout(() => {
      console.log('Reconnecting...');
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(notification: Notification): void {
    console.log('New notification received:', notification);
    store.dispatch(addNotification(notification));
    
    // You can also show a toast or alert for the notification
    // This would typically be handled by the UI component that uses this service
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
}

// Create a singleton instance
export const socketService = new SocketService();

export default socketService; 