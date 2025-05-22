import prisma from '../utils/db';
import { logger } from '../utils/logger';
import { executeTransfer } from './transferService';
import { createNotification } from './notificationService';

interface MoneyRequestData {
  requesterId: number;
  requestedId: number;
  amount: number;
  description?: string;
}

export const createMoneyRequest = async (data: MoneyRequestData) => {
  const { requesterId, requestedId, amount, description } = data;

  // Validasyonlar
  if (amount <= 0) {
    throw new Error('İstenilen tutar pozitif olmalıdır');
  }

  if (requesterId === requestedId) {
    throw new Error('Kendinizden para isteyemezsiniz');
  }

  // Kullanıcıları kontrol et
  const requester = await prisma.user.findUnique({ where: { id: requesterId } });
  const requested = await prisma.user.findUnique({ where: { id: requestedId } });

  if (!requester || !requested) {
    throw new Error('Kullanıcı bulunamadı');
  }

  try {
    // Para isteğini oluştur
    const moneyRequest = await prisma.moneyRequest.create({
      data: {
        requesterId,
        requestedId,
        amount,
        description,
        status: 'pending'
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true
          }
        },
        requested: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Para isteyen kişiye bildirim gönder
    await createNotification(
      requestedId,
      'Para İsteği',
      `${requester.name} sizden ${amount} TL istiyor`,
      'info',
      { 
        requestId: moneyRequest.id, 
        type: 'money_request' 
      }
    );
    
    logger.info(`Para isteği oluşturuldu: #${moneyRequest.id}, ${requester.name} -> ${requested.name}, ${amount} TL`);
    return moneyRequest;
  } catch (error) {
    logger.error('Para isteği oluşturulurken hata oluştu:', error);
    throw error;
  }
};

export const respondToMoneyRequest = async (
  requestId: number, 
  action: 'approve' | 'reject' | 'cancel'
) => {
  // İsteği bul
  const moneyRequest = await prisma.moneyRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: {
        select: {
          id: true,
          name: true
        }
      },
      requested: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!moneyRequest) {
    throw new Error('Para isteği bulunamadı');
  }

  // İsteğin durumunu kontrol et
  if (moneyRequest.status !== 'pending') {
    throw new Error(`Bu para isteği zaten ${moneyRequest.status} durumunda`);
  }

  try {
    // İsteğe yanıt ver
    if (action === 'approve') {
      // Transfer işlemini gerçekleştir
      try {
        await executeTransfer(
          moneyRequest.requestedId,
          moneyRequest.requesterId,
          moneyRequest.amount,
          moneyRequest.description || `Para isteği: #${moneyRequest.id}`
        );
        
        // İsteği güncelle
        await prisma.moneyRequest.update({
          where: { id: requestId },
          data: {
            status: 'approved',
            completedAt: new Date()
          }
        });
        
        // İsteyen kişiye bildirim gönder
        await createNotification(
          moneyRequest.requesterId,
          'Para İsteği Onaylandı',
          `${moneyRequest.requested.name} ${moneyRequest.amount} TL tutarındaki isteğinizi onayladı`,
          'success',
          { 
            requestId: moneyRequest.id, 
            type: 'money_request_approved' 
          }
        );
        
        logger.info(`Para isteği onaylandı: #${moneyRequest.id}`);
      } catch (error) {
        // Transfer hatası (muhtemelen yetersiz bakiye)
        let errorMessage = 'Transfer sırasında hata oluştu';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        logger.error(`Para isteği onaylanırken hata: #${moneyRequest.id}`, error);
        throw new Error(errorMessage);
      }
    } else if (action === 'reject') {
      // İsteği reddet
      await prisma.moneyRequest.update({
        where: { id: requestId },
        data: {
          status: 'rejected',
          completedAt: new Date()
        }
      });
      
      // İsteyen kişiye bildirim gönder
      await createNotification(
        moneyRequest.requesterId,
        'Para İsteği Reddedildi',
        `${moneyRequest.requested.name} ${moneyRequest.amount} TL tutarındaki isteğinizi reddetti`,
        'warning',
        { 
          requestId: moneyRequest.id, 
          type: 'money_request_rejected' 
        }
      );
      
      logger.info(`Para isteği reddedildi: #${moneyRequest.id}`);
    } else if (action === 'cancel') {
      // İsteği iptal et
      await prisma.moneyRequest.update({
        where: { id: requestId },
        data: {
          status: 'cancelled',
          completedAt: new Date()
        }
      });
      
      // İstek yapılan kişiye bildirim gönder
      await createNotification(
        moneyRequest.requestedId,
        'Para İsteği İptal Edildi',
        `${moneyRequest.requester.name} ${moneyRequest.amount} TL tutarındaki isteğini iptal etti`,
        'info',
        { 
          requestId: moneyRequest.id, 
          type: 'money_request_cancelled' 
        }
      );
      
      logger.info(`Para isteği iptal edildi: #${moneyRequest.id}`);
    }
    
    return { success: true, message: `Para isteği ${action === 'approve' ? 'onaylandı' : action === 'reject' ? 'reddedildi' : 'iptal edildi'}` };
  } catch (error) {
    logger.error(`Para isteğine yanıt verilirken hata: #${moneyRequest.id}`, error);
    throw error;
  }
};

export const getMoneyRequestsByUser = async (userId: number, type: 'sent' | 'received' | 'all' = 'all') => {
  try {
    // Filtreyi oluştur
    const filter: any = {};
    
    if (type === 'sent') {
      filter.requesterId = userId;
    } else if (type === 'received') {
      filter.requestedId = userId;
    } else {
      filter.OR = [
        { requesterId: userId },
        { requestedId: userId }
      ];
    }
    
    // İstekleri getir
    const requests = await prisma.moneyRequest.findMany({
      where: filter,
      include: {
        requester: {
          select: {
            id: true,
            name: true
          }
        },
        requested: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return requests;
  } catch (error) {
    logger.error('Para istekleri getirilirken hata:', error);
    throw error;
  }
};
