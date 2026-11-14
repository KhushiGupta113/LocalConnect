import { Router } from 'express';
import { toggleFollow, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateProfileSchema } from '../validations/user.validation.js';

const router = Router();

router.patch('/profile', protect, validate(updateProfileSchema), updateProfile);
router.post('/follow', protect, toggleFollow);

export default router;

