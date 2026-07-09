'use client';

import { useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  value, onChange, onFocus,
  placeholder = 'Search products...',
  showFilters, onToggleFilters,
  autoFocus = false, className,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={cn('relative', className)}>
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="input-field w-full pl-12 pr-20 py-3"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {onToggleFilters && (
          <button
            onClick={onToggleFilters}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showFilters ? 'bg-primary/20 text-primary' : 'hover:bg-navy-border text-muted',
            )}
          >
            <SlidersHorizontal size={18} />
          </button>
        )}
        {value && (
          <button onClick={() => onChange('')} className="p-2 hover:text-white transition-colors text-muted">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
