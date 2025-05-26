import { Request, Response } from 'express';
import { getUserQrHistory, deleteQrCode } from '../services/qrService';
import { logger } from '../utils/logger';

export const getQrHistoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme gereklidir'
      });
    }
    
    const history = await getUserQrHistory(userId);
    
    res.status(200).json({
      success: true,
      message: 'QR kod geçmişi başarıyla alındı',
      data: history
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'QR kod geçmişi alınırken bir hata oluştu';
    
    logger.error('QR kod geçmişi alınırken hata:', error);
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

export const deleteQrCodeHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { qrTokenId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme gereklidir'
      });
    }
    
    if (!qrTokenId) {
      return res.status(400).json({
        success: false,
        message: 'QR token ID zorunludur'
      });
    }
    
    await deleteQrCode(qrTokenId, userId);
    
    res.status(200).json({
      success: true,
      message: 'QR kod başarıyla silindi'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'QR kod silinirken bir hata oluştu';
    
    logger.error('QR kod silinirken hata:', error);
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};
