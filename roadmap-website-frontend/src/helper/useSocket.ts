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

socket.on('connect', () => {
  if (pendingUserId) {
    socket.emit('registerUser', pendingUserId);
    isRegistered = true;
  }
});

socket.on('disconnect', () => {
  isRegistered = false;
});

// Register user with socket when authenticated
export const registerUserSocket = (userId: string) => {
  if (!userId) return;
  
  pendingUserId = userId;
  
  if (socket.connected) {
    socket.emit('registerUser', userId);
    isRegistered = true;
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
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    isRegistered = false;
    pendingUserId = null;
  }
};

// Cleanup function for component unmount
export const cleanupSocket = () => {
  socket.removeAllListeners('roadmap-progress');
  socket.removeAllListeners('progressUpdated');
};