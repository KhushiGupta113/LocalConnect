import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';

export async function uploadToCloudinary(
  buffer: Buffer,
  folder = 'localconnect'
): Promise<string> {
  // If Cloudinary is not configured, fallback gracefully to base64 Data URL so local development works smoothly
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary credentials not set. Falling back to data URI.');
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

