import { Request, Response } from 'express';
import { 
  addFavorite, 
  removeFavorite, 
  getFavoritesByUserId 
} from '../services/favoriteService';
import { logger } from '../utils/logger';

export const addFavoriteHandler = async (req: Request, res: Response) => {
  try {
    const { userId, favoriteId } = req.body;
    
    // Validasyon
    if (!userId || !favoriteId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID ve favori ID zorunludur'
      });
    }
    
    // Sayı tipine dönüştür
    const userIdNum = parseInt(userId);
    const favoriteIdNum = parseInt(favoriteId);
    
    // Geçerli değerler mi kontrol et
    if (isNaN(userIdNum) || isNaN(favoriteIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'ID değerleri sayı olmalıdır'
      });
    }
    
    if (userIdNum === favoriteIdNum) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı kendisini favorilere ekleyemez'
      });
    }
    
    // Favoriye ekle
    const favorite = await addFavorite(userIdNum, favoriteIdNum);
    
    res.status(201).json({
      success: true,
      message: 'Kullanıcı favorilere eklendi',
      data: favorite
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Favori eklenirken bir hata oluştu';
    
    // Hata mesajına göre durumu belirle
    let statusCode = 500;
    if (errorMessage.includes('bulunamadı')) {
      statusCode = 404;
    } else if (errorMessage.includes('zaten favorilerde')) {
      statusCode = 409; // Conflict
    }
    
    logger.error('Favori eklenirken hata:', error);
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};

export const removeFavoriteHandler = async (req: Request, res: Response) => {
  try {
    const { userId, favoriteId } = req.params;
    
    // Sayı tipine dönüştür
    const userIdNum = parseInt(userId);
    const favoriteIdNum = parseInt(favoriteId);
    
    // Geçerli değerler mi kontrol et
    if (isNaN(userIdNum) || isNaN(favoriteIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'ID değerleri sayı olmalıdır'
      });
    }
    
    // Favoriden çıkar
    await removeFavorite(userIdNum, favoriteIdNum);
    
    res.status(200).json({
      success: true,
      message: 'Kullanıcı favorilerden çıkarıldı'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Favori çıkarılırken bir hata oluştu';
    
    // Hata mesajına göre durumu belirle
    let statusCode = 500;
    if (errorMessage.includes('bulunamadı')) {
      statusCode = 404;
    }
    
    logger.error('Favori çıkarılırken hata:', error);
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};

export const getFavoritesHandler = async (req: Request, res: Response) => {
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
    
    // Favorileri getir
    const favorites = await getFavoritesByUserId(userIdNum);
    
    res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Favoriler getirilirken bir hata oluştu';
    
    logger.error('Favoriler getirilirken hata:', error);
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};
