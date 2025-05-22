import prisma from '../utils/db';
import { logger } from '../utils/logger';

export const addFavorite = async (userId: number, favoriteId: number) => {
  try {
    // Kullanıcıları kontrol et
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const favoriteUser = await prisma.user.findUnique({ where: { id: favoriteId } });
    
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    if (!favoriteUser) {
      throw new Error('Favori olarak eklenecek kullanıcı bulunamadı');
    }
    
    // Zaten favorilerde mi kontrol et
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        favoriteId
      }
    });
    
    if (existingFavorite) {
      throw new Error('Bu kullanıcı zaten favorilerde');
    }
    
    // Favori oluştur
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        favoriteId
      },
      include: {
        favorite: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    logger.info(`Kullanıcı favorilere eklendi: ${userId} -> ${favoriteId}`);
    
    return favorite;
  } catch (error) {
    logger.error('Favori eklenirken hata:', error);
    throw error;
  }
};

export const removeFavorite = async (userId: number, favoriteId: number) => {
  try {
    // Favori kaydını bul
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        favoriteId
      }
    });
    
    if (!favorite) {
      throw new Error('Favori bulunamadı');
    }
    
    // Favoriyi sil
    await prisma.favorite.delete({
      where: {
        id: favorite.id
      }
    });
    
    logger.info(`Kullanıcı favorilerden çıkarıldı: ${userId} -> ${favoriteId}`);
    
    return true;
  } catch (error) {
    logger.error('Favori çıkarılırken hata:', error);
    throw error;
  }
};

export const getFavoritesByUserId = async (userId: number) => {
  try {
    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    // Kullanıcının favorilerini getir
    const favorites = await prisma.favorite.findMany({
      where: {
        userId
      },
      include: {
        favorite: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Son işlem bilgisini ekle
    const favoritesWithLastTransaction = await Promise.all(
      favorites.map(async (fav) => {
        // Son işlemi bul
        const lastTransaction = await prisma.transaction.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: fav.favoriteId },
              { senderId: fav.favoriteId, receiverId: userId }
            ],
            status: 'completed'
          },
          orderBy: {
            completedAt: 'desc'
          },
          select: {
            amount: true,
            completedAt: true,
            senderId: true,
            receiverId: true
          }
        });
        
        return {
          ...fav,
          lastTransaction: lastTransaction ? {
            amount: lastTransaction.amount,
            date: lastTransaction.completedAt,
            // Yönü belirle (gelen/giden)
            isIncoming: lastTransaction.senderId === fav.favoriteId
          } : null
        };
      })
    );
    
    return favoritesWithLastTransaction;
  } catch (error) {
    logger.error('Favoriler getirilirken hata:', error);
    throw error;
  }
};
