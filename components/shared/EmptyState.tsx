import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center py-16 text-center', className)}
    >
      {icon && <div className="text-muted mb-4">{icon}</div>}
      <h3 className="text-lg font-heading font-semibold text-secondary-text mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-xs mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
