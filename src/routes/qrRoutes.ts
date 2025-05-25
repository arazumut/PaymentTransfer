import { Router } from 'express';
import { generateQrCodeHandler, verifyQrCodeHandler } from '../controllers/qrController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// QR kod oluşturma - Yetkilendirme gerektirir
router.post('/generate', authMiddleware, generateQrCodeHandler);

// QR kod doğrulama - Yetkilendirme gerektirir
router.post('/verify', authMiddleware, verifyQrCodeHandler);

export default router;
