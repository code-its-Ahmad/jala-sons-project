'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, getTotal } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60"
          onClick={() => setCartOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-navy-light border-l border-navy-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-navy-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-primary" />
                <span className="font-heading font-semibold">Cart ({items.length})</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="btn-ghost p-2">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100vh - 140px)' }}>
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag size={48} className="mx-auto text-muted mb-3" />
                  <p className="text-muted text-sm">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    className="glass-card p-3 rounded-xl flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg bg-navy-border flex-shrink-0 relative overflow-hidden">
                      {item.product.image_url ? (
                        <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted"><ShoppingBag size={16} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{item.product.name}</p>
                      <p className="font-mono text-primary text-xs mt-0.5">{formatPrice(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 hover:text-primary">
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-xs font-mono">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 hover:text-primary">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.product.id)} className="p-1 text-muted hover:text-danger">
                      <X size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-border bg-navy-light">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted">Total</span>
                  <span className="font-mono text-lg font-bold text-primary">{formatPrice(getTotal())}</span>
                </div>
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  View Cart & Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
