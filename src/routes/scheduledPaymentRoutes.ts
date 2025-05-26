import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { idempotencyMiddleware } from '../middlewares/idempotencyMiddleware';
import {
  createScheduledPaymentController,
  updateScheduledPaymentController,
  cancelScheduledPaymentController,
  getScheduledPaymentsController
} from '../controllers/scheduledPaymentController';

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(authMiddleware);

// Kullanıcının planlı ödemelerini getir
router.get('/', getScheduledPaymentsController);

// Yeni planlı ödeme oluştur
router.post('/', idempotencyMiddleware, createScheduledPaymentController);

// Planlı ödemeyi güncelle
router.put('/:id', updateScheduledPaymentController);

// Planlı ödemeyi iptal et
router.delete('/:id', cancelScheduledPaymentController);

export default router;
