'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle, XCircle, Clock, Play, Pause, Users, AlertTriangle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { supabase, subscribeToChannel, unsubscribeChannel } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { AgentLog, Order } from '@/types';

export default function DispatcherPage() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [queue, setQueue] = useState<Order[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const channel = subscribeToChannel(
      'admin-agent-logs',
      'INSERT',
      'public',
      'agent_logs',
      undefined,
      (payload) => {
        setLogs((prev) => [payload.new as AgentLog, ...prev].slice(0, 100));
      },
    );
    return () => { unsubscribeChannel(channel); };
  }, []);

  async function loadData() {
    try {
      const [logRes, settingsRes] = await Promise.all([
        adminApi.agentLogs('dispatcher'),
        adminApi.settings(),
      ]);
      setLogs(logRes.data || []);
      const s = (settingsRes.data || []).find((x: any) => x.key === 'ai_dispatch_enabled');
      if (s) setAiEnabled(s.value === true);
    } catch {}
    setLoading(false);
  }

  async function toggleAI() {
    try {
      await adminApi.toggleDispatch(!aiEnabled);
      setAiEnabled(!aiEnabled);
    } catch {}
  }

  const successRate = logs.length > 0
    ? Math.round((logs.filter((l) => l.status === 'success').length / logs.length) * 100)
    : 0;

  const avgTime = logs.length > 0
    ? Math.round(logs.filter(l => l.duration_ms).reduce((a, l) => a + (l.duration_ms || 0), 0) / logs.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">AI Dispatcher</h1>
        <button onClick={loadData} className="btn-secondary text-sm">Refresh</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Success Rate', value: `${successRate}%`, icon: <CheckCircle size={18} />, color: successRate > 70 ? 'text-success' : 'text-warning' },
          { label: 'Avg Time', value: avgTime > 0 ? `${avgTime}ms` : 'N/A', icon: <Clock size={18} />, color: 'text-primary' },
          { label: 'Total Runs', value: logs.length.toString(), icon: <Activity size={18} />, color: 'text-primary' },
          { label: 'AI Dispatch', value: aiEnabled ? 'Active' : 'Paused', icon: aiEnabled ? <Play size={18} /> : <Pause size={18} />, color: aiEnabled ? 'text-success' : 'text-danger' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-xl">
            <div className={stat.color}>{stat.icon}</div>
            <p className="text-lg font-bold font-mono mt-1">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('w-3 h-3 rounded-full', aiEnabled ? 'bg-success' : 'bg-danger')} />
          <span className="text-sm font-medium">AI Auto-Dispatch</span>
        </div>
        <button
          onClick={toggleAI}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', aiEnabled ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success')}
        >
          {aiEnabled ? 'Pause AI' : 'Enable AI'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary" /> Live Agent Feed
          </h3>
          <div ref={feedRef} className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-card p-3 rounded-xl"><div className="h-12 skeleton rounded" /></div>
              ))
            ) : logs.length === 0 ? (
              <div className="text-center py-10 text-muted">
                <Activity size={32} className="mx-auto mb-2" />
                <p className="text-sm">No dispatcher activity yet</p>
              </div>
            ) : (
              <AnimatePresence>
                {logs.slice(0, 50).map((log, idx) => (
                  <motion.div
                    key={log.id || idx}
                    initial={{ opacity: 0, x: -10, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-card p-3 rounded-xl text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? <CheckCircle size={14} className="text-success flex-shrink-0" />
                        : log.status === 'partial' ? <Clock size={14} className="text-warning flex-shrink-0" />
                        : <XCircle size={14} className="text-danger flex-shrink-0" />}
                      <span className="flex-1 text-xs text-muted line-clamp-1">{log.trigger_event || 'Event'}</span>
                      <span className="text-[10px] text-muted font-mono">{log.duration_ms ? `${log.duration_ms}ms` : ''}</span>
                    </div>
                    <p className="text-[10px] text-muted mt-1 font-mono">{new Date(log.created_at).toLocaleString()}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" /> Pending Queue
          </h3>
          {queue.length === 0 ? (
            <div className="glass-card p-6 rounded-xl text-center text-muted">
              <Users size={32} className="mx-auto mb-2" />
              <p className="text-sm">No orders waiting for dispatch</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((order) => (
                <div key={order.id} className="glass-card p-3 rounded-xl text-sm">
                  <p className="font-mono text-xs">#{order.id.substring(0, 8)}</p>
                  <p className="text-xs text-muted mt-1">{order.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
