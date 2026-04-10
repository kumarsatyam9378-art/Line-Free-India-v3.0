import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// This is a simplified example. In production, 'io' should be accessed via app.get('io') or a separate socket service
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, prep_time_minutes } = req.body;

    // Verify order exists
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // We can emit to a specific order room so the customer client gets the update
    // e.g. io.to('order:' + id).emit('order_status_updated', { ... });

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
