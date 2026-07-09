'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Award, DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#FF6B35', '#22C55E', '#FBBF24', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('today');

  useEffect(() => {
    adminApi.dashboard().then(setDashboard).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const orderStatusData = dashboard?.orders_by_status
    ? Object.entries(dashboard.orders_by_status).map(([name, value]) => ({ name, value }))
    : [];

  const atRiskData = (dashboard?.at_risk_items || []).slice(0, 5).map((item: any) => ({
    name: item.products?.name || 'Unknown',
    demand: item.predicted_demand_48h || 0,
    stock: 0,
  }));

  const revenueChartData = [
    { hour: '6AM', today: 0, yesterday: 0 },
    { hour: '9AM', today: dashboard?.revenue_today ? dashboard.revenue_today * 0.3 : 0, yesterday: 1200 },
    { hour: '12PM', today: dashboard?.revenue_today ? dashboard.revenue_today * 0.5 : 0, yesterday: 2500 },
    { hour: '3PM', today: dashboard?.revenue_today ? dashboard.revenue_today * 0.7 : 0, yesterday: 3800 },
    { hour: '6PM', today: dashboard?.revenue_today ? dashboard.revenue_today * 0.9 : 0, yesterday: 5200 },
    { hour: '9PM', today: dashboard?.revenue_today || 0, yesterday: 6000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Analytics</h1>
        <div className="flex gap-1 glass-card p-1 rounded-lg">
          {(['today', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-primary text-white' : 'text-muted hover:text-white'}`}
            >
              {p === 'today' ? 'Today' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-xl h-48"><div className="h-full skeleton rounded" /></div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-primary" />
              <h3 className="font-heading font-semibold">Revenue Trend</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-primary">{formatPrice(dashboard?.revenue_today || 0)}</p>
            <p className="text-xs text-muted mt-1">Today vs Yesterday</p>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                  <XAxis dataKey="hour" stroke="#6B7280" fontSize={10} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A2332', border: '1px solid #2D3748', borderRadius: '8px', color: '#F9FAFB' }} />
                  <Line type="monotone" dataKey="today" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35' }} />
                  <Line type="monotone" dataKey="yesterday" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#6B7280' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-primary" />
              <h3 className="font-heading font-semibold">Orders by Status</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-warning">{dashboard?.total_orders_today || 0}</p>
            <p className="text-xs text-muted mt-1">Total orders today</p>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={9} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A2332', border: '1px solid #2D3748', borderRadius: '8px', color: '#F9FAFB' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {orderStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-primary" />
              <h3 className="font-heading font-semibold">At-Risk Products (Top 5)</h3>
            </div>
            {atRiskData.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted text-sm">No at-risk items</div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={atRiskData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                    <XAxis type="number" stroke="#6B7280" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={9} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A2332', border: '1px solid #2D3748', borderRadius: '8px', color: '#F9FAFB' }} />
                    <Bar dataKey="demand" fill="#EF4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-primary" />
              <h3 className="font-heading font-semibold">Quick Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-navy-light/50">
                <span className="flex items-center gap-2 text-sm"><DollarSign size={16} className="text-primary" /> Revenue Today</span>
                <span className="font-mono font-bold text-primary">{formatPrice(dashboard?.revenue_today || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-navy-light/50">
                <span className="flex items-center gap-2 text-sm"><ShoppingBag size={16} className="text-warning" /> Orders Today</span>
                <span className="font-mono font-bold text-warning">{dashboard?.total_orders_today || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-navy-light/50">
                <span className="flex items-center gap-2 text-sm"><Users size={16} className="text-success" /> Active Riders</span>
                <span className="font-mono font-bold text-success">{dashboard?.active_riders || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-navy-light/50">
                <span className="flex items-center gap-2 text-sm"><Package size={16} className="text-danger" /> Critical Items</span>
                <span className="font-mono font-bold text-danger">{dashboard?.critical_items || 0}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
