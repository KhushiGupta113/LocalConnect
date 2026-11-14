import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import {
  comparePassword,
  generateHandle,
  generateToken,
  hashPassword,
} from '../services/auth.service.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, neighborhood, neighborhoodDetail, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      sendError(res, 'An account with this email already exists. Log in instead.', 409);
      return;
    }

    const hashedPassword = await hashPassword(password);
    const handle = generateHandle(normalizedEmail, fullName);
    const isMaya = fullName.toLowerCase().includes('maya');

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      neighborhood: neighborhood.trim(),
      neighborhoodDetail: neighborhoodDetail || '',
      handle,
      bio: isMaya
        ? 'Urban gardener, sustainability advocate & Oakridge Commons resident for 6 years. Always happy to lend garden tools and organize block cleanups!'
        : `Neighbor in ${neighborhood.trim()}.`,
      role: isMaya ? 'Block Representative' : 'Resident',
      street: isMaya ? '12th & Elmwood St' : '',
      neighborCount: 328,
      followingCount: 142,
      streetPrivate: true,
      showContact: true,
      urgentAlerts: true,
      verified: true,
    });

    const token = generateToken(newUser._id.toString());
    sendSuccess(res, { user: newUser.toJSON(), token }, 'Registration successful', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Error registering user', 500);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    const isMatch = await comparePassword(password, user.password || '');
    if (!isMatch) {
      sendError(res, 'That password does not match the account.', 401);
      return;
    }

    const token = generateToken(user._id.toString());
    sendSuccess(res, { user: user.toJSON(), token }, 'Login successful');
  } catch (error: any) {
    sendError(res, error.message || 'Error logging in', 500);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }
    sendSuccess(res, { user: req.user.toJSON() });
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching user session', 500);
  }
}

