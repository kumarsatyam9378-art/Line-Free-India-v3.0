"use client";

import { useMemo } from 'react';
import { formatINR } from './StatsCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface RevenueAreaChartProps {
  data: { date: string; revenue: number; orders: number }[];
  period: string; // 'Today', '7D', '30D', '90D'
}

type TooltipProps = {
  active?: boolean;
  payload?: any[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border-none rounded-lg p-4 shadow-xl">
        <p className="text-gray-300 text-sm mb-2">{label}</p>
        <p className="font-bold text-white text-lg flex items-center">
          <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
          {formatINR(payload[0].value)}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {payload[0].payload.orders} orders
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueAreaChart({ data, period }: RevenueAreaChartProps) {
  // We can derive chart tick formatting based on 'period' if needed
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-900">Revenue Overview</h3>
        <div className="flex space-x-2">
          {['Today', '7D', '30D', '90D'].map(p => (
            <button 
              key={p} 
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                period === p ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
