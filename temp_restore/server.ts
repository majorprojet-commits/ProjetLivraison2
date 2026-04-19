import express from 'express';
import next from 'next';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import apiRoutes from './server/api/routes/index.ts';
import { connectDB } from './server/db/mongoose.ts';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

async function startServer() {
  console.log('Starting Next.js app preparation...');
  try {
    await nextApp.prepare();
    console.log('Next.js app prepared successfully.');
  } catch (err) {
    console.error('Error during Next.js app preparation:', err);
    process.exit(1);
  }
  
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  const PORT = 3000;

  console.log('Connecting to MongoDB...');
  try {
    await connectDB();
    console.log('Connected to MongoDB.');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }

  app.use(express.json());

  // Attach io to req
  app.use((req: any, res, next) => {
    req.io = io;
    next();
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('join', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('updateLocation', (data) => {
      // data: { orderId, lat, lng, driverId }
      console.log(`[Socket] Location update for order ${data.orderId}:`, data.lat, data.lng);
      io.to(`order_${data.orderId}`).emit('locationUpdated', data);
      // Also broadcast to admin for monitoring
      io.to('admin').emit('locationUpdated', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // API Routes
  console.log('[Server] Registering API routes at /api...');
  app.use('/api', (req, res, next) => {
    // This logs every call that HITS the /api prefix
    console.log(`[API CALL] ${req.method} ${req.url}`);
    next();
  }, apiRoutes);

  // Health check for troubleshooting (explicitly on /api/health)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      socketConnected: io.sockets.size,
      uptime: process.uptime(),
      time: new Date().toISOString()
    });
  });

  // Global Error Handler for API (must be AFTER routes)
  app.use((err: any, req: any, res: any, next: any) => {
    const url = req.url || '';
    if (url.startsWith('/api') || req.originalUrl?.startsWith('/api')) {
      console.error('[API Error Detail] Path:', url, 'Error:', err);
      return res.status(err.status || 500).json({
        error: err.message || 'Erreur interne du serveur API',
        path: url,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
    next(err);
  });

  // Next.js handler
  app.all(/.*/, (req, res) => {
    const url = req.url || '';
    const originalUrl = req.originalUrl || '';
    
    // ABSOLUTE BLOCK: Never serve HTML for anything starting with /api
    if (url.startsWith('/api') || originalUrl.startsWith('/api')) {
      console.warn(`[Server] BLOCKING API FALLTHROUGH: ${url}`);
      return res.status(404).json({ 
        error: `Route API ${req.method} ${url} non trouvée dans l'application Express.`,
        hint: "Assurez-vous que la route est définie dans server/api/routes/index.ts"
      });
    }
    return handle(req, res);
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
}

startServer();
