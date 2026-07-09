'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Minus, Plus, ShoppingBag, Star, ChevronRight } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, cn, getStockLabel, getStockColor } from '@/lib/utils';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'reviews'>('overview');
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      const [prodRes, simRes] = await Promise.all([
        productsApi.get(id),
        productsApi.similar(id, 6),
      ]);
      setProduct(prodRes);
      setSimilar(simRes.data || []);
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-24 skeleton rounded" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 skeleton rounded w-3/4" />
            <div className="h-10 skeleton rounded w-1/3" />
            <div className="h-20 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Product not found</p>
        <Link href="/home" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href="/home" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors">
        <ChevronLeft size={16} /> Back to Store
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-2xl overflow-hidden bg-navy-border"
        >
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <ShoppingBag size={64} />
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted">Category</span>
              <ChevronRight size={12} className="text-muted" />
              <span className="text-xs text-secondary-text">Product</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-mono text-3xl text-primary font-bold">
              {formatPrice(product.price)}
            </span>
            {product.unit && (
              <span className="text-muted text-sm">/ {product.unit}</span>
            )}
          </div>

          {/* Stock Status */}
          {product.stock_status && (
            <div className={cn('flex items-center gap-2 text-sm font-medium', getStockColor(product.stock_status))}>
              <span className={cn(
                'w-2 h-2 rounded-full',
                product.stock_status === 'in_stock' && 'bg-success',
                product.stock_status === 'low' && 'bg-warning',
                product.stock_status === 'critical' && 'bg-danger',
                product.stock_status === 'out_of_stock' && 'bg-muted',
              )} />
              {getStockLabel(product.stock_status)}
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="badge-orange">{tag}</span>
              ))}
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-navy-light rounded-xl border border-navy-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:text-primary transition-colors">
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-mono font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-3 hover:text-primary transition-colors">
                <Plus size={18} />
              </button>
            </div>
            <button
              onClick={() => addItem(product, qty)}
              disabled={product.stock_status === 'out_of_stock'}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              Add to Cart — {formatPrice(product.price * qty)}
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-secondary-text leading-relaxed">{product.description}</p>
          )}
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mt-12 glass-card rounded-2xl overflow-hidden">
        <div className="flex border-b border-navy-border">
          {(['overview', 'nutrition', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-3 text-sm font-medium capitalize transition-colors relative',
                activeTab === tab ? 'text-primary' : 'text-muted hover:text-secondary-text',
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'overview' && (
            <p className="text-secondary-text leading-relaxed">{product.description || 'No description available.'}</p>
          )}
          {activeTab === 'nutrition' && product.nutritional_info && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(product.nutritional_info).map(([key, val]) => (
                <div key={key} className="glass-card p-4 text-center rounded-xl">
                  <p className="text-2xl font-mono font-bold text-primary">{val as string}</p>
                  <p className="text-xs text-muted capitalize">{key}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'reviews' && (
            <p className="text-muted text-center py-8">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similar.length > 0 && (
        <section>
          <h2 className="text-lg font-heading font-semibold mb-4">You Might Also Like</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {similar.map((p, i) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="flex-shrink-0 w-40 glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-all"
              >
                <div className="aspect-square bg-navy-border relative">
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs line-clamp-2 mb-1">{p.name}</p>
                  <p className="font-mono text-sm text-primary font-bold">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
