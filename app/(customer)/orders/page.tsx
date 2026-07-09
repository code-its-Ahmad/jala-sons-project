'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { Order } from '@/types';

const PAST_STATUSES = ['delivered', 'cancelled'];

export default function OrdersPage() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await ordersApi.myOrders();
      const all = res.data || [];
      setActiveOrders(all.filter((o: Order) => !PAST_STATUSES.includes(o.status)));
      setPastOrders(all.filter((o: Order) => PAST_STATUSES.includes(o.status)));
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }

  function renderOrderCard(order: Order) {
    return (
      <Link key={order.id} href={`/track/${order.id}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-xl hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-primary" />
              <span className="font-mono text-sm font-medium">
                #{order.id.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(order.status)}`}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{formatDate(order.created_at)}</span>
            <span className="font-mono text-primary font-bold">{formatPrice(order.total_amount)}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted">
              {order.items?.length || 0} items
              {order.store_name && ` \u00b7 ${order.store_name}`}
            </span>
            <ChevronRight size={14} className="text-muted" />
          </div>
        </motion.div>
      </Link>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-4 rounded-xl">
            <div className="h-5 skeleton rounded w-1/3 mb-2" />
            <div className="h-4 skeleton rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-heading font-semibold mb-4">
          Active Orders ({activeOrders.length})
        </h2>
        {activeOrders.length === 0 ? (
          <div className="text-center py-10 glass-card rounded-xl">
            <Package size={32} className="mx-auto text-muted mb-2" />
            <p className="text-muted text-sm">No active orders</p>
          </div>
        ) : (
          <div className="space-y-3">{activeOrders.map(renderOrderCard)}</div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-heading font-semibold mb-4">
          Past Orders ({pastOrders.length})
        </h2>
        {pastOrders.length === 0 ? (
          <p className="text-muted text-sm text-center py-10">No past orders</p>
        ) : (
          <div className="space-y-3">{pastOrders.map(renderOrderCard)}</div>
        )}
      </section>
    </div>
  );
}
