'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  maxVisible?: number;
}

export function Pagination({ current, total, pageSize, onChange, maxVisible = 5 }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  function getVisiblePages(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }
    return pages;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg glass-card hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
      {getVisiblePages().map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-muted text-sm">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={cn(
              'w-10 h-10 rounded-lg text-sm font-medium transition-all',
              current === page ? 'bg-primary text-white' : 'glass-card hover:border-primary/30',
            )}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current >= totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-lg glass-card hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
