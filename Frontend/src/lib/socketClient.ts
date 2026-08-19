import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    const backendUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:5001'
      : (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') || window.location.origin;

    socket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ [WebSocket] Connected to real-time event bus:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [WebSocket] Connection warning:', err.message);
    });
  }

  return socket;
}

export function connectSocket(organizationId?: string, userId?: string): Socket {
  const s = getSocketClient();
  if (!s.connected) {
    s.connect();
  }

  if (organizationId) {
    s.emit('join_tenant', organizationId);
  }

  if (userId) {
    s.emit('join_user', userId);
  }

  return s;
}

export function disconnectSocket(): void {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
