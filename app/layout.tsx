'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const subscribe = useNotificationStore((s) => s.subscribe);
  const unsubscribe = useNotificationStore((s) => s.unsubscribe);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initialize();
  }, []);

  useEffect(() => {
    if (user?.id) {
      subscribe(user.id);
    }
    return () => unsubscribe();
  }, [user?.id]);

  if (!mounted) return null;

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F1624" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-navy text-white-text min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
