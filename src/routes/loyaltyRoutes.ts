import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  addLoyaltyPoints,
  spendLoyaltyPoints,
  getLoyaltyPointsStatus,
  getLoyaltyTransactions
} from '../controllers/loyaltyController';

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(authMiddleware);

// Kullanıcının sadakat puanı durumunu ve son işlemleri getir
router.get('/status', getLoyaltyPointsStatus);

// Kullanıcının tüm sadakat puanı işlemlerini getir
router.get('/transactions', getLoyaltyTransactions);

// Sadakat puanı ekle (admin veya özel kullanıcılar için)
router.post('/add', addLoyaltyPoints);

// Sadakat puanı harca
router.post('/spend', spendLoyaltyPoints);

export default router;
