import express from 'express';
import { getAllUsers, getUser, addUser } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Kullanıcı rotaları - Yetkilendirme gerektirir
router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUser);
router.post('/', addUser); // Kayıt işlemi için auth gerekmez

export default router; 