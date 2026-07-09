'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingBag, Bike, Settings, BarChart3,
  Bell, Package, Menu, X, LogOut, Activity,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/inventory', label: 'Inventory', icon: ShoppingBag },
  { href: '/admin/riders', label: 'Riders', icon: Bike },
  { href: '/admin/dispatcher', label: 'Dispatcher', icon: Activity },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-navy-light border-r border-navy-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <ShoppingBag size={15} className="text-white" />
            </div>
            <span className="font-heading font-bold text-sm">Admin Panel</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost p-1">
            <X size={18} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-secondary-text hover:text-white hover:bg-navy-border transition-all"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          <hr className="border-navy-border my-2" />
          <Link href="/home" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-secondary-text hover:text-white hover:bg-navy-border transition-all">
            <ShoppingBag size={18} />
            Customer View
          </Link>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-danger/10 transition-all w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="h-16 border-b border-navy-border flex items-center justify-between px-4 bg-navy/80 backdrop-blur-lg sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-2">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="btn-ghost p-2 relative">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
