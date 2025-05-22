import { Router } from 'express';
import { 
  createMoneyRequestHandler, 
  respondToRequestHandler, 
  getMoneyRequestsHandler 
} from '../controllers/moneyRequestController';

const router = Router();

// Para isteği oluştur
router.post('/', createMoneyRequestHandler);

// Para isteğine yanıt ver
router.put('/:id/respond', respondToRequestHandler);

// Kullanıcının para isteklerini getir
router.get('/user/:userId', getMoneyRequestsHandler);

export default router;
