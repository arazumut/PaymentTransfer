import { Request, Response } from 'express';
import { getUsers, getUserById, createUser } from '../services/userService';
import { logger } from '../utils/logger';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    logger.error('Kullanıcılar listelenirken hata oluştu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kullanıcılar getirilirken bir hata oluştu' 
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz kullanıcı ID'
      });
    }
    
    const user = await getUserById(userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Kullanıcı getirilirken bir hata oluştu';
    
    if (errorMessage === 'Kullanıcı bulunamadı') {
      return res.status(404).json({ success: false, message: errorMessage });
    }
    
    logger.error(`Kullanıcı getirilirken hata: ${req.params.id}`, error);
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const { name, balance } = req.body;
    
    // Validasyon
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'İsim alanı zorunludur' 
      });
    }
    
    const initialBalance = balance || 0;
    
    if (typeof initialBalance !== 'number' || initialBalance < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bakiye sıfır veya pozitif bir sayı olmalıdır' 
      });
    }
    
    const newUser = await createUser({ name, balance: initialBalance });
    
    res.status(201).json({ 
      success: true, 
      message: 'Kullanıcı başarıyla oluşturuldu', 
      data: newUser 
    });
    
  } catch (error) {
    logger.error('Kullanıcı oluşturulurken hata:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kullanıcı oluşturulurken bir hata oluştu' 
    });
  }
}; 