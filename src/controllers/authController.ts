import { Request, Response } from 'express';
import { register, login } from '../services/authService';
import { logger } from '../utils/logger';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, initialBalance } = req.body;
    
    // Validasyon
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'İsim, email ve şifre alanları zorunludur' 
      });
    }
    
    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir email adresi giriniz'
      });
    }
    
    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır'
      });
    }
    
    // Başlangıç bakiyesi kontrolü
    const balance = initialBalance || 0;
    if (typeof balance !== 'number' || balance < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bakiye sıfır veya pozitif bir sayı olmalıdır' 
      });
    }
    
    const result = await register({ 
      name, 
      email, 
      password, 
      initialBalance: balance 
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Kullanıcı başarıyla oluşturuldu', 
      data: result
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Kullanıcı oluşturulurken bir hata oluştu';
    
    if (errorMessage === 'Bu email adresi zaten kullanımda') {
      return res.status(400).json({ success: false, message: errorMessage });
    }
    
    logger.error('Kullanıcı kaydı sırasında hata:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kullanıcı oluşturulurken bir hata oluştu' 
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validasyon
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ve şifre alanları zorunludur' 
      });
    }
    
    const result = await login({ email, password });
    
    res.status(200).json({ 
      success: true, 
      message: 'Giriş başarılı', 
      data: result
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu';
    
    if (errorMessage === 'Geçersiz email veya şifre') {
      return res.status(401).json({ success: false, message: errorMessage });
    }
    
    logger.error('Kullanıcı girişi sırasında hata:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Giriş yapılırken bir hata oluştu' 
    });
  }
};
