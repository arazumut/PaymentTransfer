import express from 'express';
import { createTransferHandler, getTransactionsHandler } from '../controllers/transferController';
import { idempotencyMiddleware } from '../middlewares/idempotencyMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Transfer rotaları - Yetkilendirme gerektirir
router.post('/', authMiddleware, idempotencyMiddleware, createTransferHandler);
router.get('/transactions', authMiddleware, getTransactionsHandler);

export default router; 