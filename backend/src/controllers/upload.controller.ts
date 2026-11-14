import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

export async function uploadImage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, 'Please provide an image file to upload.', 400);
      return;
    }

    const folder = req.query.folder ? String(req.query.folder) : 'localconnect';
    const url = await uploadToCloudinary(req.file.buffer, folder);

    sendSuccess(res, { url }, 'Image uploaded successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Error uploading image', 500);
  }
}

