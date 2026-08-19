import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './env.js';
import { eventBus } from '../shared/events/EventBus.js';
import { logger } from '../shared/logger/logger.js';

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.debug(`🔌 WebSocket client connected: ${socket.id}`);

    // Client joins tenant and user isolated rooms
    socket.on('join_tenant', (organizationId: string) => {
      if (organizationId) {
        socket.join(`tenant:${organizationId}`);
        logger.debug(`🔌 Socket ${socket.id} joined tenant room: ${organizationId}`);
      }
    });

    socket.on('join_user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        logger.debug(`🔌 Socket ${socket.id} joined user room: ${userId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`🔌 WebSocket client disconnected (${socket.id}): ${reason}`);
    });
  });

  // Attach EventBus-to-Socket.IO real-time event bridge
  setupEventBusBridge();

  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

export function emitTenantEvent(organizationId: string, event: string, payload: unknown): void {
  if (io) {
    io.to(`tenant:${organizationId}`).emit(event, payload);
  }
}

export function emitUserEvent(userId: string, event: string, payload: unknown): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}

/**
 * EventBus Domain Bridge: Automatically broadcasts internal domain events
 * across real-time WebSocket tenant & user rooms.
 */
function setupEventBusBridge(): void {
  eventBus.on('deal.stage_changed', (p) => {
    emitTenantEvent(p.organizationId, 'deal:stage_changed', p);
  });

  eventBus.on('deal.won', (p) => {
    emitTenantEvent(p.organizationId, 'deal:won', p);
  });

  eventBus.on('lead.created', (p) => {
    emitTenantEvent(p.organizationId, 'lead:created', p);
  });

  eventBus.on('lead.score_updated', (p) => {
    emitTenantEvent(p.organizationId, 'lead:score_updated', p);
  });

  eventBus.on('call.completed', (p) => {
    emitTenantEvent(p.organizationId, 'call:completed', p);
  });

  eventBus.on('payment.received', (p) => {
    emitTenantEvent(p.organizationId, 'payment:received', p);
  });

  eventBus.on('task.created', (p) => {
    emitTenantEvent(p.organizationId, 'task:created', p);
    if (p.assignedTo) {
      emitUserEvent(p.assignedTo, 'task:created', p);
    }
  });

  logger.info('⚡ Real-time Socket.IO EventBus Bridge initialized.');
}
