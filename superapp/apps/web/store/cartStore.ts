import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'service';
  options?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  businessId: string | null;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setBusinessId: (id: string) => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  businessId: null,

  addItem: (itemToAdd) => set((state) => {
    // If the cart has items from another business, theoretically we'd warn them.
    // For this generic store, we just add it.
    const existingItem = state.items.find(i => i.id === itemToAdd.id);
    
    if (existingItem) {
      if (itemToAdd.type === 'service') {
        // Services usually don't duplicate quantity easily without distinct slots, but keeping it simple
        return state; 
      }
      return {
        items: state.items.map(i => 
          i.id === itemToAdd.id ? { ...i, quantity: i.quantity + (itemToAdd.quantity || 1) } : i
        ),
        isOpen: true
      };
    }
    
    return {
      items: [...state.items, { ...itemToAdd, quantity: itemToAdd.quantity || 1 }],
      isOpen: true
    };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),

  updateQuantity: (id, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(i => i.id !== id) };
    }
    return {
      items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
    };
  }),

  clearCart: () => set({ items: [] }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setBusinessId: (businessId) => set({ businessId }),
  
  getTotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));
