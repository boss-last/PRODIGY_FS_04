import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import roomRoutes from './routes/rooms.js';
import uploadRoutes from './routes/upload.js';
import { authSocket } from './middleware/auth.js';
import { handleSocketEvents } from './utils/socketHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

async function connectDB() {
  const localUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prodigy_chat';
  try {
    await mongoose.connect(localUri);
    console.log('[DB] Connected to MongoDB');
  } catch (err) {
    console.warn('[DB] Local MongoDB failed, falling back to memory server...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    const uri = mem.getUri();
    await mongoose.connect(uri);
    console.log('[DB] Connected to MongoDB Memory Server');
  }
}

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/upload', uploadRoutes);

io.use(authSocket);
handleSocketEvents(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
});
