"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Should grab token from auth store or local storage
const getAccessToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
};

export function useSocket(businessId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // API URL based on env
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const s = io(socketUrl, {
      auth: { token: getAccessToken() }
    });

    if (businessId) {
      s.emit('join_vendor', { business_id: businessId });
    }

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [businessId]);

  return socket;
}
