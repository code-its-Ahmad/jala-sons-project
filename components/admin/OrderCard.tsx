import { motion } from 'framer-motion';
import { formatPrice, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { Order } from '@/types';

interface AdminOrderCardProps {
  order: Order;
  index?: number;
  onClick?: (order: Order) => void;
}

export function AdminOrderCard({ order, index = 0, onClick }: AdminOrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass-card p-4 rounded-xl hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => onClick?.(order)}
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
        <span>{order.delivery_address?.substring(0, 30)}...</span>
      </div>
    </motion.div>
  );
}
