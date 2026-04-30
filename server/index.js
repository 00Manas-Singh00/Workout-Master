import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';

// ── Active timer map: socketId → intervalId ──────────────────────────────────
const activeTimers = new Map();

const clearTimer = (socketId) => {
  if (activeTimers.has(socketId)) {
    clearInterval(activeTimers.get(socketId));
    activeTimers.delete(socketId);
  }
};

const attachSocketServer = (httpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.nodeEnv !== 'production' ? '*' : env.corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    const clerkUserId = socket.handshake.auth?.clerkUserId || 'anonymous';
    logger.info('Socket connected', { socketId: socket.id, clerkUserId });

    // ── timer:start ──────────────────────────────────────────────────────────
    // Payload: { restSec: number }
    socket.on('timer:start', ({ restSec } = {}) => {
      clearTimer(socket.id); // cancel any running timer first

      const duration = Math.max(5, Math.min(Number(restSec) || 90, 600));
      let remaining = duration;

      logger.info('Rest timer started', { socketId: socket.id, duration });
      socket.emit('timer:tick', { remaining, total: duration });

      const interval = setInterval(() => {
        remaining -= 1;
        socket.emit('timer:tick', { remaining, total: duration });

        if (remaining <= 0) {
          clearTimer(socket.id);
          socket.emit('timer:done');
          logger.info('Rest timer done', { socketId: socket.id });
        }
      }, 1000);

      activeTimers.set(socket.id, interval);
    });

    // ── timer:cancel ─────────────────────────────────────────────────────────
    socket.on('timer:cancel', () => {
      clearTimer(socket.id);
      socket.emit('timer:cancelled');
    });

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      clearTimer(socket.id);
      logger.info('Socket disconnected', { socketId: socket.id });
    });
  });

  return io;
};

const start = async () => {
  try {
    await connectDB(env.mongoUri);
    logger.info('Connected to MongoDB');

    const app = await createApp();
    const httpServer = createServer(app);

    attachSocketServer(httpServer);

    httpServer.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} (HTTP + WebSocket)`);
    });
  } catch (error) {
    logger.error('Startup error:', error.message);
    process.exit(1);
  }
};

start();
