import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
  }
});
import jwt from 'jsonwebtoken';

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    // Should use proper JWT_SECRET from env
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (socket as any).user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join_vendor', (data: { business_id: string }) => {
    if (data.business_id) {
      socket.join('vendor:' + data.business_id);
      console.log(`Socket joined room: vendor:${data.business_id}`);
    }
  });

  socket.on('join_order', (data: { order_id: string }) => {
    if (data.order_id) {
      socket.join('order:' + data.order_id);
      console.log(`Socket joined room: order:${data.order_id}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

import authRoutes from './modules/auth/auth.routes';
import businessRoutes from './modules/business/business.routes';
import orderRoutes from './modules/orders/order.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

app.use('/auth', authRoutes);
app.use('/vendor', businessRoutes);
app.use('/vendor/orders', orderRoutes);
app.use('/vendor/analytics', analyticsRoutes);
app.use('/api', businessRoutes); // fallback for /api/business-categories

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SuperApp API is running' });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
