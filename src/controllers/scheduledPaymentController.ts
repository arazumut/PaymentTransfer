import { Request, Response } from 'express';
import { 
  createScheduledPayment, 
  updateScheduledPayment, 
  cancelScheduledPayment, 
  getUserScheduledPayments 
} from '../services/scheduledPaymentService';
import { logger } from '../utils/logger';

/**
 * Yeni bir planlı ödeme oluştur
 */
export const createScheduledPaymentController = async (req: Request, res: Response) => {
  try {
    const { receiverId, amount, description, frequency, startDate, endDate } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Gerekli alanları kontrol et
    if (!receiverId || !amount || !frequency) {
      return res.status(400).json({ message: 'Alıcı ID, tutar ve frekans gereklidir' });
    }

    // Planlı ödeme oluştur
    const scheduledPayment = await createScheduledPayment({
      senderId,
      receiverId,
      amount,
      description,
      frequency,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });

    return res.status(201).json(scheduledPayment);
  } catch (error: any) {
    logger.error('Planlı ödeme oluşturma hatası:', error);
    return res.status(400).json({ message: error.message || 'Planlı ödeme oluşturulurken bir hata oluştu' });
  }
};

/**
 * Mevcut planlı ödemeyi güncelle
 */
export const updateScheduledPaymentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, description, frequency, endDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Planlı ödemeyi güncelle
    const updatedPayment = await updateScheduledPayment(Number(id), userId, {
      amount,
      description,
      frequency,
      endDate: endDate ? new Date(endDate) : undefined
    });

    return res.json(updatedPayment);
  } catch (error: any) {
    logger.error('Planlı ödeme güncelleme hatası:', error);
    return res.status(400).json({ message: error.message || 'Planlı ödeme güncellenirken bir hata oluştu' });
  }
};

/**
 * Planlı ödemeyi iptal et
 */
export const cancelScheduledPaymentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Planlı ödemeyi iptal et
    await cancelScheduledPayment(Number(id), userId);

    return res.json({ message: 'Planlı ödeme başarıyla iptal edildi' });
  } catch (error: any) {
    logger.error('Planlı ödeme iptal hatası:', error);
    return res.status(400).json({ message: error.message || 'Planlı ödeme iptal edilirken bir hata oluştu' });
  }
};

/**
 * Kullanıcının planlı ödemelerini getir
 */
export const getScheduledPaymentsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Kullanıcının planlı ödemelerini getir
    const payments = await getUserScheduledPayments(userId);

    return res.json(payments);
  } catch (error: any) {
    logger.error('Planlı ödeme listeleme hatası:', error);
    return res.status(400).json({ message: error.message || 'Planlı ödemeler getirilirken bir hata oluştu' });
  }
};
