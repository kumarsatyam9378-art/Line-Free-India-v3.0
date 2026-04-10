"use client";

import LiveOrderFeed from '@/components/vendor/LiveOrderFeed';

export default function OrdersPage() {
  // In a real app, this businessId would come from the auth context
  const businessId = "test-business-id";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage incoming, preparing, and completed orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Feed */}
        <div className="col-span-1 border-r border-gray-100 pr-0 lg:pr-6">
          <LiveOrderFeed businessId={businessId} />
        </div>

        {/* Right 2 Columns: Kanban or List of active orders */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-96 overflow-y-auto">
             <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Preparing (2)</h3>
             
             <div className="space-y-3">
               {/* Dummy Preparing Card */}
               <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 flex flex-col">
                 <div className="flex justify-between items-center mb-2">
                   <span className="font-bold text-sm">#ORD-4921</span>
                   <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">10m left</span>
                 </div>
                 <div className="text-sm text-gray-600 mb-3">1x Paneer Butter Masala, 2x Garlic Naan</div>
                 <button className="w-full py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Mark Ready</button>
               </div>

               <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 flex flex-col">
                 <div className="flex justify-between items-center mb-2">
                   <span className="font-bold text-sm">#ORD-4922</span>
                   <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Just started</span>
                 </div>
                 <div className="text-sm text-gray-600 mb-3">1x Masala Dosa, 1x Filter Coffee</div>
                 <button className="w-full py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Mark Ready</button>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-96 overflow-y-auto">
             <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Ready for Pickup (1)</h3>

             <div className="space-y-3">
               <div className="p-3 border border-green-200 rounded-lg bg-green-50 flex flex-col">
                 <div className="flex justify-between items-center mb-2">
                   <span className="font-bold text-sm text-green-900">#ORD-4919</span>
                 </div>
                 <div className="text-sm text-gray-600 mb-2">Pickup by: Swiggy Partner</div>
                 <div className="text-xs font-bold text-gray-500 mb-3">OTP: 4921</div>
                 <button className="w-full py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700">Handed Over</button>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
