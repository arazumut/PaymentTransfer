import prisma from '../utils/db';
import { logger } from '../utils/logger';

export interface UserData {
  id?: number;
  name: string;
  balance: number;
}

export const getUsers = async () => {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        balance: true,
        createdAt: true,
      },
    });
  } catch (error) {
    logger.error('Kullanıcılar getirilirken hata oluştu:', error);
    throw new Error('Kullanıcılar getirilirken hata oluştu');
  }
};

export const getUserById = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        balance: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    return user;
  } catch (error) {
    logger.error(`Kullanıcı ${id} getirilirken hata oluştu:`, error);
    throw error;
  }
};

export const createUser = async (userData: UserData) => {
  try {
    return await prisma.user.create({
      data: {
        name: userData.name,
        balance: userData.balance || 0,
      },
    });
  } catch (error) {
    logger.error('Kullanıcı oluşturulurken hata oluştu:', error);
    throw new Error('Kullanıcı oluşturulurken hata oluştu');
  }
}; 