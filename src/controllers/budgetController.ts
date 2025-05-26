import { Request, Response } from 'express';
import prisma from '../utils/db';
import { logger } from '../utils/logger';

/**
 * Tüm harcama kategorilerini getir
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
 * Yeni bir bütçe oluştur
 */
export const createBudget = async (req: Request, res: Response) => {
  try {
    const { categoryId, amount, period, startDate, endDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Gerekli alanlar
    if (!categoryId || !amount || !period || !startDate || !endDate) {
      return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
    }

    // Kategori kontrolü
    const category = await prisma.spendingCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    // Periyot kontrolü
    if (!['monthly', 'yearly'].includes(period)) {
      return res.status(400).json({ message: 'Geçersiz periyot. Aylık veya yıllık olmalıdır' });
    }

    // Bütçe oluştur
    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId,
        amount,
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });

    return res.status(201).json(budget);
  } catch (error: any) {
    logger.error('Bütçe oluşturma hatası:', error);
    return res.status(400).json({ message: error.message || 'Bütçe oluşturulurken bir hata oluştu' });
  }
};

/**
 * Kullanıcının bütçelerini getir
 */
export const getUserBudgets = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json(budgets);
  } catch (error: any) {
    logger.error('Bütçeler getirilirken hata:', error);
    return res.status(500).json({ message: 'Bütçeler getirilirken bir hata oluştu' });
  }
};

/**
 * Bütçe detayı ve ilerleme bilgisi
 */
export const getBudgetDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Bütçeyi bul
    const budget = await prisma.budget.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        category: true
      }
    });

    if (!budget) {
      return res.status(404).json({ message: 'Bütçe bulunamadı' });
    }

    // Kullanıcının bütçesi değilse erişim engelle
    if (budget.userId !== userId) {
      return res.status(403).json({ message: 'Bu bütçeye erişim izniniz yok' });
    }

    // Kullanıcının bu kategorideki harcamalarını getir (bütçe süresince)
    const transactions = await prisma.transaction.findMany({
      where: {
        senderId: userId,
        categories: {
          some: {
            categoryId: budget.categoryId
          }
        },
        completedAt: {
          gte: budget.startDate,
          lte: budget.endDate
        }
      }
    });

    // Toplam harcamayı hesapla
    const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    // Bütçe ilerleme yüzdesini hesapla
    const progress = Math.min((totalSpent / budget.amount) * 100, 100);

    return res.json({
      budget,
      totalSpent,
      remaining: Math.max(budget.amount - totalSpent, 0),
      progress,
      transactions
    });
  } catch (error: any) {
    logger.error('Bütçe detayı getirilirken hata:', error);
    return res.status(500).json({ message: 'Bütçe detayı getirilirken bir hata oluştu' });
  }
};

/**
 * Bütçeyi güncelle
 */
export const updateBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, period, startDate, endDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Bütçeyi bul
    const budget = await prisma.budget.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!budget) {
      return res.status(404).json({ message: 'Bütçe bulunamadı' });
    }

    // Kullanıcının bütçesi değilse erişim engelle
    if (budget.userId !== userId) {
      return res.status(403).json({ message: 'Bu bütçeyi güncelleme izniniz yok' });
    }

    // Periyot kontrolü
    if (period && !['monthly', 'yearly'].includes(period)) {
      return res.status(400).json({ message: 'Geçersiz periyot. Aylık veya yıllık olmalıdır' });
    }

    // Bütçeyi güncelle
    const updatedBudget = await prisma.budget.update({
      where: {
        id: Number(id)
      },
      data: {
        amount: amount !== undefined ? amount : undefined,
        period: period || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    });

    return res.json(updatedBudget);
  } catch (error: any) {
    logger.error('Bütçe güncelleme hatası:', error);
    return res.status(400).json({ message: error.message || 'Bütçe güncellenirken bir hata oluştu' });
  }
};

/**
 * Bütçeyi sil
 */
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
    }

    // Bütçeyi bul
    const budget = await prisma.budget.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!budget) {
      return res.status(404).json({ message: 'Bütçe bulunamadı' });
    }

    // Kullanıcının bütçesi değilse erişim engelle
    if (budget.userId !== userId) {
      return res.status(403).json({ message: 'Bu bütçeyi silme izniniz yok' });
    }

    // Bütçeyi sil
    await prisma.budget.delete({
      where: {
        id: Number(id)
      }
    });

    return res.json({ message: 'Bütçe başarıyla silindi' });
  } catch (error: any) {
    logger.error('Bütçe silme hatası:', error);
    return res.status(400).json({ message: error.message || 'Bütçe silinirken bir hata oluştu' });
  }
};
