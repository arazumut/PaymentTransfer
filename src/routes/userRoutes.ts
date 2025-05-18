import express from 'express';
import { getAllUsers, getUser, addUser } from '../controllers/userController';

const router = express.Router();

// Kullanıcı rotaları
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.post('/users', addUser);

export default router; 