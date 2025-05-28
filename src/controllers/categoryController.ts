import { Request, Response } from 'express';
import { 
  categorizeTransaction, 
  getTransactionCategories, 
  getSpendingAnalytics 
} from '../services/categoryService';
import prisma from '../utils/db';
import { logger } from '../utils/logger';

/**
 * Tüm kategori listesini getir
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.spendingCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return res.json(categories);
  } catch (error: any) {
    logger.error('Kategoriler getirilirken hata:', error);
    return res.status(500).json({ message: 'Kategoriler getirilirken bir hata oluştu' });
  }
};

/**
 * Yeni kategori oluştur
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    
    // Admin yetkisi kontrolü yapılabilir

    if (!name) {
      return res.status(400).json({ message: 'Kategori adı gereklidir' });
    }

    // Aynı isimde kategori var mı kontrol et
    const existingCategory = await prisma.spendingCategory.findFirst({
      where: { 
        name: name
      }
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Bu isimde bir kategori zaten mevcut' });
    }

    // Kategori oluştur
    const category = await prisma.spendingCategory.create({
      data: {
        name,
        color
      }
    });

    return res.status(201).json(category);
  } catch (error: any) {
    logger.error('Kategori oluşturma hatası:', error);
    return res.status(400).json({ message: error.message || 'Kategori oluşturulurken bir hata oluştu' });
  }
};

/**
 * İşlemi kategorize et
 */
export const categorizeTransactionController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categoryIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    if (!categoryIds || !Array.isArray(categoryIds)) {
      return res.status(400).json({ message: 'Geçerli kategori ID\'leri gereklidir' });
    }

    // İşlemi bul ve yetki kontrolü yap
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }

    // Sadece işlemin göndereni veya alıcısı kategori ekleyebilir
    if (transaction.senderId !== userId && transaction.receiverId !== userId) {
      return res.status(403).json({ message: 'Bu işlemi kategorize etme izniniz yok' });
    }

    // İşlemi kategorize et
    const updatedTransaction = await categorizeTransaction(parseInt(id), categoryIds);

    return res.json(updatedTransaction);
  } catch (error: any) {
    logger.error('İşlem kategorize etme hatası:', error);
    return res.status(400).json({ message: error.message || 'İşlem kategorize edilirken bir hata oluştu' });
  }
};

/**
 * İşlemin kategorilerini getir
 */
export const getTransactionCategoriesController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // İşlemi bul ve yetki kontrolü yap
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }

    // Sadece işlemin göndereni veya alıcısı görebilir
    if (transaction.senderId !== userId && transaction.receiverId !== userId) {
      return res.status(403).json({ message: 'Bu işlemin kategorilerini görme izniniz yok' });
    }

    // İşlemin kategorilerini getir
    const categories = await getTransactionCategories(parseInt(id));

    return res.json(categories);
  } catch (error: any) {
    logger.error('İşlem kategorileri getirme hatası:', error);
    return res.status(400).json({ message: error.message || 'İşlem kategorileri getirilirken bir hata oluştu' });
  }
};

/**
 * Harcama analizleri
 */
export const getSpendingAnalyticsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { period = 'month' } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Geçerli periyot kontrolü
    if (!['week', 'month', 'year'].includes(period as string)) {
      return res.status(400).json({ message: 'Geçersiz periyot. Hafta, ay veya yıl olmalıdır' });
    }

    // Harcama analizlerini getir
    const analytics = await getSpendingAnalytics(
      userId, 
      period as 'week' | 'month' | 'year'
    );

    return res.json(analytics);
  } catch (error: any) {
    logger.error('Harcama analizleri getirme hatası:', error);
    return res.status(400).json({ message: error.message || 'Harcama analizleri getirilirken bir hata oluştu' });
  }
};
