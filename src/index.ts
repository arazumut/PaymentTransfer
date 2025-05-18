import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transferRoutes from './routes/transferRoutes';
import userRoutes from './routes/userRoutes';
import { logger } from './utils/logger';
import { scheduleTransfers } from './services/schedulerService';

// Environment variables
dotenv.config();
const PORT = process.env.PORT || 3000;

// Express app setup
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', transferRoutes);
app.use('/api', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Start scheduled transfers job
  scheduleTransfers();
});

export default app; 