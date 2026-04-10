export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'burst' | 'ultra-heavy' | 'success' | 'error' = 'light') => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) return;
  
  try {
    switch (type) {
      case 'light':
        window.navigator.vibrate(10);
        break;
      case 'medium':
        window.navigator.vibrate(20);
        break;
      case 'heavy':
        window.navigator.vibrate(40);
        break;
      case 'ultra-heavy':
        window.navigator.vibrate([60, 20, 80]); // Extreme physical feedback
        break;
      case 'burst':
        window.navigator.vibrate([10, 10, 10, 10, 10]); // Quick machine-gun effect
        break;
      case 'success':
        window.navigator.vibrate([15, 60, 25]);
        break;
      case 'error':
        window.navigator.vibrate([30, 50, 30, 50, 60]);
        break;
      default:
        window.navigator.vibrate(15);
    }
  } catch (e) {
    // Ignore haptic errors on unsupported devices cleanly
  }
};
