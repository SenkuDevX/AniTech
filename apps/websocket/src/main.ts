import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import pino from 'pino';

const logger = pino({ name: 'anitech-ws' });
const prisma = new PrismaClient();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Redis adapter for horizontal scaling
const REDIS_URL = process.env.REDIS_URL;
if (REDIS_URL) {
  const pubClient = new Redis(REDIS_URL);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  logger.info('Redis adapter connected');
}

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const jwt = await import('jsonwebtoken');
    const payload = jwt.default.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, displayName: true, avatarUrl: true },
    });

    if (!user) return next(new Error('User not found'));

    (socket as any).user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// Track online users
const onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

io.on('connection', (socket) => {
  const user = (socket as any).user;
  logger.info(`User connected: ${user.username}`);

  // Join user's personal room
  socket.join(`user:${user.id}`);

  // Track online status
  if (!onlineUsers.has(user.id)) {
    onlineUsers.set(user.id, new Set());
  }
  onlineUsers.get(user.id)!.add(socket.id);

  // Broadcast online status
  io.emit('user:online', { userId: user.id, username: user.username });

  // Update last active
  prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date() },
  }).catch(() => {});

  // --- Watch Party Events ---
  socket.on('party:join', async (data: { partyId: string }) => {
    socket.join(`party:${data.partyId}`);
    socket.to(`party:${data.partyId}`).emit('party:user-joined', {
      userId: user.id,
      username: user.username,
    });
  });

  socket.on('party:leave', (data: { partyId: string }) => {
    socket.leave(`party:${data.partyId}`);
    socket.to(`party:${data.partyId}`).emit('party:user-left', {
      userId: user.id,
      username: user.username,
    });
  });

  socket.on('party:playback-update', (data: { partyId: string; progress: number; isPlaying: boolean; timestamp: number }) => {
    socket.to(`party:${data.partyId}`).emit('party:sync', {
      userId: user.id,
      progress: data.progress,
      isPlaying: data.isPlaying,
      timestamp: data.timestamp,
    });
  });

  socket.on('party:chat', async (data: { partyId: string; message: string }) => {
    const msg = await prisma.watchPartyMessage.create({
      data: {
        partyId: data.partyId,
        userId: user.id,
        content: data.message,
        type: 'TEXT',
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
    io.to(`party:${data.partyId}`).emit('party:message', msg);
  });

  socket.on('party:reaction', (data: { partyId: string; emoji: string }) => {
    io.to(`party:data.partyId`).emit('party:reaction', {
      userId: user.id,
      username: user.username,
      emoji: data.emoji,
    });
  });

  // --- Notification Events ---
  socket.on('notifications:subscribe', () => {
    // User is already in their personal room, notifications are sent there
  });

  // --- Presence Events ---
  socket.on('presence:update', (data: { status: string; activity?: string }) => {
    io.emit('presence:changed', {
      userId: user.id,
      username: user.username,
      status: data.status,
      activity: data.activity,
    });
  });

  socket.on('typing:start', (data: { room: string }) => {
    socket.to(data.room).emit('typing:update', {
      userId: user.id,
      username: user.username,
      isTyping: true,
    });
  });

  socket.on('typing:stop', (data: { room: string }) => {
    socket.to(data.room).emit('typing:update', {
      userId: user.id,
      username: user.username,
      isTyping: false,
    });
  });

  // --- Disconnect ---
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${user.username}`);

    const userSockets = onlineUsers.get(user.id);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(user.id);
        io.emit('user:offline', { userId: user.id, username: user.username });
      }
    }
  });
});

// Emit notification to specific user
export function emitNotification(userId: string, notification: any) {
  io.to(`user:${userId}`).emit('notification', notification);
}

const PORT = parseInt(process.env.WS_PORT || '4001', 10);
httpServer.listen(PORT, () => {
  logger.info(`WebSocket server running on port ${PORT}`);
});