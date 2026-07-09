'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bike, Power, Clock, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRiderStore } from '@/store/riderStore';
import { riderApi } from '@/lib/api';

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { profile, isOnline, setIsOnline } = useRiderStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'rider' && !isLoading) {
      router.push('/home');
    }
  }, [isLoading, isAuthenticated, user]);

  useEffect(() => {
    loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      const res = await riderApi.profile();
      useRiderStore.getState().setProfile(res);
    } catch {}
  }

  async function toggleOnline() {
    const newStatus = !isOnline;
    try {
      await riderApi.availability({ is_online: newStatus });
      setIsOnline(newStatus);
    } catch {}
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-navy">
      {/* Rider Header */}
      <nav className="sticky top-0 z-50 bg-navy/90 backdrop-blur-lg border-b border-navy-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/rider" className="flex items-center gap-2">
            <Bike size={20} className="text-primary" />
            <span className="font-heading font-bold">Rider Portal</span>
          </Link>
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isOnline ? 'bg-success/20 text-success' : 'bg-muted/20 text-muted'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-muted'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
