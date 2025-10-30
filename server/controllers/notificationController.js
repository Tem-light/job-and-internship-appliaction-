import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications.map(n => ({ ...n.toObject(), id: n._id })));
  } catch (e) {
    console.error('Error in getMyNotifications:', e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ count });
  } catch (e) {
    console.error('Error in getUnreadCount:', e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.json({ ...notif.toObject(), id: notif._id });
  } catch (e) {
    console.error('Error in markAsRead:', e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (e) {
    console.error('Error in markAllAsRead:', e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
