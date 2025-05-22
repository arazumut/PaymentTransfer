import express from 'express';
import { getAllUsers, getUser, addUser } from '../controllers/userController';

const router = express.Router();

// Kullanıcı rotaları
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.post('/', addUser);

export default router; 