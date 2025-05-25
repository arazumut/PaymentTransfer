import { Router } from 'express';
import { 
  createMoneyRequestHandler, 
  respondToRequestHandler, 
  getMoneyRequestsHandler 
} from '../controllers/moneyRequestController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Para isteği oluştur - Yetkilendirme gerektirir
router.post('/', authMiddleware, createMoneyRequestHandler);

// Para isteğine yanıt ver - Yetkilendirme gerektirir
router.put('/:id/respond', authMiddleware, respondToRequestHandler);

// Kullanıcının para isteklerini getir - Yetkilendirme gerektirir
router.get('/user/:userId', authMiddleware, getMoneyRequestsHandler);

export default router;
