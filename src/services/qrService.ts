import crypto from 'crypto';
import prisma from '../utils/db';
import { logger } from '../utils/logger';

interface QrCodeData {
  userId: number;
  amount?: number;
  description?: string;
}

interface QrCodeToken {
  id: string;
  userId: number;
  amount?: number;
  description?: string;
  expiresAt: Date;
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

    // QR kodu veritabanında sakla
    await prisma.qrCodeToken.create({
      data: {
        id: token,
        userId: data.userId,
        amount: data.amount,
        description: data.description,
        expiresAt
      }
    });

    // Döndürülecek veri
    return {
      token,
      userId: data.userId,
      userName: user.name,
      amount: data.amount,
      description: data.description,
      expiresAt
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

    // Süresi dolmuş mu kontrol et
    if (qrCodeToken.expiresAt < new Date()) {
      throw new Error('QR kodun süresi dolmuş');
    }

    // Gönderici kendisine para göndermeye çalışıyor mu
    if (qrCodeToken.userId === senderId) {
      throw new Error('Kendinize para gönderemezsiniz');
    }

    // Transfer detaylarını döndür
    return {
      senderId,
      receiverId: qrCodeToken.userId,
      receiverName: qrCodeToken.user.name,
      amount: qrCodeToken.amount,
      description: qrCodeToken.description
    };
  } catch (error) {
    logger.error('QR kod doğrulanırken hata:', error);
    throw error;
  }
};

export { createQrCode, verifyQrCode };
