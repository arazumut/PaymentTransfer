import prisma from '../utils/db';
import { logger } from '../utils/logger';
import { Server as SocketServer } from 'socket.io';
import http from 'http';

let io: SocketServer | null = null;

// Socket.IO sunucusunu başlat
export const initializeSocketIO = (server: http.Server) => {
  io = new SocketServer(server, {
    cors: {
      origin: '*', // Geliştirme için tüm kaynaklara izin ver (Prodüksiyonda değiştir)
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Yeni bağlantı: ${socket.id}`);

    // Kullanıcı odalarına katıl
    socket.on('joinUserRoom', (userId: number) => {
      if (userId) {
        socket.join(`user-${userId}`);
        logger.info(`Kullanıcı ${userId} odaya katıldı: user-${userId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Bağlantı koptu: ${socket.id}`);
    });
  });

  logger.info('Socket.IO başlatıldı');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO henüz başlatılmadı');
  }
  return io;
};

// Bildirim tipleri
type NotificationType = 'success' | 'warning' | 'info';

// Bildirim oluştur
export const createNotification = async (
  userId: number,
  title: string,
  message: string,
  type: NotificationType = 'info',
  data?: any
) => {
  try {
    // Kullanıcı var mı kontrol et
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    // Veriyi JSON formatına dönüştür
    const dataString = data ? JSON.stringify(data) : null;
    
    // Bildirimi veritabanına kaydet
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: dataString
      }
    });
    
    // Socket.IO üzerinden gerçek zamanlı gönder
    if (io) {
      const formattedNotification = {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        data: data || null,
        createdAt: notification.createdAt
      };
      
      io.to(`user-${userId}`).emit('notification', formattedNotification);
      logger.info(`Bildirim gönderildi: ${userId}`);
    }
    
    return notification;
  } catch (error) {
    logger.error('Bildirim oluşturulurken hata:', error);
    throw error;
  }
};

// Kullanıcının bildirimlerini getir
export const getUserNotifications = async (userId: number, limit = 20, onlyUnread = false) => {
  try {
    // Kullanıcı var mı kontrol et
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    // Bildirimleri getir
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(onlyUnread ? { isRead: false } : {})
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    // Bildirimleri formatla
    return notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      data: notification.data ? JSON.parse(notification.data) : null,
      createdAt: notification.createdAt
    }));
  } catch (error) {
    logger.error('Bildirimler getirilirken hata:', error);
    throw error;
  }
};

// Bildirimi okundu olarak işaretle
export const markNotificationAsRead = async (id: number) => {
  try {
    // Bildirimi güncelle
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    
    return true;
  } catch (error) {
    logger.error('Bildirim okundu işaretlenirken hata:', error);
    throw error;
  }
};

// Kullanıcının tüm bildirimlerini okundu olarak işaretle
export const markAllNotificationsAsRead = async (userId: number) => {
  try {
    // Kullanıcı var mı kontrol et
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    // Tüm bildirimleri güncelle
    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false
      },
      data: { isRead: true }
    });
    
    return true;
  } catch (error) {
    logger.error('Tüm bildirimler okundu işaretlenirken hata:', error);
    throw error;
  }
};
