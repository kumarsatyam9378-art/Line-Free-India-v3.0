"use client";

import { useCartStore } from '@/store/cartStore';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { formatINR } from '../vendor/StatsCard'; // reusing format logic

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getTotal } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            Your Cart 
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs py-0.5 px-2 rounded-full">
              {items.length}
            </span>
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <ShoppingCart className="w-10 h-10 text-gray-300" />
               </div>
               <p className="font-medium text-lg">Your cart is empty</p>
               <p className="text-sm">Looks like you haven't added anything yet.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                 <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                 <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-blue-600 font-bold text-sm mt-1">{formatINR(item.price)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                       {item.type === 'product' ? (
                          <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50 rounded-l-lg"><Minus className="w-3 h-3" /></button>
                            <span className="px-2 text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50 rounded-r-lg"><Plus className="w-3 h-3" /></button>
                          </div>
                       ) : (
                          <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-md">Service</span>
                       )}
                       
                       <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="space-y-2 mb-4 text-sm">
               <div className="flex justify-between text-gray-600">
                 <span>Subtotal</span>
                 <span className="font-medium text-gray-900">{formatINR(getTotal())}</span>
               </div>
               <div className="flex justify-between text-gray-600">
                 <span>Taxes & Fees</span>
                 <span className="font-medium text-gray-900">{formatINR(getTotal() * 0.05)}</span>
               </div>
               <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-lg">
                 <span>Total</span>
                 <span className="text-blue-600">{formatINR(getTotal() * 1.05)}</span>
               </div>
            </div>
            
            <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg shadow-gray-900/20">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Just adding default ShoppingCart icon for empty state inline to avoid missing imports
function ShoppingCart(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
}
