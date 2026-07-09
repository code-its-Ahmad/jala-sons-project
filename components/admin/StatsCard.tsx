import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  delay?: number;
  className?: string;
}

export function StatsCard({ icon, label, value, color = 'text-primary', delay = 0, className }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn('glass-card p-5 rounded-xl', className)}
    >
      <div className={color}>{icon}</div>
      <p className="text-2xl font-bold font-mono mt-2">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </motion.div>
  );
}
