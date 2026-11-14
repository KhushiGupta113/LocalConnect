import { Router } from 'express';
import {
  createPost,
  getFeed,
  getMyPosts,
  getPostById,
  getSavedPosts,
  toggleBookmark,
  toggleLike,
} from '../controllers/post.controller.js';
import { optionalAuth, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPostSchema } from '../validations/post.validation.js';

const router = Router();

router.get('/', optionalAuth, getFeed);
router.post('/', protect, validate(createPostSchema), createPost);
router.get('/saved', protect, getSavedPosts);
router.get('/mine', protect, getMyPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

export default router;

