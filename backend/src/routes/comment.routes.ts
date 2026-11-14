import { Router } from 'express';
import {
  createComment,
  getComments,
  toggleCommentLike,
} from '../controllers/comment.controller.js';
import { optionalAuth, protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCommentSchema } from '../validations/comment.validation.js';

const router = Router();

router.get('/post/:postId', optionalAuth, getComments);
router.post('/post/:postId', protect, validate(createCommentSchema), createComment);
router.post('/:id/like', protect, toggleCommentLike);

export default router;

