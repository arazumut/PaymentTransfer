import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getAllCategories,
  createBudget,
  getUserBudgets,
  getBudgetDetails,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController';

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(authMiddleware);

// Harcama kategorilerini getir
router.get('/categories', getAllCategories);

// Kullanıcının bütçelerini getir
router.get('/', getUserBudgets);

// Bütçe detayını ve ilerlemeyi getir
router.get('/:id', getBudgetDetails);

// Yeni bütçe oluştur
router.post('/', createBudget);

// Bütçeyi güncelle
router.put('/:id', updateBudget);

// Bütçeyi sil
router.delete('/:id', deleteBudget);

export default router;
