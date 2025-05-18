import { Request, Response } from 'express';
import { createTransfer, getTransactionsByUserId } from '../services/transferService';
import { saveIdempotencyKey } from '../services/idempotencyService';
import { logger } from '../utils/logger';

export const createTransferHandler = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, amount, description, scheduledAt } = req.body;
    
    // Validasyon
    if (!senderId || !receiverId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Gönderici ID, alıcı ID ve tutar zorunludur'
      });
    }
    
    // Sayı tipine dönüştür
    const senderIdNum = parseInt(senderId);
    const receiverIdNum = parseInt(receiverId);
    const amountNum = parseFloat(amount);
    
    // Geçerli değerler mi kontrol et
    if (isNaN(senderIdNum) || isNaN(receiverIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Gönderici ve alıcı ID sayı olmalıdır'
      });
    }
    
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Tutar pozitif bir sayı olmalıdır'
      });
    }
    
    // Tarih varsa işle
    let scheduledDate = undefined;
    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz tarih formatı'
        });
      }
    }
    
    // Transfer işlemini yap
    const result = await createTransfer({
      senderId: senderIdNum,
      receiverId: receiverIdNum,
      amount: amountNum,
      description,
      scheduledAt: scheduledDate
    });
    
    // İşlem sonucunu oluştur
    const response = {
      success: true,
      message: scheduledDate ? 
        'Zamanlı transfer başarıyla oluşturuldu' : 
        'Transfer başarıyla tamamlandı',
      data: result
    };
    
    // Idempotency key varsa kaydet
    if (req.idempotencyKey) {
      await saveIdempotencyKey(req.idempotencyKey, response);
    }
    
    res.status(201).json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Transfer işlemi sırasında bir hata oluştu';
    
    // Hata tipine göre uygun HTTP kodu belirle
    let statusCode = 500;
    
    if (errorMessage.includes('bulunamadı')) {
      statusCode = 404;
    } else if (
      errorMessage.includes('Yetersiz bakiye') || 
      errorMessage.includes('aynı kişi') || 
      errorMessage.includes('pozitif olmalıdır')
    ) {
      statusCode = 422; // Unprocessable Entity
    }
    
    logger.error('Transfer işlenirken hata:', error);
    
    // Hata yanıtını oluştur
    const errorResponse = {
      success: false,
      message: errorMessage
    };
    
    // Idempotency key varsa hata yanıtını da kaydet
    if (req.idempotencyKey) {
      await saveIdempotencyKey(req.idempotencyKey, errorResponse);
    }
    
    res.status(statusCode).json(errorResponse);
  }
};

export const getTransactionsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id ? parseInt(req.query.user_id as string) : undefined;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Geçerli bir kullanıcı ID'si gereklidir"
      });
    }
    
    const transactions = await getTransactionsByUserId(userId);
    
    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    logger.error('İşlem geçmişi getirilirken hata:', error);
    
    res.status(500).json({
      success: false,
      message: 'İşlem geçmişi getirilirken bir hata oluştu'
    });
  }
}; 