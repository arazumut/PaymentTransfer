import { Request, Response } from 'express';
import prisma from '../utils/db';
import { logger } from '../utils/logger';

/**
 * Kullanıcının sadakat puanı kayıtlarını oluştur veya kontrol et
 */
const ensureLoyaltyPoints = async (userId: number) => {
  const loyaltyPoints = await prisma.loyaltyPoints.findUnique({
    where: { userId }
  });

  if (!loyaltyPoints) {
    return await prisma.loyaltyPoints.create({
      data: {
        userId,
        points: 0
      }
    });
  }

  return loyaltyPoints;
};

/**
 * Sadakat puanı ekle
 */
export const addLoyaltyPoints = async (req: Request, res: Response) => {
  try {
    const { userId, points, description } = req.body;
    const requesterId = req.user?.id;
    
    // Admin kontrolü veya kendi puanlarını ekleme yetkisi
    if (!requesterId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Gerekli alanları kontrol et
    if (!userId || !points || !description) {
      return res.status(400).json({ message: 'Kullanıcı ID, puan ve açıklama gereklidir' });
    }

    // Puan kontrolü
    if (points <= 0) {
      return res.status(400).json({ message: 'Puan pozitif olmalıdır' });
    }

    // Kullanıcı kontrolü
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Sadakat puanı kaydını kontrol et veya oluştur
    await ensureLoyaltyPoints(userId);

    // Atomik işlem başlat
    const result = await prisma.$transaction(async (tx) => {
      // Puanları güncelle
      const updatedLoyaltyPoints = await tx.loyaltyPoints.update({
        where: { userId },
        data: { 
          points: { increment: points } 
        }
      });

      // İşlem kaydı oluştur
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          userId,
          points,
          description,
          type: 'earn'
        }
      });

      return {
        loyaltyPoints: updatedLoyaltyPoints,
        transaction
      };
    });

    return res.status(200).json(result);
  } catch (error: any) {
    logger.error('Sadakat puanı ekleme hatası:', error);
    return res.status(400).json({ message: error.message || 'Sadakat puanı eklenirken bir hata oluştu' });
  }
};

/**
 * Sadakat puanı harca
 */
export const spendLoyaltyPoints = async (req: Request, res: Response) => {
  try {
    const { points, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Gerekli alanları kontrol et
    if (!points || !description) {
      return res.status(400).json({ message: 'Puan ve açıklama gereklidir' });
    }

    // Puan kontrolü
    if (points <= 0) {
      return res.status(400).json({ message: 'Puan pozitif olmalıdır' });
    }

    // Sadakat puanı kaydını kontrol et
    const loyaltyPoints = await ensureLoyaltyPoints(userId);

    // Yeterli puan kontrolü
    if (loyaltyPoints.points < points) {
      return res.status(400).json({ message: 'Yetersiz sadakat puanı' });
    }

    // Atomik işlem başlat
    const result = await prisma.$transaction(async (tx) => {
      // Puanları güncelle
      const updatedLoyaltyPoints = await tx.loyaltyPoints.update({
        where: { userId },
        data: { 
          points: { decrement: points } 
        }
      });

      // İşlem kaydı oluştur
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          userId,
          points: -points, // Negatif değer (harcama)
          description,
          type: 'spend'
        }
      });

      return {
        loyaltyPoints: updatedLoyaltyPoints,
        transaction
      };
    });

    return res.status(200).json(result);
  } catch (error: any) {
    logger.error('Sadakat puanı harcama hatası:', error);
    return res.status(400).json({ message: error.message || 'Sadakat puanı harcanırken bir hata oluştu' });
  }
};

/**
 * Kullanıcının sadakat puanı durumunu getir
 */
export const getLoyaltyPointsStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Sadakat puanı kaydını kontrol et veya oluştur
    const loyaltyPoints = await ensureLoyaltyPoints(userId);
    
    // Son 10 işlemi getir
    const recentTransactions = await prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return res.json({
      currentPoints: loyaltyPoints.points,
      recentTransactions
    });
  } catch (error: any) {
    logger.error('Sadakat puanı durumu getirme hatası:', error);
    return res.status(500).json({ message: 'Sadakat puanı durumu getirilirken bir hata oluştu' });
  }
};

/**
 * Kullanıcının tüm sadakat puanı işlemlerini getir
 */
export const getLoyaltyTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // İşlemleri getir
    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Toplam işlem sayısı
    const total = await prisma.loyaltyTransaction.count({
      where: { userId }
    });

    return res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    logger.error('Sadakat puanı işlemleri getirme hatası:', error);
    return res.status(500).json({ message: 'Sadakat puanı işlemleri getirilirken bir hata oluştu' });
  }
};

/**
 * Para transferinden sadakat puanı kazanımı
 * Transfer servisinden çağrılır
 */
export const earnPointsFromTransfer = async (userId: number, amount: number) => {
  try {
    // 100 TL başına 10 puan ver
    const pointsToEarn = Math.floor((amount / 100) * 10);
    
    // 0 puandan az ise işlem yapma
    if (pointsToEarn <= 0) {
      return null;
    }
    
    // Sadakat puanı kaydını kontrol et veya oluştur
    await ensureLoyaltyPoints(userId);
    
    // Atomik işlem başlat
    return await prisma.$transaction(async (tx) => {
      // Puanları güncelle
      const updatedLoyaltyPoints = await tx.loyaltyPoints.update({
        where: { userId },
        data: { 
          points: { increment: pointsToEarn } 
        }
      });

      // İşlem kaydı oluştur
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          userId,
          points: pointsToEarn,
          description: `${amount} TL tutarındaki para transferinden kazanılan puan`,
          type: 'earn'
        }
      });

      logger.info(`Kullanıcı #${userId} transfer işleminden ${pointsToEarn} puan kazandı`);
      
      return {
        loyaltyPoints: updatedLoyaltyPoints,
        transaction
      };
    });
  } catch (error) {
    logger.error('Transfer puanı ekleme hatası:', error);
    throw error;
  }
};
