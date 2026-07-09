'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Bike, ShoppingBag, CheckCircle, Clock, Phone, Star,
  ChevronLeft, RefreshCw, MessageCircle, Truck,
} from 'lucide-react';
import { LeafletMap } from '@/components/shared/LeafletMap';
import { trackingApi, ordersApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Order, TrackingInfo } from '@/types';

const STATUS_STEPS = [
  'pending', 'confirmed', 'preparing', 'ready_for_pickup',
  'rider_assigned', 'out_for_delivery', 'delivered',
];

const STATUS_ICONS: Record<string, any> = {
  pending: Clock, confirmed: CheckCircle, preparing: ShoppingBag,
  ready_for_pickup: ShoppingBag, rider_assigned: Bike,
  out_for_delivery: Truck, delivered: CheckCircle,
};

export default function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ overall: 5, comment: '' });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadTracking, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  async function loadData() {
    try {
      const [orderRes, trackRes] = await Promise.all([
        ordersApi.get(orderId),
        trackingApi.get(orderId).catch(() => null),
      ]);
      setOrder(orderRes);
      setTracking(trackRes);
    } catch (err) {
      console.error('Failed to load tracking:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadTracking() {
    try {
      const trackRes = await trackingApi.get(orderId);
      setTracking(trackRes);
    } catch {}
  }

  async function submitReview() {
    try {
      await ordersApi.review({
        order_id: orderId,
        overall_rating: review.overall,
        comment: review.comment,
      });
      setShowReview(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-24 skeleton rounded" />
        <div className="h-64 skeleton rounded-2xl" />
        <div className="h-32 skeleton rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Order not found</p>
        <Link href="/orders" className="btn-primary mt-4 inline-block">My Orders</Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary">
          <ChevronLeft size={16} /> Orders
        </Link>
        <span className="text-sm text-muted font-mono">
          #{order.id.substring(0, 8).toUpperCase()}
        </span>
      </div>

      <div className="h-64 md:h-80 rounded-2xl overflow-hidden relative">
        <LeafletMap
          center={
            tracking?.rider_lat && tracking?.rider_lng
              ? [tracking.rider_lat, tracking.rider_lng]
              : [tracking?.delivery_lat || 31.5204, tracking?.delivery_lng || 74.3587]
          }
          zoom={15}
          height="100%"
          markers={[
            ...(tracking?.rider_lat ? [{
              position: [tracking.rider_lat, tracking.rider_lng] as [number, number],
              label: 'Rider',
              color: '#FF6B35',
              type: 'rider' as const,
            }] : []),
            ...(tracking?.delivery_lat ? [{
              position: [tracking.delivery_lat, tracking.delivery_lng] as [number, number],
              label: 'Delivery',
              color: '#22C55E',
              type: 'destination' as const,
            }] : []),
          ]}
          route={tracking?.route_geojson}
          className="w-full h-full"
        />
        {tracking?.estimated_eta && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center z-[1000]">
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-3">
              <Clock size={16} className="text-primary" />
              <span className="text-sm font-medium">
                ~{tracking.estimated_eta} min
                {tracking.distance_km ? ` \u00b7 ${tracking.distance_km.toFixed(1)} km` : ''}
              </span>
              <button onClick={loadTracking} className="p-1 hover:text-primary transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {order.rider_name && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-xl flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
            <Bike size={24} />
          </div>
          <div className="flex-1">
            <p className="font-medium">{order.rider_name}</p>
            <div className="flex items-center gap-3 text-xs text-muted mt-1">
              <span className="flex items-center gap-1"><Star size={12} className="text-warning" /> 4.5</span>
              {order.rider_phone && (
                <a href={`tel:${order.rider_phone}`} className="flex items-center gap-1 text-primary">
                  <Phone size={12} /> Call
                </a>
              )}
            </div>
          </div>
          <button className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
            <MessageCircle size={16} /> Chat
          </button>
        </motion.div>
      )}

      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-heading font-semibold mb-6">Order Status</h3>
        <div className="relative">
          {STATUS_STEPS.filter(s => s !== 'ready_for_pickup').map((status, i) => {
            const Icon = STATUS_ICONS[status];
            const isActive = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;

            return (
              <div key={status} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                {i < STATUS_STEPS.length - 2 && (
                  <div className={cn(
                    'absolute left-[15px] top-8 w-0.5 h-full -z-10',
                    isActive && i < currentStepIndex ? 'bg-primary' : 'bg-navy-border',
                  )} />
                )}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                  isActive ? 'bg-primary text-white' : 'bg-navy-border text-muted',
                  isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-navy',
                )}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 pt-1">
                  <p className={cn('text-sm font-medium', isActive ? 'text-white' : 'text-muted')}>
                    {status.replace(/_/g, ' ')}
                  </p>
                  {isCurrent && order.updated_at && (
                    <p className="text-xs text-muted mt-0.5">{new Date(order.updated_at).toLocaleTimeString()}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {order.status === 'delivered' && !showReview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <CheckCircle size={64} className="mx-auto text-success mb-4" />
          <h2 className="text-2xl font-heading font-bold mb-2">Delivered!</h2>
          <p className="text-muted mb-6">Your order has been delivered successfully</p>
          <button onClick={() => setShowReview(true)} className="btn-primary">
            Leave a Review
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowReview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-6 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading font-semibold text-lg mb-6">How was your experience?</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted mb-2">Overall Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReview({ ...review, overall: star })}
                        className="p-1"
                      >
                        <Star
                          size={24}
                          className={cn(
                            'transition-colors',
                            star <= review.overall ? 'text-warning fill-warning' : 'text-muted',
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  placeholder="Share your experience (optional)"
                  className="input-field w-full h-20 resize-none"
                />
                <button onClick={submitReview} className="btn-primary w-full">
                  Submit Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
