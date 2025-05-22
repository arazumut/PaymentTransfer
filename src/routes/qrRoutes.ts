import { Router } from 'express';
import { generateQrCodeHandler, verifyQrCodeHandler } from '../controllers/qrController';

const router = Router();

// QR kod oluşturma
router.post('/generate', generateQrCodeHandler);

// QR kod doğrulama
router.post('/verify', verifyQrCodeHandler);

export default router;
