"use client";

import React from 'react';

// Helpers to map a value to a color based on the max value
const colors = ['#f8f9fa', '#d4e6f1', '#85c1e9', '#2980b9', '#1a5276'];

function getColor(value: number, max: number) {
  if (value === 0) return colors[0];
  const index = Math.min(
    Math.floor((value / max) * (colors.length - 1)) + 1,
    colors.length - 1
  );
  return colors[index];
}

interface PeakHoursHeatmapProps {
  data: {
    day: string; // 'Mon', 'Tue', etc.
    hours: number[]; // Array of 24 numbers representing orders/volume for that hour
  }[];
}

export default function PeakHoursHeatmap({ data }: PeakHoursHeatmapProps) {
  let maxVal = 0;
  data.forEach(d => {
    d.hours.forEach(h => {
      if (h > maxVal) maxVal = h;
    });
  });

  const hoursLabel = [
    '12a', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
    '12p', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hidden lg:block overflow-x-auto">
      <h3 className="font-bold text-lg text-gray-900 mb-6">Peak Hours (7 Days)</h3>
      
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="flex mb-2 pl-12 text-xs font-medium text-gray-400">
          {hoursLabel.map((h, i) => (
            <div key={i} className="flex-1 text-center w-8">
              {i % 2 === 0 ? h : ''}
            </div>
          ))}
        </div>

        {/* Heatmap Rows */}
        <div className="space-y-1">
          {data.map((dayRow) => (
            <div key={dayRow.day} className="flex items-center">
              <div className="w-12 text-xs font-medium text-gray-500 text-right pr-4">
                {dayRow.day}
              </div>
              <div className="flex flex-1 space-x-1">
                {dayRow.hours.map((val, hIdx) => (
                  <div
                    key={hIdx}
                    className="flex-1 h-8 rounded-md group relative transition-transform hover:scale-110 shadow-sm"
                    style={{ backgroundColor: getColor(val, maxVal) }}
                  >
                    {/* Tooltip */}
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded w-max bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-10 shadow-xl">
                      {`${dayRow.day} ${hoursLabel[hIdx]} - ${val} orders`}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center mt-6 text-xs text-gray-400 space-x-2 pr-2">
          <span>Less</span>
          {colors.map((c, idx) => (
             <div key={idx} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }}></div>
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
