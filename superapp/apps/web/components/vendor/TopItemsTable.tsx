"use client";

import React from 'react';
import { formatINR } from './StatsCard';
import { MoreHorizontal } from 'lucide-react';

interface TopItem {
  id: string;
  name: string;
  thumbnail: string;
  orders: number;
  revenue: number;
  margin: number; // percentage
  rating: number;
}

interface TopItemsTableProps {
  items: TopItem[];
}

export default function TopItemsTable({ items }: TopItemsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-900">Top Performing Items</h3>
        <button className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
            <tr>
              <th className="px-6 py-3 w-16 text-center">Rank</th>
              <th className="px-6 py-3">Item Name</th>
              <th className="px-6 py-3 text-right cursor-pointer group">
                Orders <span className="text-xs group-hover:text-blue-500 ml-1">▼</span>
              </th>
              <th className="px-6 py-3 text-right cursor-pointer group">
                Revenue <span className="text-xs text-blue-500 ml-1">▼</span>
              </th>
              <th className="px-6 py-3 text-center">Margin</th>
              <th className="px-6 py-3 text-center">Rating</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
               <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    {idx < 3 ? (
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white font-bold ${
                        idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`}>
                        {idx + 1}
                      </span>
                    ) : (
                      <span className="font-medium text-gray-400">{idx + 1}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                     <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 shadow-inner overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                        img
                     </div>
                     <span className="truncate max-w-[200px]">{item.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{item.orders}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{formatINR(item.revenue)}</td>
                  <td className="px-6 py-4 text-center">
                     <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                       item.margin > 40 ? 'bg-green-100 text-green-700' : 
                       item.margin > 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                     }`}>
                       {item.margin}%
                     </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center text-amber-500 font-medium">
                      ★ {item.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 group relative">
                       <MoreHorizontal className="w-5 h-5" />
                       <div className="absolute bg-white border border-gray-200 shadow-xl rounded-lg right-full top-0 mr-2 w-48 hidden group-hover:block z-20 py-2">
                         <div className="px-4 py-2 hover:bg-blue-50 text-blue-600 font-medium text-left cursor-pointer transition-colors border-b border-gray-100">🚀 Promote Item</div>
                         <div className="px-4 py-2 hover:bg-gray-50 text-gray-700 text-left cursor-pointer transition-colors">View Analytics</div>
                         <div className="px-4 py-2 hover:bg-gray-50 text-gray-700 text-left cursor-pointer transition-colors">Edit Price</div>
                       </div>
                    </button>
                  </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
