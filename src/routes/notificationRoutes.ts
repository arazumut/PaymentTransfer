import { Router } from 'express';
import { 
  getNotificationsHandler, 
  markAsReadHandler, 
  markAllAsReadHandler 
} from '../controllers/notificationController';

const router = Router();

// Kullanıcının bildirimlerini getir
router.get('/:userId', getNotificationsHandler);

// Bildirimi okundu olarak işaretle
router.put('/:id/read', markAsReadHandler);

// Kullanıcının tüm bildirimlerini okundu olarak işaretle
router.put('/:userId/read-all', markAllAsReadHandler);

export default router;
