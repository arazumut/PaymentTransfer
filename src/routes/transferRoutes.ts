import express from 'express';
import { createTransferHandler, getTransactionsHandler } from '../controllers/transferController';
import { idempotencyMiddleware } from '../middlewares/idempotencyMiddleware';

const router = express.Router();

// Transfer rotaları
router.post('/transfer', idempotencyMiddleware, createTransferHandler);
router.get('/transactions', getTransactionsHandler);

export default router; 