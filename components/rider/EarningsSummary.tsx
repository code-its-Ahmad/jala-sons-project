import { motion } from 'framer-motion';
import { DollarSign, Clock, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface EarningsSummaryProps {
  earningsToday: number;
  completedDeliveries: number;
  rating: number;
}

export function EarningsSummary({ earningsToday, completedDeliveries, rating }: EarningsSummaryProps) {
  const stats = [
    { icon: <DollarSign size={20} />, label: 'Earnings', value: formatPrice(earningsToday), color: 'text-success' },
    { icon: <Clock size={20} />, label: 'Deliveries', value: completedDeliveries.toString(), color: 'text-primary' },
    { icon: <Star size={20} />, label: 'Rating', value: rating.toFixed(1), color: 'text-warning' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-4 rounded-xl text-center"
        >
          <div className={`${stat.color} mb-1 flex justify-center`}>{stat.icon}</div>
          <p className="text-lg font-bold font-mono">{stat.value}</p>
          <p className="text-xs text-muted">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
