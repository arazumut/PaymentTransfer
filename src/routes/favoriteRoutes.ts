import { Router } from 'express';
import { 
  addFavoriteHandler, 
  removeFavoriteHandler, 
  getFavoritesHandler 
} from '../controllers/favoriteController';

const router = Router();

// Favori ekle
router.post('/', addFavoriteHandler);

// Favori çıkar
router.delete('/:userId/:favoriteId', removeFavoriteHandler);

// Kullanıcının favorilerini getir
router.get('/:userId', getFavoritesHandler);

export default router;
