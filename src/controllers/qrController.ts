// filepath: /Users/umutaraz/Desktop/Tüm hayatım burda/moneyTrans/src/controllers/qrController.ts
import { Request, Response } from 'express';
import { createQrCode, verifyQrCode, QrCodeType } from '../services/qrService';
import { logger } from '../utils/logger';

export const generateQrCodeHandler = async (req: Request, res: Response) => {
  try {
    const { userId, amount, description, type, recurringInterval, maxUsageCount } = req.body;
    
    // Validasyon
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID zorunludur'
      });
    }
    
    // Sayı tipine dönüştür
    const userIdNum = parseInt(userId);
    const amountNum = amount ? parseFloat(amount) : undefined;
    const maxUsageCountNum = maxUsageCount ? parseInt(maxUsageCount) : undefined;
    
    // Geçerli değerler mi kontrol et
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID sayı olmalıdır'
      });
    }
    
    if (amountNum !== undefined && (isNaN(amountNum) || amountNum <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Tutar pozitif bir sayı olmalıdır'
      });
    }
    
    if (maxUsageCountNum !== undefined && (isNaN(maxUsageCountNum) || maxUsageCountNum <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Maksimum kullanım sayısı pozitif bir sayı olmalıdır'
      });
    }
    
    // QR kod tipi kontrolü
    let qrType: QrCodeType | undefined = undefined;
    
    if (type) {
      if (Object.values(QrCodeType).includes(type as QrCodeType)) {
        qrType = type as QrCodeType;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz QR kod tipi'
        });
      }
    }
    
    // Tekrarlı ödeme tipi için periyot zorunlu
    if (qrType === QrCodeType.RECURRING && !recurringInterval) {
      return res.status(400).json({
        success: false,
        message: 'Tekrarlı ödemeler için periyot belirtilmelidir'
      });
    }
    
    // QR kod oluştur
    const qrCode = await createQrCode({
      userId: userIdNum,
      amount: amountNum,
      description,
      type: qrType,
      recurringInterval,
      maxUsageCount: maxUsageCountNum
    });
    
    res.status(201).json({
      success: true,
      message: 'QR kod başarıyla oluşturuldu',
      data: qrCode
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'QR kod oluşturulurken bir hata oluştu';
    
    logger.error('QR kod oluşturulurken hata:', error);
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

export const verifyQrCodeHandler = async (req: Request, res: Response) => {
  try {
    const { qrToken, senderId } = req.body;
    
    // Validasyon
    if (!qrToken || !senderId) {
      return res.status(400).json({
        success: false,
        message: 'QR token ve gönderici ID zorunludur'
      });
    }
    
    // Sayı tipine dönüştür
    const senderIdNum = parseInt(senderId);
    
    // Geçerli değerler mi kontrol et
    if (isNaN(senderIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Gönderici ID sayı olmalıdır'
      });
    }
    
    // QR kodu doğrula
    const qrDetails = await verifyQrCode(qrToken, senderIdNum);
    
    res.status(200).json({
      success: true,
      message: 'QR kod doğrulandı',
      data: qrDetails
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'QR kod doğrulanırken bir hata oluştu';
    
    logger.error('QR kod doğrulanırken hata:', error);
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};
