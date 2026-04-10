"use client";

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export default function StorefrontHomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-24 px-4 w-full">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6">
               <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 border border-white/20 backdrop-blur-sm shadow-sm font-medium text-sm text-gray-200">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>4.9 (12.4k reviews)</span>
               </div>
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                  Experience the best in town. Delivered to you.
               </h1>
               <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                 From signature dishes to premium services, discover what makes us the top-rated local business in your city.
               </p>
               
               <div className="flex items-center space-x-4 pt-2">
                 <Link 
                   href="/storefront/menu" 
                   className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center shadow-lg shadow-white/10"
                 >
                   Order Now <ArrowRight className="w-5 h-5 ml-2" />
                 </Link>
                 <Link 
                   href="/storefront/book" 
                   className="px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors flex items-center"
                 >
                   Book Appointment
                 </Link>
               </div>
            </div>
            
            <div className="flex-1 w-full max-w-md lg:max-w-none relative aspect-square md:aspect-auto md:h-96">
               {/* Simulating a dynamic hero image depending on the business category */}
               <div className="w-full h-full bg-gradient-to-bl from-blue-500/20 to-purple-500/20 rounded-3xl border-2 border-white/10 relative overflow-hidden backdrop-blur-xl group cursor-pointer shadow-2xl flex items-center justify-center">
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                   <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">View Gallery</span>
                 </div>
                 {/* Placeholder for dynamic image */}
                 <div className="w-3/4 h-3/4 bg-gray-900/50 rounded-2xl shadow-inner border border-gray-800 rotate-3 transform group-hover:rotate-0 transition-transform duration-500 ease-out flex items-center justify-center text-gray-600 font-medium">Hero Image</div>
               </div>
            </div>
         </div>
      </section>

      {/* Categories preview */}
      <section className="py-16 px-4 bg-white">
         <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Explore Categories</h2>
              <Link href="/storefront/menu" className="text-blue-600 font-medium hover:text-blue-700 hover:underline inline-flex items-center">
                See all
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Signature Dishes', items: 24, bg: 'bg-orange-50' },
                { name: 'Bestsellers', items: 12, bg: 'bg-blue-50' },
                { name: 'Combos & Meals', items: 8, bg: 'bg-green-50' },
                { name: 'New Arrivals', items: 5, bg: 'bg-purple-50' },
              ].map((c) => (
                 <Link href="/storefront/menu" key={c.name} className={`${c.bg} p-6 rounded-2xl border border-gray-100/0 hover:border-gray-200 transition-all hover:shadow-md cursor-pointer group`}>
                    <div className="w-12 h-12 bg-white/50 backdrop-blur-md rounded-xl mb-4 text-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">🍔</div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{c.name}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">{c.items} items</p>
                 </Link>
              ))}
            </div>
         </div>
      </section>
    </div>
  );
}
