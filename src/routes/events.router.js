import { Router } from 'express';
import { createEvent, getAllEvents, getEventById, updateEvent, updateEventStatus } from '../controllers/events.controller.js';
import { createTicket, getEventTickets } from '../controllers/tickets.controller.js';
import { authenticateCurrent } from '../middlewares/passport.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', authenticateCurrent, authorize('organizer', 'admin'), createEvent);
router.put('/:id', authenticateCurrent, authorize('organizer', 'admin'), updateEvent);
router.patch('/:id/status', authenticateCurrent, authorize('organizer', 'admin'), updateEventStatus);

router.post('/:eid/tickets', authenticateCurrent, createTicket);
router.get('/:eid/tickets', authenticateCurrent, authorize('organizer', 'admin'), getEventTickets);

export default router;