// filepath: /Users/umutaraz/Desktop/Tüm hayatım burda/moneyTrans/src/services/qrService.ts
import crypto from 'crypto';
import prisma from '../utils/db';
import { logger } from '../utils/logger';

// QR kod tipleri
export enum QrCodeType {
  STANDARD = 'standard',    // Standart tek kullanımlık QR
  FIXED = 'fixed',          // Sabit tutarlı QR
  OPEN = 'open',            // Açık tutarlı QR (alıcı tutar girebilir)
  RECURRING = 'recurring'   // Tekrarlı ödeme QR'ı
}

interface QrCodeData {
  userId: number;
  amount?: number;
  description?: string;
  type?: QrCodeType;
  recurringInterval?: string; // 'daily', 'weekly', 'monthly'
  maxUsageCount?: number;     // Maksimum kullanım sayısı (null sınırsız)
}

// 15 dakika geçerli QR token oluştur
const createQrCode = async (data: QrCodeData) => {
  try {
    // Kullanıcı var mı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // Benzersiz token oluştur
    const token = crypto.randomBytes(32).toString('hex');
    
    // Geçerlilik süresi (15 dakika)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const qrType = data.type || QrCodeType.STANDARD;

    // QR kodu veritabanında sakla
    await prisma.qrCodeToken.create({
      data: {
        id: token,
        userId: data.userId,
        amount: data.amount,
        description: data.description,
        expiresAt,
        type: qrType,
        recurringInterval: data.recurringInterval,
        maxUsageCount: data.maxUsageCount,
        usageCount: 0,
        isActive: true
      }
    });

    // Döndürülecek veri
    return {
      token,
      userId: data.userId,
      userName: user.name,
      amount: data.amount,
      description: data.description,
      expiresAt,
      type: qrType,
      recurringInterval: data.recurringInterval,
      maxUsageCount: data.maxUsageCount
    };
  } catch (error) {
    logger.error('QR kod oluşturulurken hata:', error);
    throw error;
  }
};

// QR kodu doğrula ve transfer detaylarını getir
const verifyQrCode = async (token: string, senderId: number) => {
  try {
    // QR kodu bul
    const qrCodeToken = await prisma.qrCodeToken.findUnique({
      where: { id: token },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!qrCodeToken) {
      throw new Error('Geçersiz QR kod');
    }

    // QR kod aktif mi
    if (!qrCodeToken.isActive) {
      throw new Error('Bu QR kod artık aktif değil');
    }

    // Süresi dolmuş mu kontrol et
    if (qrCodeToken.expiresAt < new Date()) {
      throw new Error('QR kodun süresi dolmuş');
    }

    // Maksimum kullanım sayısını aştı mı
    if (qrCodeToken.maxUsageCount !== null && qrCodeToken.usageCount >= qrCodeToken.maxUsageCount) {
      throw new Error('QR kod maksimum kullanım sayısına ulaştı');
    }

    // Gönderici kendisine para göndermeye çalışıyor mu
    if (qrCodeToken.userId === senderId) {
      throw new Error('Kendinize para gönderemezsiniz');
    }
    
    // QR kod kullanım sayısını artır
    await prisma.qrCodeToken.update({
      where: { id: token },
      data: { usageCount: { increment: 1 } }
    });
    
    // Tek kullanımlık standart QR kodsa devre dışı bırak
    if (qrCodeToken.type === QrCodeType.STANDARD) {
      await prisma.qrCodeToken.update({
        where: { id: token },
        data: { isActive: false }
      });
    }

    // Transfer detaylarını döndür
    return {
      senderId,
      receiverId: qrCodeToken.userId,
      receiverName: qrCodeToken.user.name,
      amount: qrCodeToken.amount,
      description: qrCodeToken.description,
      type: qrCodeToken.type,
      recurringInterval: qrCodeToken.recurringInterval
    };
  } catch (error) {
    logger.error('QR kod doğrulanırken hata:', error);
    throw error;
  }
};

// Kullanıcının QR kod geçmişini getir
const getUserQrHistory = async (userId: number) => {
  try {
    const qrCodes = await prisma.qrCodeToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    return qrCodes;
  } catch (error) {
    logger.error('QR kod geçmişi alınırken hata:', error);
    throw error;
  }
};

// QR kodu sil/deaktive et
const deleteQrCode = async (qrTokenId: string, userId: number) => {
  try {
    // QR kodu bul
    const qrCodeToken = await prisma.qrCodeToken.findUnique({
      where: { id: qrTokenId }
    });
    
    if (!qrCodeToken) {
      throw new Error('QR kod bulunamadı');
    }
    
    // Kullanıcı yetkisi kontrol et
    if (qrCodeToken.userId !== userId) {
      throw new Error('Bu QR kodu silme yetkiniz yok');
    }
    
    // QR kodu deaktive et
    await prisma.qrCodeToken.update({
      where: { id: qrTokenId },
      data: { isActive: false }
    });
    
    return true;
  } catch (error) {
    logger.error('QR kod silinirken hata:', error);
    throw error;
  }
};

// QR kodu paylaşılabilir URL'e dönüştür
const generateShareableQrUrl = (token: string, baseUrl: string = process.env.APP_URL || 'https://moneytrans.app') => {
  return `${baseUrl}/transfer/qr/${token}`;
};

export { createQrCode, verifyQrCode, getUserQrHistory, deleteQrCode, generateShareableQrUrl };
