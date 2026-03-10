import { io } from "socket.io-client";

// Initialize socket connection
export const socket = io("http://localhost:8000", {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Register user with socket when authenticated
export const registerUserSocket = (userId: string) => {
  if (userId && socket.connected) {
    socket.emit('registerUser', userId);
    console.log('User registered with socket:', userId);
  } else if (userId) {
    socket.once('connect', () => {
      socket.emit('registerUser', userId);
      console.log('User registered with socket after connection:', userId);
    });
  }
};

// Get current socket ID
export const getSocketId = () => socket.id;

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
  }
};