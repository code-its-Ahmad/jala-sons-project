import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-navy-border animate-pulse rounded-lg',
            className || 'h-4 w-full',
          )}
        />
      ))}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="aspect-square bg-navy-border skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-navy-border skeleton rounded w-3/4" />
        <div className="h-5 bg-navy-border skeleton rounded w-1/2" />
        <div className="h-9 bg-navy-border skeleton rounded w-full mt-2" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-xl space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-navy-border skeleton rounded w-1/3" />
        <div className="h-5 bg-navy-border skeleton rounded w-16" />
      </div>
      <div className="h-4 bg-navy-border skeleton rounded w-2/3" />
    </div>
  );
}
