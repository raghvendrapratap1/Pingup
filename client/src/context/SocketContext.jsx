import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const currentUser = useSelector((state) => state.user.value);

  useEffect(() => {
    if (!currentUser?._id) {
      // Close existing socket connection if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Don't create multiple connections
    if (socketRef.current) return;

    console.log('Connecting to Socket.IO for user:', currentUser._id);
    
    // Prefer a dedicated SOCKET URL for deployments behind proxies (e.g., Vercel)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BASEURL;

    // Connect to Socket.IO server with robust options for serverless/proxy envs
    const socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        userId: currentUser._id
      }
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('Socket.IO connected');
      // Join user's personal room
      socket.emit('join', { userId: currentUser._id });
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket.IO connection error:', error);
      socketRef.current = null;
    });

    return () => {
      console.log('Closing Socket.IO connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?._id]);

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const value = {
    socket: socketRef.current,
    emit,
    on,
    off,
    connected: !!socketRef.current?.connected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
