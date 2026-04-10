"use client";

import { 
  IndianRupee, 
  ShoppingBag, 
  Star, 
  Users 
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import StatsCard from '@/components/vendor/StatsCard';
import RevenueAreaChart from '@/components/vendor/RevenueAreaChart';
import PeakHoursHeatmap from '@/components/vendor/PeakHoursHeatmap';
import TopItemsTable from '@/components/vendor/TopItemsTable';

export default function DashboardPage() {
  const { orders, revenue, rating, newCustomers, isLoading } = useDashboardStats('7D');

  // Dummy mock charts for visual demonstration based on blueprint instructions
  const revenueData = [
    { date: 'Mon', revenue: 15400, orders: 45 },
    { date: 'Tue', revenue: 12100, orders: 36 },
    { date: 'Wed', revenue: 18900, orders: 59 },
    { date: 'Thu', revenue: 14200, orders: 41 },
    { date: 'Fri', revenue: 25600, orders: 81 },
    { date: 'Sat', revenue: 32100, orders: 104 },
    { date: 'Sun', revenue: 29500, orders: 92 },
  ];

  const peakHoursData = [
    { day: 'Mon', hours: [0,0,0,0,0,0,0,2,8,12,6,15,22,18,12,8,6,15,35,42,30,12,5,0] },
    { day: 'Tue', hours: [0,0,0,0,0,0,0,1,5,9,8,10,18,14,10,7,5,10,25,32,20,8,2,0] },
    { day: 'Wed', hours: [0,0,0,0,0,0,0,3,9,14,10,18,25,20,15,10,8,18,40,48,35,15,6,0] },
    { day: 'Thu', hours: [0,0,0,0,0,0,0,2,7,11,9,14,20,16,12,9,7,14,30,38,28,10,4,0] },
    { day: 'Fri', hours: [1,0,0,0,0,0,0,4,12,18,15,25,35,28,20,15,12,25,60,75,65,40,15,5] },
    { day: 'Sat', hours: [2,1,0,0,0,0,0,5,15,22,25,35,45,40,30,25,20,35,80,100,90,55,25,10] },
    { day: 'Sun', hours: [3,2,0,0,0,0,0,6,18,28,30,40,55,50,40,35,30,45,95,120,105,70,35,15] },
  ];

  const topItemsData = [
    { id: '1', name: 'Paneer Butter Masala', thumbnail: '', orders: 145, revenue: 36250, margin: 45, rating: 4.8 },
    { id: '2', name: 'Chicken Biryani (Full)', thumbnail: '', orders: 120, revenue: 42000, margin: 35, rating: 4.9 },
    { id: '3', name: 'Garlic Naan', thumbnail: '', orders: 340, revenue: 17000, margin: 75, rating: 4.6 },
    { id: '4', name: 'Masala Dosa', thumbnail: '', orders: 95, revenue: 11400, margin: 55, rating: 4.5 },
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
           <p className="text-sm text-gray-500 mt-1">Here's what is happening with your business today.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Revenue" 
          value={revenue} 
          change="12.5%" 
          changeType="up" 
          icon={<IndianRupee className="w-5 h-5 text-blue-600" />} 
          isCurrency={true}
        />
        <StatsCard 
          title="Orders" 
          value={orders} 
          change="8.2%" 
          changeType="up" 
          icon={<ShoppingBag className="w-5 h-5 text-indigo-600" />} 
        />
        <StatsCard 
          title="Average Rating" 
          value={rating} 
          change="-0.1" 
          changeType="down" 
          icon={<Star className="w-5 h-5 text-amber-500" />} 
        />
        <StatsCard 
          title="New Customers" 
          value={newCustomers} 
          change="24.5%" 
          changeType="up" 
          icon={<Users className="w-5 h-5 text-emerald-600" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueAreaChart data={revenueData} period="7D" />
        </div>
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center h-[400px]">
           <div className="w-24 h-24 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-4">
             <Star className="w-10 h-10" />
           </div>
           <h3 className="font-bold text-gray-900 text-lg mb-2">You're doing great!</h3>
           <p className="text-sm text-gray-500 mb-6">Your order volume is in the top 15% of businesses in your city.</p>
           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">View detailed report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TopItemsTable items={topItemsData} />
      </div>

      {/* Heatmap visible only on large screens natively */}
      <div className="hidden lg:block">
        <PeakHoursHeatmap data={peakHoursData} />
      </div>
    </div>
  );
}
