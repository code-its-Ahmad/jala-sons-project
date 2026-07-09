'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, TrendingUp } from 'lucide-react';
import { inventoryApi } from '@/lib/api';
import { Prediction } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminInventoryPage() {
  const [tab, setTab] = useState<'overview' | 'predictions' | 'alerts'>('overview');
  const [inventory, setInventory] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<any>({ critical: [], low_stock: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [alertRes, predRes] = await Promise.all([
        inventoryApi.alerts(),
        inventoryApi.predictions(),
      ]);
      setAlerts(alertRes);
      setPredictions(predRes.data || []);
      setInventory(alertRes.low_stock || []);
    } catch {}
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Inventory Management</h1>

      <div className="flex gap-1 glass-card p-1 rounded-xl w-fit">
        {(['overview', 'predictions', 'alerts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
              tab === t ? 'bg-primary text-white' : 'text-muted hover:text-white',
            )}
          >
            {t}
            {t === 'alerts' && (alerts.critical?.length || 0) > 0 && (
              <span className="ml-1.5 w-5 h-5 bg-danger text-white text-[10px] rounded-full inline-flex items-center justify-center">
                {alerts.critical?.length || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-4 rounded-xl"><div className="h-12 skeleton rounded" /></div>
          ))}
        </div>
      ) : (
        <>
          {tab === 'overview' && (
            <div className="space-y-3">
              {inventory.length > 0 ? (
                inventory.map((item: any, i: number) => {
                  const reorderPoint = item.reorder_point || 10;
                  const criticalThreshold = Math.max(1, reorderPoint * 0.2);
                  const qty = item.quantity_available || 0;
                  const isCritical = qty <= criticalThreshold;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="glass-card p-4 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          isCritical ? 'bg-danger' : 'bg-warning',
                        )} />
                        <div>
                          <p className="text-sm font-medium">{item.products?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted">{item.unit || 'piece'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          'font-mono text-lg font-bold',
                          isCritical ? 'text-danger' : 'text-warning',
                        )}>
                          {qty}
                        </p>
                        <p className="text-xs text-muted">units left</p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-muted">All inventory levels are healthy</div>
              )}
            </div>
          )}

          {tab === 'predictions' && (
            <div className="space-y-3">
              {predictions.length > 0 ? (
                predictions.map((pred, i) => (
                  <motion.div
                    key={pred.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card p-4 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{(pred as any).products?.name || 'Unknown'}</p>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        (pred.confidence_score || 0) > 0.8 ? 'bg-success/20 text-success' :
                        (pred.confidence_score || 0) > 0.5 ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger',
                      )}>
                        {Math.round((pred.confidence_score || 0) * 100)}% confidence
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                      <div>
                        <p className="font-mono text-sm font-bold text-primary">{Math.round(pred.predicted_demand_24h)}</p>
                        <p className="text-muted">24h Demand</p>
                      </div>
                      <div>
                        <p className="font-mono text-sm font-bold text-warning">{Math.round(pred.predicted_demand_48h)}</p>
                        <p className="text-muted">48h Demand</p>
                      </div>
                      <div>
                        <p className="font-mono text-sm font-bold text-secondary-text">{Math.round(pred.predicted_demand_7d)}</p>
                        <p className="text-muted">7d Demand</p>
                      </div>
                    </div>
                    {pred.predicted_stockout_at && (
                      <p className="text-xs text-muted mt-2">
                        Predicted stockout: {new Date(pred.predicted_stockout_at).toLocaleString()}
                      </p>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 text-muted">
                  <TrendingUp size={32} className="mx-auto mb-2" />
                  <p>No predictions available</p>
                  <p className="text-xs mt-1">Run ML prediction to generate forecasts</p>
                </div>
              )}
            </div>
          )}

          {tab === 'alerts' && (
            <div className="space-y-6">
              {alerts.critical?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-danger mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} /> Critical ({alerts.critical.length})
                  </h3>
                  <div className="space-y-2">
                    {alerts.critical.map((item: any) => (
                      <div key={item.id} className="glass-card p-3 rounded-xl border-danger/30 flex items-center justify-between">
                        <span className="text-sm">{item.products?.name}</span>
                        <span className="font-mono text-danger font-bold">{item.quantity_available || 0} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {alerts.low_stock?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-warning mb-3">Low Stock ({alerts.low_stock.length})</h3>
                  <div className="space-y-2">
                    {alerts.low_stock.map((item: any) => (
                      <div key={item.id} className="glass-card p-3 rounded-xl border-warning/30 flex items-center justify-between">
                        <span className="text-sm">{item.products?.name}</span>
                        <span className="font-mono text-warning font-bold">{item.quantity_available || 0} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!alerts.critical?.length && !alerts.low_stock?.length) && (
                <div className="text-center py-10 text-muted">No alerts. All inventory is healthy.</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
