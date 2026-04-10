"use client";

import { Menu, Bell, Search, UserCircle } from 'lucide-react';

interface NavbarProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Navbar({ setSidebarOpen }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
      <div className="flex items-center">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 mr-3 -ml-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-lg w-96 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white">
          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search orders, customers, items..." 
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white pulse"></span>
        </button>

        <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
           <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900">
             <UserCircle className="w-8 h-8 text-gray-300" />
           </button>
        </div>
      </div>
    </header>
  );
}
