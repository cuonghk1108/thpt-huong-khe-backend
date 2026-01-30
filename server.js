import dotenv from 'dotenv';
dotenv.config();

// MongoDB Connection String từ .env
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables!');
  console.error('💡 Create backend/.env.local file with MONGODB_URI');
  process.exit(1);
}
const mongoUri = process.env.MONGODB_URI;

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';

// Import middleware
import { httpLogger, default as logger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import newsRoutes from './routes/news.js';
import teacherRoutes from './routes/teachers.js';
import clubRoutes from './routes/clubs.js';
import galleryRoutes from './routes/gallery.js';
import eventRoutes from './routes/events.js';
import authRoutes from './routes/auth.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://thpthuongkhe.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(httpLogger);

// MongoDB Connection
mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

// 404 Not Found Handler
app.use('*', notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

// Socket.io Real-time Connection
io.on('connection', (socket) => {
  console.log(`🔴 User connected: ${socket.id}`);

  // Join room cho updates
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`📍 User ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

// Export io để dùng trong routes
export { io };

// Server Listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io listening on ws://localhost:${PORT}`);
  console.log(`✅ CORS enabled for frontend\n`);
});
