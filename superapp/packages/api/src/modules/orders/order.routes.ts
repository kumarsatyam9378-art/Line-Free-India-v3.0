import { Router } from 'express';
import { updateOrderStatus } from './order.controller';

const router = Router();

// PATCH /vendor/orders/:id/status
router.patch('/:id/status', updateOrderStatus);

export default router;
