'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Bike, DollarSign, AlertTriangle, TrendingUp,
  ChevronRight, Package, Clock, Settings,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-xl"><div className="h-16 skeleton rounded" /></div>
          ))}
        </div>
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Package size={22} />, label: 'Orders Today', value: stats?.total_orders_today || 0, color: 'text-primary' },
          { icon: <DollarSign size={22} />, label: 'Revenue Today', value: formatPrice(stats?.revenue_today || 0), color: 'text-success' },
          { icon: <Bike size={22} />, label: 'Active Riders', value: stats?.active_riders || 0, color: 'text-warning' },
          { icon: <AlertTriangle size={22} />, label: 'Critical Items', value: stats?.critical_items || 0, color: 'text-danger' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 rounded-xl"
          >
            <div className={stat.color}>{stat.icon}</div>
            <p className="text-2xl font-bold font-mono mt-2">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-heading font-semibold mb-4">Orders by Status</h3>
          {stats?.orders_by_status ? (
            <div className="space-y-3">
              {Object.entries(stats.orders_by_status).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-32">{status.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-2 bg-navy-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min((count / Math.max(...Object.values(stats.orders_by_status) as number[])) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No data</p>
          )}
        </div>

        {/* At Risk Items */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-heading font-semibold mb-4">At-Risk Inventory</h3>
          {stats?.at_risk_items?.length > 0 ? (
            <div className="space-y-3">
              {stats.at_risk_items.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{item.products?.name || 'Unknown'}</p>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>Stockout: {item.predicted_stockout_at ? new Date(item.predicted_stockout_at).toLocaleString() : 'N/A'}</span>
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-xs',
                        (item.confidence_score || 0) > 0.7 ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning',
                      )}>
                        {Math.round((item.confidence_score || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No at-risk items</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/admin/orders', label: 'Manage Orders', icon: Package },
          { href: '/admin/inventory', label: 'Inventory', icon: ShoppingBag },
          { href: '/admin/riders', label: 'Riders', icon: Bike },
          { href: '/admin/settings', label: 'Settings', icon: Settings },
        ].map((link, i) => (
          <Link key={i} href={link.href}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 rounded-xl flex items-center justify-between hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <link.icon size={18} className="text-primary" />
                <span className="text-sm">{link.label}</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
