import { useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from './ToastSystem';

/**
 * Headless component that listens to real-time notifications from AppContext
 * and triggers high-fidelity toasts.
 */
export default function TokenNotificationListener() {
  const { notifications, user, role } = useApp();
  const { showToast } = useToast();
  const lastNotifId = useRef<string | null>(null);

  useEffect(() => {
    if (!user || notifications.length === 0) return;

    const latest = notifications[0];
    
    // Only trigger for new, unread notifications
    if (latest.id && latest.id !== lastNotifId.current && !latest.read) {
      // If it's a business owner getting a new token
      if (role === 'business' && (latest.type === 'token_ready' || latest.type === 'token_called')) {
        showToast(latest.body, 'success');
        
        // Play a high-tech aurora sound effect (Simulated via haptic animation in toast)
        // In a real PWA, we could use haptics here: window.navigator.vibrate?.([50, 30, 50]);
      } 
      // If it's a customer getting notified
      else if (role === 'customer' && latest.type === 'token_called') {
        showToast(latest.body, 'info');
      }

      lastNotifId.current = latest.id;
    }
  }, [notifications, user, role, showToast]);

  return null;
}
