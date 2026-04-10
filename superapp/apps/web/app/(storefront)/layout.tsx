"use client";

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CartDrawer from '@/components/storefront/CartDrawer';
import { useCartStore } from '@/store/cartStore';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { items, setIsOpen } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* 
        This is where we would normally inject business-specific CSS variables
        e.g., style={{ '--color-primary': business.themeConfig.primary }}
        For this demo, we're relying on Tailwind defaults.
      */}
      
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
           <Link href="/storefront" className="flex items-center space-x-2 group">
             <div className="w-10 h-10 rounded-xl bg-gray-900 group-hover:bg-blue-600 transition-colors text-white flex items-center justify-center font-bold text-xl">S</div>
             <div className="flex flex-col leading-tight">
               <span className="font-bold text-gray-900 text-lg tracking-tight">Super Brand</span>
               <span className="text-xs text-gray-500 font-medium">Brought to you by SuperApp</span>
             </div>
           </Link>
           
           <nav className="hidden md:flex space-x-6 items-center">
             <Link href="/storefront" className={`text-sm font-medium hover:text-blue-600 transition-colors ${pathname === '/storefront' ? 'text-blue-600' : 'text-gray-600'}`}>Home</Link>
             <Link href="/storefront/menu" className={`text-sm font-medium hover:text-blue-600 transition-colors ${pathname === '/storefront/menu' ? 'text-blue-600' : 'text-gray-600'}`}>Menu</Link>
             <Link href="/storefront/book" className={`text-sm font-medium hover:text-blue-600 transition-colors ${pathname === '/storefront/book' ? 'text-blue-600' : 'text-gray-600'}`}>Book a Service</Link>
           </nav>

           <div className="flex items-center">
             <button 
                onClick={() => setIsOpen(true)}
                className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
             >
               <ShoppingBag className="w-6 h-6 text-gray-800" />
               {totalItems > 0 && (
                 <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white transform scale-100 transition-transform">
                   {totalItems}
                 </span>
               )}
             </button>
           </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">
         {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-12 w-full">
         <div className="max-w-5xl mx-auto px-4 lg:px-8 text-center">
           <h3 className="font-bold text-gray-900 mb-2">Super Brand</h3>
           <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Providing the best quality services and products in the city.</p>
           <p className="text-xs text-gray-400 font-medium">Powered by <span className="text-blue-600">SuperApp OS</span> © 2026</p>
         </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
