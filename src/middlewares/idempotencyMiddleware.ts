import { Request, Response, NextFunction } from 'express';
import { getIdempotencyKey } from '../services/idempotencyService';
import { logger } from '../utils/logger';

// Custom response sınıfı ile response yönetimi
class CustomResponse {
  private originalSend: any;
  private body: any;
  private readonly res: Response;

  constructor(res: Response) {
    this.res = res;
    this.originalSend = res.send;
    this.patchSend();
  }

  patchSend() {
    this.res.send = (...args: any[]): any => {
      this.body = args[0];
      this.originalSend.apply(this.res, args);
      return this.res;
    };
  }

  getResponseBody() {
    return this.body;
  }

  unpatch() {
    this.res.send = this.originalSend;
  }
}

// Idempotency middleware
export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Sadece POST isteklerinde kontrol et
  if (req.method !== 'POST') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'];

  // Key yoksa devam et
  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    return next();
  }

  try {
    // Daha önce kullanılmış mı kontrol et
    const existingKey = await getIdempotencyKey(idempotencyKey);

    if (existingKey) {
      logger.info(`Idempotent istek bulundu: ${idempotencyKey}`);
      
      // Kaydedilmiş cevabı dön
      const responseBody = JSON.parse(existingKey.response);
      return res.status(200).json(responseBody);
    }

    // Yeni istekse cevabı yakalamak için res'i patch et
    const customRes = new CustomResponse(res);
    
    // İdempotency keyini request nesnesine ekle
    req.idempotencyKey = idempotencyKey;
    
    // İşlemi tamamla
    res.on('finish', () => {
      // Orijinal send fonksiyonunu yerine koy
      customRes.unpatch();
    });

    return next();
  } catch (error) {
    logger.error('Idempotency anahtarı kontrol edilirken hata:', error);
    return next();
  }
};

// Express Request tipini genişlet
declare global {
  namespace Express {
    interface Request {
      idempotencyKey?: string;
    }
  }
} 