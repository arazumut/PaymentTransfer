import { Request, Response } from 'express';
import { 
  createMoneyRequest, 
  respondToMoneyRequest, 
  getMoneyRequestsByUser 
} from '../services/moneyRequestService';
import { logger } from '../utils/logger';

export const createMoneyRequestHandler = async (req: Request, res: Response) => {
  try {
    const { requesterId, requestedId, amount, description } = req.body;
    
    // Validasyon
    if (!requesterId || !requestedId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'İsteyen ID, istenen ID ve tutar zorunludur'
      });
    }
    
    // Sayı tipine dönüştür
    const requesterIdNum = parseInt(requesterId);
    const requestedIdNum = parseInt(requestedId);
    const amountNum = parseFloat(amount);
    
    // Geçerli değerler mi kontrol et
    if (isNaN(requesterIdNum) || isNaN(requestedIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID değerleri sayı olmalıdır'
      });
    }
    
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Tutar pozitif bir sayı olmalıdır'
      });
    }
    
    // Para isteğini oluştur
    const result = await createMoneyRequest({
      requesterId: requesterIdNum,
      requestedId: requestedIdNum,
      amount: amountNum,
      description
    });
    
    res.status(201).json({
      success: true,
      message: 'Para isteği başarıyla oluşturuldu',
      data: result
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Para isteği oluşturulurken bir hata oluştu';
    
    // Hata tipine göre uygun HTTP kodu belirle
    let statusCode = 500;
    
    if (errorMessage.includes('bulunamadı')) {
      statusCode = 404;
    } else if (
      errorMessage.includes('Kendinizden para isteyemezsiniz') || 
      errorMessage.includes('pozitif olmalıdır')
    ) {
      statusCode = 422; // Unprocessable Entity
    }
    
    logger.error('Para isteği oluşturulurken hata:', error);
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};

export const respondToRequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    // Validasyon
    if (!id || !action) {
      return res.status(400).json({
        success: false,
        message: 'İstek ID ve aksiyon zorunludur'
      });
    }
    
    // Sayı tipine dönüştür
    const idNum = parseInt(id);
    
    // Geçerli değer mi kontrol et
    if (isNaN(idNum)) {
      return res.status(400).json({
        success: false,
        message: 'İstek ID sayı olmalıdır'
      });
    }
    
    // Aksiyonu kontrol et
    if (!['approve', 'reject', 'cancel'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz aksiyon. approve, reject veya cancel olmalıdır'
      });
    }
    
    // İsteğe yanıt ver
    const result = await respondToMoneyRequest(idNum, action as any);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Para isteğine yanıt verilirken bir hata oluştu';
    
    // Hata tipine göre uygun HTTP kodu belirle
    let statusCode = 500;
    
    if (errorMessage.includes('bulunamadı')) {
      statusCode = 404;
    } else if (errorMessage.includes('Yetersiz bakiye')) {
      statusCode = 422; // Unprocessable Entity
    }
    
    logger.error('Para isteğine yanıt verilirken hata:', error);
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};

export const getMoneyRequestsHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const type = req.query.type as 'sent' | 'received' | 'all' || 'all';
    
    // Sayı tipine dönüştür
    const userIdNum = parseInt(userId);
    
    // Geçerli değer mi kontrol et
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID sayı olmalıdır'
      });
    }
    
    // Para isteklerini getir
    const requests = await getMoneyRequestsByUser(userIdNum, type);
    
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Para istekleri getirilirken bir hata oluştu';
    
    logger.error('Para istekleri getirilirken hata:', error);
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};
