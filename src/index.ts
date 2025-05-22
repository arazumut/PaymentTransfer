import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import transferRoutes from './routes/transferRoutes';
import userRoutes from './routes/userRoutes';
import qrRoutes from './routes/qrRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import notificationRoutes from './routes/notificationRoutes';
import moneyRequestRoutes from './routes/moneyRequestRoutes';
import authRoutes from './routes/authRoutes';
import { logger } from './utils/logger';
import { scheduleTransfers } from './services/schedulerService';
import { initializeSocketIO } from './services/notificationService';

// Environment variables
dotenv.config();
const PORT = process.env.PORT || 3000;

// Express app setup
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocketIO(server);

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/money-requests', moneyRequestRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Start scheduled transfers job
  scheduleTransfers();
});

export default app; 