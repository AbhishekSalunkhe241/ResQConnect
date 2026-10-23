import Notification from '../models/Notification.js';

/**
 * Creates a notification record for a specific user
 */
export const notifyUser = async ({
  userId,
  requestId = null,
  type = 'status',
  title,
  desc,
}) => {
  if (!userId) return null;

  try {
    const notif = await Notification.create({
      userId,
      requestId,
      type,
      title,
      desc,
      time: 'Just now',
      unread: true,
      timestamp: new Date(),
    });
    return notif;
  } catch (err) {
    console.error('[Notification Error] Failed to create notification:', err.message);
    return null;
  }
};
