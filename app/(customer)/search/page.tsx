'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, cn, debounce } from '@/lib/utils';
import { Product, Category } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    categoryId: '',
    inStockOnly: false,
    sort: 'relevance',
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  useEffect(() => {
    productsApi.categories().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const doSearch = useCallback(
    debounce(async (q: string, f: typeof filters, p: number) => {
      setLoading(true);
      try {
        const params: Record<string, any> = { page: p, limit: 20 };
        if (q) params.search = q;
        if (f.minPrice) params.min_price = parseFloat(f.minPrice);
        if (f.maxPrice) params.max_price = parseFloat(f.maxPrice);
        if (f.categoryId) params.category_id = f.categoryId;
        if (f.sort === 'price_low') params.sort = 'price';
        else if (f.sort === 'price_high') params.sort = 'price';
        else params.sort = 'created_at';

        const res = await productsApi.list(params);
        setProducts(res.data || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    doSearch(query, filters, page);
  }, [query, filters, page]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="input-field w-full pl-12 pr-20 py-3"
          autoFocus
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('p-2 rounded-lg transition-colors', showFilters ? 'bg-primary/20 text-primary' : 'hover:bg-navy-border text-muted')}
          >
            <SlidersHorizontal size={18} />
          </button>
          {query && (
            <button onClick={() => { setQuery(''); setPage(1); }} className="p-2 hover:text-white transition-colors text-muted">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={false}
        animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="glass-card p-4 rounded-xl space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted block mb-1">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="0"
                className="input-field w-full py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="5000"
                className="input-field w-full py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Category</label>
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                className="input-field w-full py-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="input-field w-full py-2 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
              className="rounded border-navy-border bg-navy-light"
            />
            In Stock Only
          </label>
        </div>
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <div className="aspect-square skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="h-5 skeleton rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="mx-auto text-muted mb-4" />
          <p className="text-muted text-lg">No products found</p>
          <p className="text-sm text-muted mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">{total} products found</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card rounded-xl overflow-hidden group hover:border-primary/30 transition-all"
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div className="aspect-square bg-navy-border relative">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted"><ShoppingBag size={32} /></div>
                    )}
                    {product.stock_status && product.stock_status !== 'in_stock' && (
                      <span className={cn('absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium',
                        product.stock_status === 'low' && 'bg-warning/20 text-warning',
                        product.stock_status === 'critical' && 'bg-danger/20 text-danger',
                        product.stock_status === 'out_of_stock' && 'bg-muted/20 text-muted',
                      )}>
                        {product.stock_status === 'critical' ? 'Running Out!' : `${product.available_quantity || 0} left`}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-sm font-medium line-clamp-2 mb-1 hover:text-primary">{product.name}</h3>
                  </Link>
                  <p className="font-mono text-primary font-bold text-lg">{formatPrice(product.price)}</p>
                  <button
                    onClick={() => addItem(product)}
                    disabled={product.stock_status === 'out_of_stock'}
                    className="mt-2 w-full py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-hover text-white transition-all disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).slice(0, 5).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn('w-10 h-10 rounded-lg text-sm font-medium transition-all',
                    page === p ? 'bg-primary text-white' : 'glass-card hover:border-primary/30'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
