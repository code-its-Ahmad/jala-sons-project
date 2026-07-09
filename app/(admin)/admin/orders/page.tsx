'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate, getStatusBadgeClass, getAddressDisplay } from '@/lib/utils';

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'rider_assigned', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await ordersApi.allOrders(selectedStatus ? { status: selectedStatus } : {});
      setOrders(res.data || []);
    } catch {}
    setLoading(false);
  }

  const filtered = orders.filter((o) =>
    !filter || o.id.toLowerCase().includes(filter.toLowerCase()) || (o.store_name || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Orders</h1>
        <button onClick={loadOrders} className="btn-secondary text-sm">Refresh</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search orders..."
            className="input-field w-full pl-10 py-2 text-sm"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="input-field py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card p-4 rounded-xl"><div className="h-16 skeleton rounded" /></div>
        ))
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">No orders found</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 rounded-xl hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium">#{order.id.substring(0, 8).toUpperCase()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(order.status)}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="font-mono text-primary font-bold">{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{formatDate(order.created_at)}</span>
                <span>{getAddressDisplay(order.delivery_address).substring(0, 30)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
