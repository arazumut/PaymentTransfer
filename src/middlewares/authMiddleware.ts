import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/authService';

// Request türünü genişlet
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Token'ı headerdan al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme başarısız, token bulunamadı'
      });
    }
    
    // Token'ı çıkar
    const token = authHeader.split(' ')[1];
    
    // Token'ı doğrula
    const payload = validateToken(token);
    
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme başarısız, geçersiz token'
      });
    }
    
    // Kullanıcı bilgisini isteğe ekle
    req.user = payload as {
      id: number;
      email: string;
      iat?: number;
      exp?: number;
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Yetkilendirme başarısız'
    });
  }
};
