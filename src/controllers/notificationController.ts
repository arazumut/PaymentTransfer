import { Request, Response } from 'express';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../services/notificationService';
import { logger } from '../utils/logger';

export const getNotificationsHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const onlyUnread = req.query.unread === 'true';
    
    // Sayı tipine dönüştür
    const userIdNum = parseInt(userId);
    
    // Geçerli değer mi kontrol et
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID sayı olmalıdır'
      });
    }
    
    // Bildirimleri getir
    const notifications = await getUserNotifications(userIdNum, limit, onlyUnread);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bildirimler getirilirken bir hata oluştu';
    
    logger.error('Bildirimler getirilirken hata:', error);
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

export const markAsReadHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Sayı tipine dönüştür
    const idNum = parseInt(id);
    
    // Geçerli değer mi kontrol et
    if (isNaN(idNum)) {
      return res.status(400).json({
        success: false,
        message: 'Bildirim ID sayı olmalıdır'
      });
    }
    
    // Bildirimi okundu olarak işaretle
    await markNotificationAsRead(idNum);
    
    res.status(200).json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bildirim okundu işaretlenirken hata oluştu';
    
    logger.error('Bildirim okundu işaretlenirken hata:', error);
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

export const markAllAsReadHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Sayı tipine dönüştür
    const userIdNum = parseInt(userId);
    
    // Geçerli değer mi kontrol et
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID sayı olmalıdır'
      });
    }
    
    // Tüm bildirimleri okundu olarak işaretle
    await markAllNotificationsAsRead(userIdNum);
    
    res.status(200).json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bildirimler okundu işaretlenirken hata oluştu';
    
    logger.error('Tüm bildirimler okundu işaretlenirken hata:', error);
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};
