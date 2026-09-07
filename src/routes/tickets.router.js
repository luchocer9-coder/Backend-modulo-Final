import { Router } from 'express';
import { getMyTicketsController, cancelTicket } from '../controllers/tickets.controller.js';
import { authenticateCurrent } from '../middlewares/passport.middleware.js';

const router = Router();

router.get('/my-tickets', authenticateCurrent, getMyTicketsController);
router.patch('/:tid/cancel', authenticateCurrent, cancelTicket);

export default router;