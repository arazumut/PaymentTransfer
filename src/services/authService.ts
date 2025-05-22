import prisma from '../utils/db';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// JWT Secret key - normalde .env'den alınmalıdır
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  initialBalance?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  try {
    const { name, email, password, initialBalance = 0 } = data;

    // Emailin kullanımda olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Bu email adresi zaten kullanımda');
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Kullanıcıyı oluştur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        balance: initialBalance,
      },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        createdAt: true,
      },
    });

    // JWT token oluştur
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: newUser,
      token,
    };
  } catch (error) {
    logger.error('Kullanıcı kaydı sırasında hata:', error);
    throw error;
  }
};

export const login = async (data: LoginData) => {
  try {
    const { email, password } = data;

    // Kullanıcı var mı kontrol et
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new Error('Geçersiz email veya şifre');
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Geçersiz email veya şifre');
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        createdAt: user.createdAt,
      },
      token,
    };
  } catch (error) {
    logger.error('Kullanıcı girişi sırasında hata:', error);
    throw error;
  }
};

export const validateToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
