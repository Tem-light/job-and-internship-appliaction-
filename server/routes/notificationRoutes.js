import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllAsRead);

export default router;
