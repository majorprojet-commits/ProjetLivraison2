import express from 'express';
import next from 'next';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import apiRoutes from './server/api/routes/index.js';
import { connectDB } from './server/db/mongoose.js';

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
    cors: { origin: "*" }
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

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // API Routes
  console.log('Registering API routes...');
  app.use('/api', apiRoutes);

  // Next.js handler
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
}

startServer();
