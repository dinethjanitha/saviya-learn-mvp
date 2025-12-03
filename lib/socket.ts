import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // Socket.io connects to the server root, not /api
    const BACKEND_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    console.log('🔌 Connecting to Socket.io server:', BACKEND_URL);
    
    socket = io(BACKEND_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket.io connected! ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected. Reason:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.io reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Socket.io reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Socket.io reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Socket.io reconnection failed');
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
