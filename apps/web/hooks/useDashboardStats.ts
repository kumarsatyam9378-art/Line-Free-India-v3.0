"use client";

import { useState, useEffect } from 'react';

// Should grab token from auth store or local storage
const getAccessToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
};

export function useDashboardStats(period: string = '7D') {
  const [data, setData] = useState({
    orders: 0,
    revenue: 0,
    rating: 0,
    newCustomers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const res = await fetch(`/vendor/analytics/overview?period=${period}`, {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`
          }
        });
        
        if (res.ok && isMounted) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();

    // Polling every 30s
    const interval = setInterval(fetchStats, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [period]);

  return { ...data, isLoading };
}
