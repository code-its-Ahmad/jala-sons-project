import { motion } from 'framer-motion';
import { Bike, Star, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiderData {
  id: string;
  full_name?: string;
  vehicle_type?: string;
  avg_delivery_rating?: number;
  active_order_count?: number;
  is_online?: boolean;
}

interface RiderCardProps {
  rider: RiderData;
  index?: number;
}

export function RiderCard({ rider, index = 0 }: RiderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass-card p-4 rounded-xl flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
          <Bike size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{rider.full_name || 'Unknown'}</p>
          <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
            <span className="capitalize">{rider.vehicle_type || 'motorcycle'}</span>
            <span className="flex items-center gap-1">
              <Star size={12} className="text-warning" />
              {rider.avg_delivery_rating?.toFixed(1) || '0.0'}
            </span>
            <span>{rider.active_order_count || 0} active</span>
          </div>
        </div>
      </div>
      <div className={cn(
        'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
        rider.is_online ? 'bg-success/20 text-success' : 'bg-muted/20 text-muted',
      )}>
        {rider.is_online ? <Wifi size={12} /> : <WifiOff size={12} />}
        {rider.is_online ? 'Online' : 'Offline'}
      </div>
    </motion.div>
  );
}
