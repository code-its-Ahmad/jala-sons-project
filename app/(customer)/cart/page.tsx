'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin, CreditCard, CheckCircle, LocateFixed, Navigation } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, cn } from '@/lib/utils';
import { ordersApi } from '@/lib/api';
import { MapsService } from '@/lib/maps';
import { LocationSearch } from '@/components/shared/LocationSearch';
import { LeafletMap } from '@/components/shared/LeafletMap';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment' | 'review' | 'processing'>('cart');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryLat, setDeliveryLat] = useState<number>(31.5204);
  const [deliveryLng, setDeliveryLng] = useState<number>(74.3587);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  if (items.length === 0 && checkoutStep === 'cart') {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <ShoppingBag size={64} className="mx-auto text-muted mb-4" />
        </motion.div>
        <h2 className="text-xl font-heading font-semibold mb-2">Your Cart is Empty</h2>
        <p className="text-muted mb-6">Looks like you haven't added anything yet</p>
        <Link href="/home" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const handleLocationSelect = (location: { lat: number; lng: number; display_name: string }) => {
    setDeliveryLat(location.lat);
    setDeliveryLng(location.lng);
    setDeliveryAddress(location.display_name);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setDeliveryLat(lat);
    setDeliveryLng(lng);
    const addr = await MapsService.reverseGeocodeViaProxy(lat, lng);
    if (addr) setDeliveryAddress(addr);
  };

  async function handlePlaceOrder() {
    setProcessing(true);
    setCheckoutStep('processing');
    try {
      const res = await ordersApi.create({
        store_id: items[0].product.store_id,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          unit_price: i.product.price,
        })),
        delivery_address: deliveryAddress || 'Default Address',
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        delivery_notes: deliveryNotes,
        payment_method: 'cod',
      });
      setOrderId(res.order_id);

      const checkoutRes = await ordersApi.checkout({ order_id: res.order_id });
      if (checkoutRes.status === 'confirmed') {
        clearCart();
        setCheckoutStep('cart');
      } else if (checkoutRes.status === 'SUBSTITUTION_REQUIRED') {
        setCheckoutStep('review');
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
      setCheckoutStep('review');
    } finally {
      setProcessing(false);
    }
  }

  const total = getTotal();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-8">
        {['cart', 'address', 'payment', 'review'].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all',
              checkoutStep === step ? 'bg-primary text-white' : 'bg-navy-border text-muted',
            )}>
              {i + 1}
            </div>
            <span className={cn('text-xs capitalize hidden sm:inline', checkoutStep === step ? 'text-primary' : 'text-muted')}>
              {step}
            </span>
            {i < 3 && <div className="w-8 h-px bg-navy-border" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-heading font-semibold">
            {checkoutStep === 'cart' ? `Shopping Cart (${items.length} items)` : 'Order Items'}
          </h2>
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="glass-card p-4 rounded-xl flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-xl bg-navy-border flex-shrink-0 relative overflow-hidden">
                  {item.product.image_url ? (
                    <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted"><ShoppingBag size={20} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.id}`} className="text-sm font-medium hover:text-primary line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="font-mono text-primary text-sm mt-1">{formatPrice(item.product.price)}</p>
                  {item.product.unit && <p className="text-xs text-muted">{item.product.unit}</p>}
                </div>
                {checkoutStep === 'cart' && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-navy-light rounded-lg border border-navy-border">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:text-primary">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:text-primary">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.product.id)} className="p-2 text-muted hover:text-danger transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                {checkoutStep !== 'cart' && (
                  <div className="text-right">
                    <p className="font-mono text-sm">x{item.quantity}</p>
                    <p className="font-mono text-primary font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6 rounded-xl sticky top-24">
            <h3 className="font-heading font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-secondary-text">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-mono">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-secondary-text">
                <span>Delivery Fee</span>
                <span className="font-mono text-success">Free</span>
              </div>
              <div className="border-t border-navy-border pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span className="font-mono text-primary text-lg font-bold">{formatPrice(total)}</span>
              </div>
            </div>

            {checkoutStep === 'address' && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted mb-2">
                  <MapPin size={16} /> Delivery Address
                </div>
                <LocationSearch
                  onSelect={handleLocationSelect}
                  placeholder="Search your delivery address..."
                  defaultValue={deliveryAddress}
                />
                <div className="h-40 rounded-xl overflow-hidden border border-navy-border">
                  <LeafletMap
                    center={[deliveryLat, deliveryLng]}
                    zoom={15}
                    height="100%"
                    interactive
                    showSearch={false}
                    showLocateButton={true}
                    onClick={handleMapClick}
                    markers={[{
                      position: [deliveryLat, deliveryLng],
                      label: 'Delivery',
                      color: '#22C55E',
                      type: 'destination',
                    }]}
                    className="w-full h-full"
                  />
                </div>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Delivery notes (optional)"
                  className="input-field w-full h-20 resize-none"
                />
              </div>
            )}

            {checkoutStep === 'payment' && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted mb-2">
                  <CreditCard size={16} /> Payment Method
                </div>
                <label className="flex items-center gap-3 glass-card p-3 rounded-xl cursor-pointer border border-primary/30">
                  <input type="radio" name="payment" defaultChecked className="accent-primary" />
                  <div>
                    <p className="text-sm font-medium">Cash on Delivery</p>
                    <p className="text-xs text-muted">Pay when you receive</p>
                  </div>
                </label>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {checkoutStep === 'cart' && (
                <button onClick={() => setCheckoutStep('address')} className="btn-primary w-full">
                  Proceed to Checkout
                </button>
              )}
              {checkoutStep === 'address' && (
                <button onClick={() => setCheckoutStep('payment')} className="btn-primary w-full">
                  Continue to Payment
                </button>
              )}
              {checkoutStep === 'payment' && (
                <button onClick={() => setCheckoutStep('review')} className="btn-primary w-full">
                  Review Order
                </button>
              )}
              {checkoutStep === 'review' && (
                <button
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>Place Order &mdash; {formatPrice(total)}</>
                  )}
                </button>
              )}
              {checkoutStep === 'processing' && (
                <div className="text-center py-4">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm text-muted">Processing your order...</p>
                </div>
              )}
              {checkoutStep !== 'cart' && (
                <button onClick={() => setCheckoutStep('cart')} className="btn-ghost w-full text-sm">
                  <ArrowLeft size={16} className="inline mr-1" /> Back to Cart
                </button>
              )}
            </div>

            {orderId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 text-center"
              >
                <CheckCircle size={48} className="mx-auto text-success mb-3" />
                <h3 className="font-heading font-semibold text-lg">Order Placed!</h3>
                <p className="text-sm text-muted mt-1">Order #{orderId.substring(0, 8).toUpperCase()}</p>
                <Link href={`/track/${orderId}`} className="btn-primary mt-4 inline-block">
                  Track Your Order
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
