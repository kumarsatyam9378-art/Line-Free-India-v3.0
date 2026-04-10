import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BusinessFormData } from '../types/food';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatTime(time: string): string {
  if (!time || !time.includes(':')) return time;
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function isOpenNow(openingHours: { day: string; isOpen: boolean; openTime: string; closeTime: string }[]): boolean {
  if (!openingHours || !Array.isArray(openingHours)) return false;
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  
  const todayHours = openingHours.find(h => h.day === currentDay);
  if (!todayHours || !todayHours.isOpen) return false;
  
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
}

export function getOpenStatus(openingHours: { day: string; isOpen: boolean; openTime: string; closeTime: string }[]): {
  isOpen: boolean;
  message: string;
  nextChange: string;
} {
  if (!openingHours || openingHours.length === 0) {
     return { isOpen: false, message: 'Closed', nextChange: 'Hours not available' };
  }
  const open = isOpenNow(openingHours);
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  const todayHours = openingHours.find(h => h.day === currentDay);
  
  if (open && todayHours) {
    return {
      isOpen: true,
      message: 'Open Now',
      nextChange: `Closes at ${formatTime(todayHours.closeTime)}`,
    };
  }
  
  // Find next opening
  const currentDayIndex = now.getDay();
  for (let i = 0; i < 7; i++) {
    const dayIndex = (currentDayIndex + i) % 7;
    const dayHours = openingHours.find(h => h.day === days[dayIndex]);
    if (dayHours?.isOpen) {
      if (i === 0) {
        return {
          isOpen: false,
          message: 'Closed',
          nextChange: `Opens at ${formatTime(dayHours.openTime)}`,
        };
      }
      return {
        isOpen: false,
        message: 'Closed',
        nextChange: `Opens ${days[dayIndex]} at ${formatTime(dayHours.openTime)}`,
      };
    }
  }
  
  return {
    isOpen: false,
    message: 'Closed',
    nextChange: 'Check back later',
  };
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

export const validators = {
  phone: (value: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },
  
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  pincode: (value: string): boolean => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(value);
  },
  
  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },
  
  minLength: (value: string, min: number): boolean => {
    return value.trim().length >= min;
  },
  
  maxLength: (value: string, max: number): boolean => {
    return value.trim().length <= max;
  },
  
  gst: (value: string): boolean => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(value);
  },
  
  fssai: (value: string): boolean => {
    const fssaiRegex = /^[0-9]{14}$/;
    return fssaiRegex.test(value);
  },
};

export function validateBusinessForm(data: Partial<BusinessFormData>): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // Name
  if (!data.name || !validators.minLength(data.name, 3)) {
    errors.name = 'Business name must be at least 3 characters';
  }
  
  // Phone
  if (!data.phone || !validators.phone(data.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }
  
  // Email (optional but must be valid if provided)
  if (data.email && !validators.email(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Description
  if (!data.description || !validators.minLength(data.description, 20)) {
    errors.description = 'Description must be at least 20 characters';
  }
  
  // Location
  if (!data.location?.address) {
    errors.address = 'Address is required';
  }
  if (!data.location?.city) {
    errors.city = 'City is required';
  }
  if (!data.location?.pincode || !validators.pincode(data.location.pincode)) {
    errors.pincode = 'Please enter a valid 6-digit pincode';
  }
  
  return errors;
}
