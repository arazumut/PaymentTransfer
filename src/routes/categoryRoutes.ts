import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getAllCategories,
  createCategory,
  categorizeTransactionController,
  getTransactionCategoriesController,
  getSpendingAnalyticsController
} from '../controllers/categoryController';

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(authMiddleware);

// Tüm harcama kategorilerini getir
router.get('/', getAllCategories);

// Yeni kategori oluştur (admin için)
router.post('/', createCategory);

// Harcama analizlerini getir
router.get('/analytics', getSpendingAnalyticsController);

// İşlemin kategorilerini getir
router.get('/transaction/:id', getTransactionCategoriesController);

// İşlemi kategorize et
router.post('/transaction/:id', categorizeTransactionController);

export default router;
