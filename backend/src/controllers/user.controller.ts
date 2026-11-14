import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { User } from '../models/User.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const {
      fullName,
      handle,
      role,
      bio,
      street,
      photoUri,
      streetPrivate,
      showContact,
      urgentAlerts,
    } = req.body;

    if (handle && handle !== user.handle) {
      const existing = await User.findOne({ handle: handle.trim().toLowerCase() });
      if (existing) {
        sendError(res, 'Handle is already taken by another neighbor.', 409);
        return;
      }
      user.handle = handle.trim().toLowerCase();
    }

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (role !== undefined) user.role = role.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (street !== undefined) user.street = street.trim();
    if (photoUri !== undefined) user.photoUri = photoUri;
    if (streetPrivate !== undefined) user.streetPrivate = streetPrivate;
    if (showContact !== undefined) user.showContact = showContact;
    if (urgentAlerts !== undefined) user.urgentAlerts = urgentAlerts;

    await user.save();
    sendSuccess(res, { user: user.toJSON() }, 'Profile updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Error updating profile', 500);
  }
}

export async function toggleFollow(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { delta } = req.body; // 1 or -1
    const amount = delta === -1 ? -1 : 1;
    user.followingCount = Math.max(0, (user.followingCount || 0) + amount);
    await user.save();

    sendSuccess(res, { followingCount: user.followingCount });
  } catch (error: any) {
    sendError(res, error.message || 'Error updating follow status', 500);
  }
}

