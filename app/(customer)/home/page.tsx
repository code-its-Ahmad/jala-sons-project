'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Mic, Barcode, ChevronRight, ShoppingBag } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, cn } from '@/lib/utils';
import { Product, Category } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  'vegetables': '🥦', 'fruits': '🍎', 'dairy': '🥛', 'bakery': '🍞',
  'beverages': '🥤', 'meat': '🥩', 'snacks': '🍿', 'default': '🛒',
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [prodRes, catRes] = await Promise.all([
        productsApi.list({ limit: 12, sort: 'created_at' }),
        productsApi.categories(),
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  function getCartQty(productId: string) {
    return cartItems.find((i) => i.product.id === productId)?.quantity || 0;
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Carousel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-40 md:h-56 rounded-2xl overflow-hidden bg-gradient-to-r from-primary/30 to-primary/10 border border-navy-border"
      >
        <div className="absolute inset-0 flex items-center px-6 md:px-10">
          <div>
            <p className="text-sm text-primary font-medium mb-1">Today's Offer</p>
            <h2 className="text-2xl md:text-4xl font-heading font-bold">Free Delivery</h2>
            <p className="text-secondary-text text-sm mt-1">On orders above PKR 1,000</p>
            <button className="mt-3 btn-primary text-sm px-5 py-2">Order Now</button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <Link
        href="/search"
        className="flex items-center gap-3 glass-card p-3 rounded-xl hover:border-primary/30 transition-all"
      >
        <Search size={20} className="text-muted" />
        <span className="flex-1 text-secondary-text text-sm">Search for groceries, meals, snacks...</span>
        <div className="flex items-center gap-2">
          <Mic size={16} className="text-muted" />
          <Barcode size={16} className="text-muted" />
        </div>
      </Link>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold">Categories</h2>
          <Link href="/categories" className="text-sm text-primary flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-20 flex flex-col items-center gap-2">
                <div className="w-16 h-16 skeleton rounded-xl" />
                <div className="w-14 h-3 skeleton rounded" />
              </div>
            ))
          ) : (
            categories.slice(0, 10).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/category/${cat.slug}?id=${cat.id}`}
                  className="flex-shrink-0 w-20 flex flex-col items-center gap-2 group"
                >
                  <div className="w-16 h-16 glass-card rounded-xl flex items-center justify-center text-2xl group-hover:border-primary/50 transition-all">
                    {CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.default}
                  </div>
                  <span className="text-xs text-secondary-text text-center line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold">Today's Picks</h2>
          <Link href="/search" className="text-sm text-primary flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl overflow-hidden">
                  <div className="aspect-square skeleton" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 skeleton rounded w-3/4" />
                    <div className="h-5 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))
            : products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
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
                          {product.stock_status === 'low' && `${product.available_quantity} left`}
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
                    <p className="font-mono text-primary font-bold text-lg">
                      {formatPrice(product.price)}
                    </p>
                    {product.unit && (
                      <p className="text-xs text-muted">{product.unit}</p>
                    )}
                    <button
                      onClick={() => addItem(product)}
                      disabled={product.stock_status === 'out_of_stock'}
                      className={cn(
                        'mt-2 w-full py-2 rounded-lg text-sm font-medium transition-all',
                        getCartQty(product.id) > 0
                          ? 'bg-success/20 text-success'
                          : 'bg-primary hover:bg-primary-hover text-white',
                        product.stock_status === 'out_of_stock' && 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      {getCartQty(product.id) > 0
                        ? `In Cart (${getCartQty(product.id)})`
                        : 'Add to Cart'}
                    </button>
                  </div>
                </motion.div>
              ))}
        </div>
      </section>
    </div>
  );
}
