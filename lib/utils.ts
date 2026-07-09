import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = 'PKR'): string {
  return `${currency} ${price.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function getStockColor(status: string): string {
  switch (status) {
    case 'in_stock': return 'text-success';
    case 'low': return 'text-warning';
    case 'critical': return 'text-danger';
    case 'out_of_stock': return 'text-muted';
    default: return 'text-muted';
  }
}

export function getStockLabel(status: string): string {
  switch (status) {
    case 'in_stock': return 'In Stock';
    case 'low': return 'Only few left!';
    case 'critical': return 'Running Out!';
    case 'out_of_stock': return 'Out of Stock';
    default: return 'Unknown';
  }
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-warning',
    confirmed: 'text-primary',
    preparing: 'text-primary',
    ready_for_pickup: 'text-primary',
    rider_assigned: 'text-secondary-text',
    out_for_delivery: 'text-success',
    delivered: 'text-success',
    cancelled: 'text-danger',
  };
  return colors[status] || 'text-muted';
}

export function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    pending: 'badge-yellow',
    confirmed: 'badge-orange',
    preparing: 'badge-orange',
    ready_for_pickup: 'badge-orange',
    rider_assigned: 'badge-orange',
    out_for_delivery: 'badge-green',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  };
  return classes[status] || 'badge-yellow';
}

export function getAddressDisplay(addr: any): string {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object') return addr.address || addr.display_name || JSON.stringify(addr);
  return String(addr);
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function truncate(str: string, len: number = 30): string {
  return str.length > len ? str.substring(0, len) + '...' : str;
}

export function generateOrderId(id: string): string {
  return `ORD-${id.substring(0, 8).toUpperCase()}`;
}
