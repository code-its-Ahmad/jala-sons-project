'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bike, Clock, DollarSign, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { riderApi } from '@/lib/api';
import { useRiderStore } from '@/store/riderStore';
import { formatPrice, formatDate, getStatusBadgeClass, getAddressDisplay } from '@/lib/utils';
import { Order } from '@/types';

const PAST_STATUSES = ['delivered', 'cancelled'];

export default function RiderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, isOnline } = useRiderStore();
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await riderApi.orders();
      setOrders(res.data || []);
    } catch {}
    setLoading(false);
  }

  const activeOrder = orders.find((o) => !PAST_STATUSES.includes(o.status));
  const pastOrders = orders.filter((o) => PAST_STATUSES.includes(o.status));
  const earningsToday = pastOrders
    .filter((o) => o.status === 'delivered' && o.updated_at && new Date(o.updated_at).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <DollarSign size={20} />, label: 'Earnings', value: formatPrice(earningsToday), color: 'text-success' },
          { icon: <Clock size={20} />, label: 'Deliveries', value: pastOrders.filter(o => o.status === 'delivered').length.toString(), color: 'text-primary' },
          { icon: <CheckCircle size={20} />, label: 'Rating', value: `${profile?.avg_delivery_rating || 0}`, color: 'text-warning' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 rounded-xl text-center"
          >
            <div className={`${stat.color} mb-1`}>{stat.icon}</div>
            <p className="text-lg font-bold font-mono">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {activeOrder ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 rounded-xl border-primary/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold">Current Order</h2>
            <span className={getStatusBadgeClass(activeOrder.status)}>
              {activeOrder.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted">
              <MapPin size={14} />
              <span>{getAddressDisplay(activeOrder.delivery_address)}</span>
            </div>
            <p className="font-mono text-primary font-bold">{formatPrice(activeOrder.total_amount)}</p>
            <p className="text-xs text-muted">{formatDate(activeOrder.created_at)}</p>
          </div>
          <div className="flex gap-3 mt-4">
            {activeOrder.status === 'rider_assigned' && (
              <>
                <button
                  onClick={() => router.push(`/rider/navigate/${activeOrder.id}`)}
                  className="btn-primary flex-1 text-sm"
                >
                  Navigate to Store
                </button>
                <button
                  onClick={async () => { await riderApi.reject(activeOrder.id); loadOrders(); }}
                  className="btn-secondary flex items-center gap-2 text-sm text-danger"
                >
                  <XCircle size={16} /> Reject
                </button>
              </>
            )}
            {activeOrder.status === 'out_for_delivery' && (
              <button
                onClick={async () => { await riderApi.deliver(activeOrder.id); loadOrders(); }}
                className="btn-primary flex-1 text-sm"
              >
                Mark Delivered
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="glass-card p-8 rounded-xl text-center">
          <Bike size={48} className="mx-auto text-muted mb-3" />
          <h2 className="font-heading font-semibold text-lg mb-1">No Active Orders</h2>
          <p className="text-sm text-muted">
            {isOnline ? 'Waiting for new assignments...' : 'Go online to receive orders'}
          </p>
        </div>
      )}

      {pastOrders.length > 0 && (
        <section>
          <h2 className="font-heading font-semibold mb-4">Recent Deliveries</h2>
          <div className="space-y-2">
            {pastOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="glass-card p-3 rounded-xl flex items-center justify-between text-sm">
                <div>
                  <span className="font-mono text-xs text-muted">#{order.id.substring(0, 8).toUpperCase()}</span>
                  <span className={`ml-2 text-xs ${getStatusBadgeClass(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
                </div>
                <span className="font-mono text-primary">{formatPrice(order.total_amount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
