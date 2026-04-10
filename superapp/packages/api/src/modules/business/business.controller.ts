import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      { id: 'cat_1', name: 'Food & Restaurant', icon: 'utensils' },
      { id: 'cat_2', name: 'Healthcare', icon: 'stethoscope' },
      { id: 'cat_3', name: 'Beauty & Wellness', icon: 'spray-can' },
      { id: 'cat_4', name: 'Education', icon: 'book-open' },
      { id: 'cat_5', name: 'Retail', icon: 'shopping-cart' }
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const saveOnboardingProgress = async (req: Request, res: Response) => {
  try {
    const { businessId, formData } = req.body;
    
    // In actual implementation, businessId would be linked to req.user.userId
    // user ID should be fetched from token. Assuming dummy auth implementation here.
    const userId = (req as any).user?.userId || "dummy-user-id";

    let business;
    if (businessId) {
      business = await prisma.business.update({
        where: { id: businessId },
        data: { onboardingState: formData }
      });
    } else {
      business = await prisma.business.create({
        data: {
          name: formData.basic?.name || 'Draft Business',
          category: formData.category?.selected || 'Uncategorized',
          userId: userId,
          onboardingState: formData
        }
      });
    }

    res.json({ businessId: business.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
};

export const publishBusiness = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.body;
    
    // Validate everything using Zod here if needed
    
    if (!businessId) return res.status(400).json({ error: 'businessId required' });

    // For now just returning success since the data is inherently "live" when stored in db
    res.json({ success: true, message: 'Business published successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish business' });
  }
};
