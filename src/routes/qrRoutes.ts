import { Router } from 'express';
import { generateQrCodeHandler, verifyQrCodeHandler } from '../controllers/qrController';
import { getQrHistoryHandler, deleteQrCodeHandler } from '../controllers/qrHistoryController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// QR kod oluşturma - Yetkilendirme gerektirir
router.post('/generate', authMiddleware, generateQrCodeHandler);

// QR kod doğrulama - Yetkilendirme gerektirir
router.post('/verify', authMiddleware, verifyQrCodeHandler);

// QR kod geçmişini getir - Yetkilendirme gerektirir
router.get('/history', authMiddleware, getQrHistoryHandler);

// QR kodu sil - Yetkilendirme gerektirir
router.delete('/:qrTokenId', authMiddleware, deleteQrCodeHandler);

export default router;
