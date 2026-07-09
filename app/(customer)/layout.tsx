'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag, Bell, User, Search, Package, LogOut, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-navy/90 backdrop-blur-lg border-b border-navy-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden btn-ghost p-2">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/home" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <ShoppingBag size={15} className="text-white" />
              </div>
              <span className="font-heading font-bold text-lg hidden sm:inline">Jalal Sons</span>
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search groceries, meals, snacks..."
                className="input-field w-full pl-10 pr-4 py-2 text-sm"
                onFocus={() => setSearchOpen(true)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden btn-ghost p-2">
              <Search size={20} />
            </button>
            <Link href="/orders" className="btn-ghost p-2 relative">
              <Package size={20} />
            </Link>
            <Link href="/notifications" className="btn-ghost p-2 relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <button onClick={toggleCart} className="btn-ghost p-2 relative">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <Link href="/profile" className="btn-ghost p-2">
              <User size={20} />
            </Link>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-14 left-0 right-0 bg-navy-light border-b border-navy-border p-4"
            >
              <div className="max-w-7xl mx-auto">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="input-field w-full pl-12 pr-4 py-3"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="w-64 h-full bg-navy-light border-r border-navy-border p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6 pt-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-2">
                <Link href="/home" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-navy-border transition-colors">
                  <ShoppingBag size={18} /> Home
                </Link>
                <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-navy-border transition-colors">
                  <Package size={18} /> My Orders
                </Link>
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-navy-border transition-colors">
                  <User size={18} /> Profile
                </Link>
                <button
                  onClick={() => { logout(); router.push('/'); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-navy-border transition-colors w-full text-left text-danger"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
