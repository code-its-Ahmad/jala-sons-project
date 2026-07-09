'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock } from 'lucide-react';
import { formatPrice, formatDate, getStatusBadgeClass, generateOrderId } from '@/lib/utils';
import { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  index?: number;
}

export function OrderCard({ order, index = 0 }: OrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass-card p-4 rounded-xl hover:border-primary/30 transition-all"
    >
      <Link href={`/track/${order.id}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-primary" />
            <span className="font-mono text-sm font-medium">{generateOrderId(order.id)}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(order.status)}`}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {order.delivery_address?.substring(0, 25)}...
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(order.created_at)}
          </span>
        </div>
        <div className="mt-2 font-mono text-primary font-bold text-sm">
          {formatPrice(order.total_amount)}
        </div>
      </Link>
    </motion.div>
  );
}
