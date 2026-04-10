export interface Location {
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  lat: number;
  lng: number;
}

export interface OpeningHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

export interface Business {
  id: string;
  ownerId: string;
  
  // Basic Info
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  
  // Category
  category: 'food-restaurant';
  subCategory: SubCategory;
  cuisineTypes?: string[];
  
  // Contact
  phone: string;
  alternatePhone?: string;
  email?: string;
  whatsapp?: string;
  
  // Location
  location: Location;
  
  // Media
  logo?: string;
  coverImage: string;
  photos: string[];
  
  // Timing
  openingHours: OpeningHours[];
  
  // Features
  features: string[];
  paymentMethods: PaymentMethod[];
  
  // Social
  socialLinks?: SocialLinks;
  
  // Stats
  rating: number;
  totalReviews: number;
  totalViews: number;
  
  // Status
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export type SubCategory = 
  | 'restaurant-dhaba'
  | 'cafe-coffee-shop'
  | 'cloud-kitchen'
  | 'bakery-sweet-shop'
  | 'juice-bar'
  | 'tiffin-service'
  | 'catering-service'
  | 'ice-cream-parlour'
  | 'street-food-stall'
  | 'pizza-burger-shop'
  | 'biryani-house'
  | 'mess-canteen'
  | 'fruit-vegetable-shop'
  | 'dry-fruits-shop'
  | 'spice-shop';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'wallet';

export interface SubCategoryInfo {
  id: SubCategory;
  name: string;
  icon: string;
  image: string;
  description: string;
  color: string;
}

export interface BusinessFormData {
  // Step 1: Basic Info
  name: string;
  subCategory: SubCategory;
  description: string;
  shortDescription: string;
  cuisineTypes: string[];
  
  // Step 2: Contact
  phone: string;
  alternatePhone: string;
  email: string;
  whatsapp: string;
  
  // Step 3: Location
  location: Location;
  
  // Step 4: Timing
  openingHours: OpeningHours[];
  
  // Step 5: Features & Payment
  features: string[];
  paymentMethods: PaymentMethod[];
  
  // Step 6: Media
  logo: File | null;
  coverImage: File | null;
  photos: File[];
  
  // Step 7: Social
  socialLinks: SocialLinks;
}

export interface MenuItem {
  id: string;
  businessId: string;
  
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  
  category: MenuCategory;
  customCategory?: string;
  
  image?: string;
  
  isVeg: boolean;
  isAvailable: boolean;
  isBestseller: boolean;
  isSpicy: boolean;
  
  servingSize?: string;
  preparationTime?: string;
  
  tags: string[];
  
  createdAt: string;
  updatedAt: string;
}

export type MenuCategory = 
  | 'starters'
  | 'main-course'
  | 'breads'
  | 'rice-biryani'
  | 'desserts'
  | 'beverages'
  | 'snacks'
  | 'breakfast'
  | 'lunch-specials'
  | 'dinner-specials'
  | 'combo-meals'
  | 'kids-menu'
  | 'custom';

export interface MenuCategoryInfo {
  id: MenuCategory;
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  
  rating: number;
  title?: string;
  comment: string;
  
  photos?: string[];
  
  likes: number;
  
  isVerifiedVisit: boolean;
  
  response?: {
    message: string;
    respondedAt: string;
  };
  
  createdAt: string;
  updatedAt: string;
}
