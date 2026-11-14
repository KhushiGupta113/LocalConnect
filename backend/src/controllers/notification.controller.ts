import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { Notification } from '../models/Notification.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { formatTimeLabel } from '../utils/timeLabel.js';

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const notifications = await Notification.find({ recipient: user._id }).sort({ createdAt: -1 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const formatted = notifications.map((n) => {
      const createdTime = new Date(n.createdAt).getTime();
      const section = createdTime >= todayStart ? 'Today' : 'Earlier';
      return {
        id: n._id.toString(),
        kind: n.kind,
        title: n.title,
        body: n.body,
        timeLabel: formatTimeLabel(n.createdAt),
        section,
        unread: n.unread,
        postId: n.post ? n.post.toString() : undefined,
        preview: n.preview,
      };
    });

    const unreadCount = formatted.filter((item) => item.unread).length;
    sendSuccess(res, { notifications: formatted, unreadCount });
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching notifications', 500);
  }
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { id } = req.params;
    await Notification.findOneAndUpdate({ _id: id, recipient: user._id }, { unread: false });
    sendSuccess(res, null, 'Notification marked as read');
  } catch (error: any) {
    sendError(res, error.message || 'Error updating notification', 500);
  }
}

export async function markAllNotificationsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    await Notification.updateMany({ recipient: user._id, unread: true }, { unread: false });
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error: any) {
    sendError(res, error.message || 'Error updating notifications', 500);
  }
}

