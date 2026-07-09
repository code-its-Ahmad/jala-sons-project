import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InventoryItem {
  id: string;
  quantity_available: number;
  reorder_point?: number;
  unit?: string;
  products?: { name: string };
}

interface InventoryTableProps {
  items: InventoryItem[];
  variant?: 'overview' | 'alerts';
  type?: 'critical' | 'low_stock';
  loading?: boolean;
}

export function InventoryTable({ items, variant = 'overview', type = 'low_stock', loading }: InventoryTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-4 rounded-xl"><div className="h-12 skeleton rounded" /></div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="text-center py-10 text-muted">No items to display</div>;
  }

  const isCritical = (item: InventoryItem) => {
    const reorderPoint = item.reorder_point || 10;
    return item.quantity_available <= Math.max(1, reorderPoint * 0.2);
  };

  return (
    <div className="space-y-3">
      {variant === 'overview' && items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="glass-card p-4 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className={cn('w-2 h-2 rounded-full', isCritical(item) ? 'bg-danger' : 'bg-warning')} />
            <div>
              <p className="text-sm font-medium">{item.products?.name || 'Unknown'}</p>
              <p className="text-xs text-muted">{item.unit || 'piece'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn('font-mono text-lg font-bold', isCritical(item) ? 'text-danger' : 'text-warning')}>
              {item.quantity_available}
            </p>
            <p className="text-xs text-muted">units left</p>
          </div>
        </motion.div>
      ))}
      {variant === 'alerts' && items.map((item) => (
        <div key={item.id} className={cn('glass-card p-3 rounded-xl flex items-center justify-between', type === 'critical' ? 'border-danger/30' : 'border-warning/30')}>
          <span className="text-sm">{item.products?.name}</span>
          <span className={cn('font-mono font-bold', type === 'critical' ? 'text-danger' : 'text-warning')}>
            {item.quantity_available} left
          </span>
        </div>
      ))}
    </div>
  );
}
