import { Router } from 'express';
import {
  getEvents,
  getGroups,
  getMyGroups,
  getMyRSVPs,
  getTopics,
  toggleEventRSVP,
  toggleGroup,
} from '../controllers/discover.controller.js';
import { optionalAuth, protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/events', optionalAuth, getEvents);
router.post('/events/:id/rsvp', protect, toggleEventRSVP);
router.get('/events/rsvps/mine', protect, getMyRSVPs);

router.get('/groups', optionalAuth, getGroups);
router.post('/groups/:id/join', protect, toggleGroup);
router.get('/groups/joined/mine', protect, getMyGroups);

router.get('/topics', getTopics);

export default router;

