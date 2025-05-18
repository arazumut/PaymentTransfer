import prisma from '../utils/db';
import { logger } from '../utils/logger';

interface TransferData {
  senderId: number;
  receiverId: number;
  amount: number;
  description?: string;
  scheduledAt?: Date;
}

export const createTransfer = async (data: TransferData) => {
  const { senderId, receiverId, amount, description, scheduledAt } = data;

  // Validasyonlar
  if (amount <= 0) {
    throw new Error('Transfer tutarı pozitif olmalıdır');
  }

  if (senderId === receiverId) {
    throw new Error('Gönderici ve alıcı aynı kişi olamaz');
  }

  // Kullanıcıları kontrol et
  const sender = await prisma.user.findUnique({ where: { id: senderId } });
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

  if (!sender || !receiver) {
    throw new Error('Gönderici veya alıcı bulunamadı');
  }

  // Bakiye kontrolü
  if (sender.balance < amount) {
    throw new Error('Yetersiz bakiye');
  }

  try {
    // Eğer zamanlı transfer ise sadece işlemi kaydet
    if (scheduledAt && scheduledAt > new Date()) {
      const transaction = await prisma.transaction.create({
        data: {
          senderId,
          receiverId,
          amount,
          description,
          scheduledAt,
          status: 'pending',
        },
      });
      
      logger.info(`Zamanlı transfer oluşturuldu: #${transaction.id}`);
      return transaction;
    }

    // Anında transfer işlemini gerçekleştir
    return await executeTransfer(senderId, receiverId, amount, description);
  } catch (error) {
    logger.error('Transfer oluşturulurken hata oluştu:', error);
    throw error;
  }
};

export const executeTransfer = async (
  senderId: number, 
  receiverId: number, 
  amount: number, 
  description?: string
) => {
  // Atomik işlem başlat
  return await prisma.$transaction(async (tx) => {
    // Gönderici bakiyesini güncelle
    const updatedSender = await tx.user.update({
      where: { id: senderId },
      data: { balance: { decrement: amount } },
    });

    // Alıcı bakiyesini güncelle
    const updatedReceiver = await tx.user.update({
      where: { id: receiverId },
      data: { balance: { increment: amount } },
    });

    // İşlemi kaydet
    const transaction = await tx.transaction.create({
      data: {
        senderId,
        receiverId,
        amount,
        description,
        status: 'completed',
        completedAt: new Date(),
      },
    });

    logger.info(`Transfer tamamlandı: #${transaction.id}, ${amount} TL`);
    
    return {
      transaction,
      sender: updatedSender,
      receiver: updatedReceiver,
    };
  });
};

export const getTransactionsByUserId = async (userId: number) => {
  try {
    return await prisma.transaction.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    logger.error(`Kullanıcı işlemleri getirilirken hata: ${userId}`, error);
    throw new Error('İşlem geçmişi getirilirken hata oluştu');
  }
};

export const getPendingScheduledTransfers = async () => {
  const now = new Date();
  
  try {
    return await prisma.transaction.findMany({
      where: {
        status: 'pending',
        scheduledAt: {
          lte: now,
        },
      },
    });
  } catch (error) {
    logger.error('Bekleyen transferler getirilirken hata:', error);
    throw error;
  }
}; 