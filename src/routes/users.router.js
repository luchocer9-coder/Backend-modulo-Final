import { Router } from 'express';
import { getAllUsers } from '../controllers/users.controller.js';
import { authenticateCurrent } from '../middlewares/passport.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.get('/', authenticateCurrent, authorize('admin'), getAllUsers);

export default router;