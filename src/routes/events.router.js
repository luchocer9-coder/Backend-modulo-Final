import { Router } from 'express';
import { getAllEvents, createEvent, updateEvent } from '../controllers/events.controller.js';
import { authenticateCurrent } from '../middlewares/passport.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.get('/', getAllEvents);
router.post('/', authenticateCurrent, authorize('organizer', 'admin'), createEvent);
router.put('/:id', authenticateCurrent, authorize('organizer', 'admin'), updateEvent);

export default router;