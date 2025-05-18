import prisma from '../utils/db';
import { logger } from '../utils/logger';

export const getIdempotencyKey = async (key: string) => {
  try {
    return await prisma.idempotencyKey.findUnique({
      where: { key },
    });
  } catch (error) {
    logger.error(`Idempotency key getirilirken hata: ${key}`, error);
    throw error;
  }
};

export const saveIdempotencyKey = async (key: string, response: any) => {
  try {
    return await prisma.idempotencyKey.create({
      data: {
        key,
        response: JSON.stringify(response),
      },
    });
  } catch (error) {
    logger.error(`Idempotency key kaydedilirken hata: ${key}`, error);
    throw error;
  }
}; 