import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import colyseus from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { createApiRouter } from './api/routes.js';
import { TeaRoom } from './rooms/TeaRoom.js';

const { Server } = colyseus;

const app: express.Express = express();
const port: number = Number(process.env.PORT) || 3001;

// Permissive CORS reflecting request origin to support localhost, 127.0.0.1 and mobile LAN testing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or any origin in dev
      callback(null, true);
    },
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads for avatars
const uploadDir = process.env.MEDIA_UPLOAD_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir, { maxAge: '1d' }));

// Mount REST API
app.use('/api', createApiRouter());

// Health & liveness probes (Section 24)
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', (_req, res) => {
  res.json({ status: 'ready' });
});

// Production static frontend serving (SPA fallback)
const candidateWebDirs = [
  path.resolve(process.cwd(), '../web/dist'),
  path.resolve(process.cwd(), 'apps/web/dist'),
  path.resolve(process.cwd(), 'dist/web')
];
const webDistDir = candidateWebDirs.find(
  (dir) => fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))
);

if (webDistDir) {
  app.use(express.static(webDistDir));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/ready')
    ) {
      return next();
    }
    res.sendFile(path.join(webDistDir, 'index.html'));
  });
}

// Create HTTP and Colyseus Game Server
const httpServer = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer
  })
});

// Register the authoritative TeaRoom
gameServer.define('tea_room', TeaRoom).enableRealtimeListing();

// Start listening
httpServer.listen(port, () => {
  console.log(`🍵 Trà Duyên server đang chạy tại cổng http://localhost:${port}`);
  console.log(`📡 WebSocket Game Server đã sẵn sàng tại ws://localhost:${port}`);
});

// Graceful shutdown handling (Section 24)
const handleGracefulShutdown = async () => {
  console.log('Đang thực hiện đóng máy chủ an toàn (graceful shutdown)...');
  await gameServer.gracefullyShutdown();
  httpServer.close(() => {
    console.log('Máy chủ HTTP đã đóng hoàn toàn.');
    process.exit(0);
  });
};

process.on('SIGINT', handleGracefulShutdown);
process.on('SIGTERM', handleGracefulShutdown);

export { app, httpServer, gameServer };
