import { cn } from '@/lib/utils';
import { CheckCircle, Clock, XCircle, Bike, ChefHat, Package } from 'lucide-react';
import { OrderStatus } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/20', icon: <Clock size={14} /> },
  CONFIRMED: { label: 'Confirmed', color: 'text-primary', bg: 'bg-primary/20', icon: <CheckCircle size={14} /> },
  PREPARING: { label: 'Preparing', color: 'text-primary', bg: 'bg-primary/20', icon: <ChefHat size={14} /> },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', color: 'text-primary', bg: 'bg-primary/20', icon: <Package size={14} /> },
  RIDER_ASSIGNED: { label: 'Rider Assigned', color: 'text-secondary-text', bg: 'bg-secondary-text/20', icon: <Bike size={14} /> },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'text-success', bg: 'bg-success/20', icon: <Bike size={14} /> },
  DELIVERED: { label: 'Delivered', color: 'text-success', bg: 'bg-success/20', icon: <CheckCircle size={14} /> },
  CANCELLED: { label: 'Cancelled', color: 'text-danger', bg: 'bg-danger/20', icon: <XCircle size={14} /> },
};

export function StatusBadge({ status, showIcon = true, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      config.bg, config.color,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    )}>
      {showIcon && config.icon}
      {config.label}
    </span>
  );
}
