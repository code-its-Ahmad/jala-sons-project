'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Bike, XCircle } from 'lucide-react';
import { riderApi } from '@/lib/api';
import { formatPrice, formatDate, getStatusBadgeClass, getAddressDisplay } from '@/lib/utils';
import { Order } from '@/types';

interface ActiveOrderCardProps {
  order: Order;
  onUpdate: () => void;
}

export function ActiveOrderCard({ order, onUpdate }: ActiveOrderCardProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 rounded-xl border-primary/30"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold">Current Order</h2>
        <span className={getStatusBadgeClass(order.status)}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted">
          <MapPin size={14} />
          <span>{getAddressDisplay(order.delivery_address)}</span>
        </div>
        <p className="font-mono text-primary font-bold">{formatPrice(order.total_amount)}</p>
        <p className="text-xs text-muted">{formatDate(order.created_at)}</p>
      </div>
      <div className="flex gap-3 mt-4">
        {order.status === 'rider_assigned' && (
          <>
            <button
              onClick={() => router.push(`/rider/navigate/${order.id}`)}
              className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
            >
              <MapPin size={16} /> Navigate to Store
            </button>
            <button
              onClick={async () => { await riderApi.reject(order.id); onUpdate(); }}
              className="btn-secondary flex items-center gap-2 text-sm text-danger"
            >
              <XCircle size={16} /> Reject
            </button>
          </>
        )}
        {order.status === 'out_for_delivery' && (
          <button
            onClick={async () => { await riderApi.deliver(order.id); onUpdate(); }}
            className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
          >
            <Bike size={16} /> Mark Delivered
          </button>
        )}
      </div>
    </motion.div>
  );
}
