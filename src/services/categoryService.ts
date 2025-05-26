import prisma from '../utils/db';
import { logger } from '../utils/logger';

/**
 * İşlemleri kategorize etme servisi
 */

/**
 * İşlemi kategorize et
 */
export const categorizeTransaction = async (transactionId: number, categoryIds: number[]) => {
  try {
    // Kategorileri kontrol et
    const categories = await prisma.spendingCategory.findMany({
      where: {
        id: {
          in: categoryIds
        }
      }
    });

    if (categories.length !== categoryIds.length) {
      throw new Error('Bir veya daha fazla kategori bulunamadı');
    }

    // İşlemi kontrol et
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw new Error('İşlem bulunamadı');
    }

    // Mevcut kategori ilişkilerini sil
    await prisma.transactionCategory.deleteMany({
      where: { transactionId }
    });

    // Yeni kategorileri ekle
    const categoryConnections = categoryIds.map(categoryId => ({
      transactionId,
      categoryId
    }));

    await prisma.transactionCategory.createMany({
      data: categoryConnections
    });

    // Güncellenmiş işlemi kategorileriyle birlikte getir
    const updatedTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    return updatedTransaction;
  } catch (error) {
    logger.error('İşlem kategorize edilirken hata:', error);
    throw error;
  }
};

/**
 * İşlemin kategorilerini getir
 */
export const getTransactionCategories = async (transactionId: number) => {
  try {
    const transactionWithCategories = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    if (!transactionWithCategories) {
      throw new Error('İşlem bulunamadı');
    }

    return transactionWithCategories.categories.map(tc => tc.category);
  } catch (error) {
    logger.error('İşlem kategorileri getirilirken hata:', error);
    throw error;
  }
};

/**
 * Harcama analizleri
 */
export const getSpendingAnalytics = async (userId: number, period: 'week' | 'month' | 'year' = 'month') => {
  try {
    // Tarih aralığını belirle
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Kullanıcının harcamaları
    const transactions = await prisma.transaction.findMany({
      where: {
        senderId: userId,
        status: 'completed',
        completedAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    // Toplam harcama
    const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Kategorilere göre harcama
    const spendingByCategory: Record<string, { categoryId: number, name: string, amount: number, percentage: number }> = {};

    // Kategori olmayan işlemlerin toplamı
    let uncategorizedAmount = 0;

    // İşlemleri kategorilere göre topla
    transactions.forEach(tx => {
      if (tx.categories.length === 0) {
        uncategorizedAmount += tx.amount;
      } else {
        // İşlem tutarını kategorilere eşit böl
        const amountPerCategory = tx.amount / tx.categories.length;
        
        tx.categories.forEach(({ category }) => {
          if (!spendingByCategory[category.id]) {
            spendingByCategory[category.id] = {
              categoryId: category.id,
              name: category.name,
              amount: 0,
              percentage: 0
            };
          }
          spendingByCategory[category.id].amount += amountPerCategory;
        });
      }
    });

    // Yüzdeleri hesapla
    Object.values(spendingByCategory).forEach(category => {
      category.percentage = totalSpent > 0 ? (category.amount / totalSpent) * 100 : 0;
    });

    // Kategorize edilmemiş işlemlerin yüzdesi
    const uncategorizedPercentage = totalSpent > 0 ? (uncategorizedAmount / totalSpent) * 100 : 0;

    // Analiz sonuçları
    return {
      period,
      startDate,
      endDate: now,
      totalSpent,
      categorizedAmount: totalSpent - uncategorizedAmount,
      uncategorizedAmount,
      uncategorizedPercentage,
      categories: Object.values(spendingByCategory).sort((a, b) => b.amount - a.amount)
    };
  } catch (error) {
    logger.error('Harcama analizleri getirilirken hata:', error);
    throw error;
  }
};
