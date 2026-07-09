'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, cn } from '@/lib/utils';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const cartQty = cartItems.find((i) => i.product.id === product.id)?.quantity || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass-card rounded-xl overflow-hidden group hover:border-primary/30 transition-all"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-square bg-navy-border relative overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <ShoppingBag size={40} />
            </div>
          )}
          {product.stock_status && product.stock_status !== 'in_stock' && (
            <span className={cn(
              'absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium',
              product.stock_status === 'low' && 'bg-warning/20 text-warning',
              product.stock_status === 'critical' && 'bg-danger/20 text-danger',
              product.stock_status === 'out_of_stock' && 'bg-muted/20 text-muted',
            )}>
              {product.stock_status === 'low' && `${product.available_quantity || 0} left`}
              {product.stock_status === 'critical' && 'Running Out!'}
              {product.stock_status === 'out_of_stock' && 'Out of Stock'}
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-medium line-clamp-2 mb-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="font-mono text-primary font-bold text-lg">{formatPrice(product.price)}</p>
        {product.unit && <p className="text-xs text-muted">{product.unit}</p>}
        <button
          onClick={() => addItem(product)}
          disabled={product.stock_status === 'out_of_stock'}
          className={cn(
            'mt-2 w-full py-2 rounded-lg text-sm font-medium transition-all',
            cartQty > 0
              ? 'bg-success/20 text-success'
              : 'bg-primary hover:bg-primary-hover text-white',
            product.stock_status === 'out_of_stock' && 'opacity-50 cursor-not-allowed',
          )}
        >
          {cartQty > 0 ? `In Cart (${cartQty})` : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
}
