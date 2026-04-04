import { io, Socket } from "socket.io-client";
import { apiBaseUrl } from "./axiosInstance";

// Initialize socket connection with improved settings
export const socket: Socket = io(apiBaseUrl, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: false, // Don't auto-connect, let us control it
});

// Connection state tracking
let isRegistered = false;
let pendingUserId: string | null = null;

// Socket event listeners for debugging
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  // Re-register user if we had a pending registration
  if (pendingUserId) {
    socket.emit('registerUser', pendingUserId);
    isRegistered = true;
    console.log('🔄 Re-registered user after reconnect:', pendingUserId);
  }
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
  isRegistered = false;
});

socket.on('connect_error', (error) => {
  console.warn('⚠️ Socket connection error:', error.message);
});

// Register user with socket when authenticated
export const registerUserSocket = (userId: string) => {
  if (!userId) return;
  
  pendingUserId = userId;
  
  if (socket.connected) {
    socket.emit('registerUser', userId);
    isRegistered = true;
    console.log('👤 User registered with socket:', userId);
  } else {
    // Connect and register
    connectSocket();
  }
};

// Get current socket ID
export const getSocketId = () => socket.id;

// Check if socket is connected and user is registered
export const isSocketReady = () => socket.connected && isRegistered;

// Connect socket
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log('🔌 Connecting socket...');
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    isRegistered = false;
    pendingUserId = null;
    console.log('🔌 Socket disconnected manually');
  }
};

// Cleanup function for component unmount
export const cleanupSocket = () => {
  socket.removeAllListeners('roadmap-progress');
  socket.removeAllListeners('progressUpdated');
};