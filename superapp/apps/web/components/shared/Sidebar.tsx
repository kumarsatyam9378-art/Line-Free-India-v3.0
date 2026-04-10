"use client";

import Link from 'next/Layout';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Utensils, 
  LineChart, 
  Users, 
  Settings,
  X 
} from 'lucide-react';
import LinkComponent from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Menu & Services', href: '/menu', icon: Utensils },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:w-64
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <LinkComponent href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-emerald-400 font-bold text-white flex items-center justify-center">S</div>
            <span className="text-xl font-bold tracking-tight">SuperApp</span>
          </LinkComponent>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            const Icon = link.icon;
            
            return (
              <LinkComponent
                key={link.name}
                href={link.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </LinkComponent>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <div className="flexitems-center space-x-3 px-4 py-3 rounded-lg overflow-hidden bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">JS</div>
            <div className="flex flex-col">
               <span className="text-sm font-medium">Vendor Admin</span>
               <span className="text-xs text-slate-400 truncate w-32">john@superapp.com</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
