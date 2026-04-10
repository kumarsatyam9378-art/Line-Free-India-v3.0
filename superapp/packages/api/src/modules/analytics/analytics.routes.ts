import { Router } from 'express';
import { getOverviewStats } from './analytics.controller';

const router = Router();

// Endpoint for the dashboard overview numbers
router.get('/overview', getOverviewStats);

export default router;
