import prisma from '../utils/db';
import { logger } from '../utils/logger';
import { transferMoney } from './transferService';

interface ScheduledPaymentData {
  senderId: number;
  receiverId: number;
  amount: number;
  description?: string;
  frequency: string; // daily, weekly, monthly, yearly
  startDate?: Date; // ilk ödeme tarihi (belirtilmezse şu an)
  endDate?: Date; // bitiş tarihi (belirtilmezse süresiz)
}

/**
 * Planlı ödeme oluştur
 */
export const createScheduledPayment = async (data: ScheduledPaymentData) => {
  try {
    // Ödeme frekansını kontrol et
    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(data.frequency)) {
      throw new Error('Geçersiz ödeme frekansı');
    }

    // Kullanıcıları kontrol et
    const sender = await prisma.user.findUnique({
      where: { id: data.senderId }
    });

    const receiver = await prisma.user.findUnique({
      where: { id: data.receiverId }
    });

    if (!sender || !receiver) {
      throw new Error('Gönderici veya alıcı bulunamadı');
    }

    // Kendine ödeme yapılmasını engelle
    if (data.senderId === data.receiverId) {
      throw new Error('Kendinize planlı ödeme yapamazsınız');
    }

    // Tutar kontrolü
    if (data.amount <= 0) {
      throw new Error('Transfer tutarı pozitif olmalıdır');
    }

    // İlk ödeme tarihi
    const startDate = data.startDate || new Date();
    
    // Sonraki ödeme tarihini belirle
    const nextExecutionDate = calculateNextExecutionDate(startDate, data.frequency);

    // Planlı ödemeyi oluştur
    const scheduledPayment = await prisma.scheduledPayment.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        amount: data.amount,
        description: data.description,
        frequency: data.frequency,
        nextExecutionDate,
        endDate: data.endDate,
        isActive: true
      }
    });

    return scheduledPayment;
  } catch (error) {
    logger.error('Planlı ödeme oluşturulurken hata:', error);
    throw error;
  }
};

/**
 * Planlı ödemeyi güncelle
 */
export const updateScheduledPayment = async (id: number, userId: number, data: Partial<ScheduledPaymentData>) => {
  try {
    // Planlı ödemeyi bul
    const scheduledPayment = await prisma.scheduledPayment.findUnique({
      where: { id }
    });

    if (!scheduledPayment) {
      throw new Error('Planlı ödeme bulunamadı');
    }

    // Sadece ödemeyi oluşturan kişi güncelleyebilir
    if (scheduledPayment.senderId !== userId) {
      throw new Error('Bu planlı ödemeyi güncelleme yetkiniz yok');
    }

    // Güncelleme verileri
    const updateData: any = {};

    if (data.amount !== undefined) {
      if (data.amount <= 0) {
        throw new Error('Transfer tutarı pozitif olmalıdır');
      }
      updateData.amount = data.amount;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.frequency !== undefined) {
      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(data.frequency)) {
        throw new Error('Geçersiz ödeme frekansı');
      }
      updateData.frequency = data.frequency;
      
      // Frekans değiştiğinde sonraki ödeme tarihini güncelle
      updateData.nextExecutionDate = calculateNextExecutionDate(new Date(), data.frequency);
    }

    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate;
    }

    // Planlı ödemeyi güncelle
    const updatedPayment = await prisma.scheduledPayment.update({
      where: { id },
      data: updateData
    });

    return updatedPayment;
  } catch (error) {
    logger.error('Planlı ödeme güncellenirken hata:', error);
    throw error;
  }
};

/**
 * Planlı ödemeyi iptal et
 */
export const cancelScheduledPayment = async (id: number, userId: number) => {
  try {
    // Planlı ödemeyi bul
    const scheduledPayment = await prisma.scheduledPayment.findUnique({
      where: { id }
    });

    if (!scheduledPayment) {
      throw new Error('Planlı ödeme bulunamadı');
    }

    // Sadece ödemeyi oluşturan kişi iptal edebilir
    if (scheduledPayment.senderId !== userId) {
      throw new Error('Bu planlı ödemeyi iptal etme yetkiniz yok');
    }

    // Planlı ödemeyi devre dışı bırak
    await prisma.scheduledPayment.update({
      where: { id },
      data: { isActive: false }
    });

    return true;
  } catch (error) {
    logger.error('Planlı ödeme iptal edilirken hata:', error);
    throw error;
  }
};

/**
 * Kullanıcının planlı ödemelerini getir
 */
export const getUserScheduledPayments = async (userId: number) => {
  try {
    const payments = await prisma.scheduledPayment.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        isActive: true
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        nextExecutionDate: 'asc'
      }
    });

    return payments;
  } catch (error) {
    logger.error('Planlı ödemeler alınırken hata:', error);
    throw error;
  }
};

/**
 * Zamanı gelen planlı ödemeleri çalıştır
 */
export const executeScheduledPayments = async () => {
  try {
    logger.info('Planlı ödemeleri çalıştırma işlemi başladı');
    
    // Zamanı gelen aktif planlı ödemeleri bul
    const now = new Date();
    const pendingPayments = await prisma.scheduledPayment.findMany({
      where: {
        nextExecutionDate: {
          lte: now // şu andan önce veya şu an
        },
        isActive: true
      },
      include: {
        sender: true,
        receiver: true
      }
    });

    logger.info(`${pendingPayments.length} adet planlı ödeme çalıştırılacak`);

    // Her bir ödemeyi çalıştır
    for (const payment of pendingPayments) {
      try {
        // Transfer işlemini gerçekleştir
        await transferMoney({
          senderId: payment.senderId,
          receiverId: payment.receiverId,
          amount: payment.amount,
          description: payment.description || `Otomatik ödeme #${payment.id}`
        });

        // Sonraki ödeme tarihini hesapla
        const nextDate = calculateNextExecutionDate(payment.nextExecutionDate, payment.frequency);
        
        // Son çalıştırma tarihini güncelle
        await prisma.scheduledPayment.update({
          where: { id: payment.id },
          data: {
            lastExecutionDate: now,
            nextExecutionDate: nextDate
          }
        });

        // Bitiş tarihi kontrolü
        if (payment.endDate && nextDate > payment.endDate) {
          // Bitiş tarihini geçtiyse devre dışı bırak
          await prisma.scheduledPayment.update({
            where: { id: payment.id },
            data: { isActive: false }
          });
        }

        logger.info(`Planlı ödeme #${payment.id} başarıyla çalıştırıldı. Sonraki ödeme tarihi: ${nextDate}`);
      } catch (err) {
        logger.error(`Planlı ödeme #${payment.id} çalıştırılırken hata oluştu:`, err);
        // Hata durumunda devam et, diğer ödemeleri engelleme
      }
    }

    return {
      success: true,
      processedCount: pendingPayments.length
    };
  } catch (error) {
    logger.error('Planlı ödemeler çalıştırılırken genel hata:', error);
    throw error;
  }
};

/**
 * Bir sonraki çalıştırma tarihini hesapla
 */
function calculateNextExecutionDate(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      throw new Error('Geçersiz frekans');
  }
  
  return next;
}
