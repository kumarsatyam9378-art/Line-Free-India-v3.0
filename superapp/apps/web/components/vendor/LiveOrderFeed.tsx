"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';

export default function LiveOrderFeed({ businessId }: { businessId: string }) {
  const socket = useSocket(businessId);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_order', (order: any) => {
      setOrders(prev => [order, ...prev]);
      // Optional: play sound or show browser notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
         new Notification(`New Order received for ${order.totalAmount}`);
      }
    });

    return () => {
      socket.off('new_order');
    };
  }, [socket]);

  const acceptOrder = async (id: string) => {
    // Normally PATCH /vendor/orders/:id/status
    // Simulated local state update
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-96 overflow-y-auto">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        Live Feed 
        <span className="w-2 h-2 ml-2 rounded-full bg-green-500 animate-pulse"></span>
      </h3>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-gray-400 text-center py-10">No new orders waiting...</div>
        ) : (
          <AnimatePresence>
            {orders.map(order => (
              <motion.div
                key={order.id}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="p-4 border-2 border-orange-400 rounded-lg bg-orange-50 animate-pulse"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">Order #{order.id.slice(-4)}</span>
                  <span className="font-bold text-orange-600">₹{order.totalAmount}</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {order.items?.length || 1} items • ETA ~15 mins
                </div>
                <button
                  onClick={() => acceptOrder(order.id)}
                  className="w-full py-2 bg-green-600 text-white rounded-lg font-medium shadow-sm hover:bg-green-700"
                >
                  Accept Order
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
