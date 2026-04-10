import { Router } from 'express';
import { getCategories, saveOnboardingProgress, publishBusiness } from './business.controller';

const router = Router();

// /api/business-categories mapping.
router.get('/categories', getCategories);

// /api/vendor/onboarding mapping.
router.patch('/onboarding', saveOnboardingProgress);

// /api/vendor/business/publish mapping
router.post('/business/publish', publishBusiness);

export default router;
