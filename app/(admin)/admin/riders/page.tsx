'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bike, MapPin, Star, Wifi, WifiOff } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [tab, setTab] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.ridersMap().then((res) => setRiders(res.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Rider Management</h1>
      <div className="flex gap-1 glass-card p-1 rounded-xl w-fit">
        {(['list', 'map'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all', tab === t ? 'bg-primary text-white' : 'text-muted hover:text-white')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card p-4 rounded-xl"><div className="h-16 skeleton rounded" /></div>)
          ) : riders.length === 0 ? (
            <div className="text-center py-20 text-muted">No riders found</div>
          ) : (
            riders.map((rider, i) => (
              <motion.div
                key={rider.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Bike size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{rider.full_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                      <span className="capitalize">{rider.vehicle_type}</span>
                      <span className="flex items-center gap-1"><Star size={12} className="text-warning" />{rider.avg_delivery_rating?.toFixed(1)}</span>
                      <span>{rider.active_order_count} active</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                    rider.is_online ? 'bg-success/20 text-success' : 'bg-muted/20 text-muted',
                  )}>
                    {rider.is_online ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {rider.is_online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {tab === 'map' && (
        <div className="h-[60vh] glass-card rounded-xl flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted">Rider Live Map</p>
            <p className="text-xs text-muted mt-1">{riders.length} riders online</p>
          </div>
        </div>
      )}
    </div>
  );
}
