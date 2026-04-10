"use client";

import { TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export function formatINR(amount: number) {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
}

interface StatsCardProps {
  title: string;
  value: number | string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  sparklineData?: { v: number }[];
  isCurrency?: boolean;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  sparklineData,
  isCurrency = false
}: StatsCardProps) {
  const displayValue = isCurrency && typeof value === 'number' ? formatINR(value) : value;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{displayValue}</h3>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-end justify-between">
        <div className="flex items-center">
          {changeType === 'up' && <TrendingUp className="w-4 h-4 mr-1 text-green-500" />}
          {changeType === 'down' && <TrendingDown className="w-4 h-4 mr-1 text-red-500" />}
          <span className={`text-sm font-medium ${
            changeType === 'up' ? 'text-green-500' : changeType === 'down' ? 'text-red-500' : 'text-gray-500'
          }`}>
            {change}
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="w-20 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="v" 
                  stroke={changeType === 'down' ? '#ef4444' : '#22c55e'} 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
