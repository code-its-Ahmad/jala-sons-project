'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminSetting } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState<Record<string, any>>({});

  useEffect(() => {
    adminApi.settings().then((res) => setSettings(res.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function handleChange(key: string, value: any) {
    setChanged((prev) => ({ ...prev, [key]: value }));
  }

  async function saveAll() {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(changed)) {
        await adminApi.updateSetting(key, value);
      }
      setChanged({});
    } catch {}
    setSaving(false);
  }

  const groups = [
    { label: 'Inventory Settings', keys: ['stock_low_threshold', 'stock_critical_threshold', 'cart_reservation_minutes'] },
    { label: 'AI Agent Settings', keys: ['vector_similarity_threshold', 'max_substitution_alternatives', 'substitution_discount_max', 'gemini_recommendation_tone'] },
    { label: 'Dispatch Settings', keys: ['dispatch_timeout_seconds', 'dispatch_radius_km', 'dispatch_radius_fallback_km', 'ai_dispatch_enabled'] },
    { label: 'ML Model Settings', keys: ['ml_retrain_interval_hours'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Settings</h1>
        {Object.keys(changed).length > 0 && (
          <button onClick={saveAll} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
            <Save size={16} />
            {saving ? 'Saving...' : `Save Changes (${Object.keys(changed).length})`}
          </button>
        )}
      </div>

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-xl"><div className="h-32 skeleton rounded" /></div>
        ))
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const groupSettings = settings.filter((s) => group.keys.includes(s.key));
            if (groupSettings.length === 0) return null;

            return (
              <motion.div key={group.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-xl">
                <h3 className="font-heading font-semibold mb-4">{group.label}</h3>
                <div className="space-y-4">
                  {groupSettings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{setting.label}</p>
                        {setting.description && (
                          <p className="text-xs text-muted">{setting.description}</p>
                        )}
                      </div>
                      <div className="w-32">
                        {setting.data_type === 'boolean' ? (
                          <button
                            onClick={() => handleChange(setting.key, !(changed[setting.key] ?? setting.value))}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                              (changed[setting.key] ?? setting.value) ? 'bg-success/20 text-success' : 'bg-muted/20 text-muted',
                            )}
                          >
                            {(changed[setting.key] ?? setting.value) ? 'Enabled' : 'Disabled'}
                          </button>
                        ) : setting.data_type === 'string' ? (
                          <select
                            value={changed[setting.key] ?? setting.value}
                            onChange={(e) => handleChange(setting.key, e.target.value)}
                            className="input-field w-full py-1.5 text-xs"
                          >
                            {['friendly', 'formal', 'casual'].map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            value={changed[setting.key] ?? setting.value}
                            onChange={(e) => handleChange(setting.key, parseFloat(e.target.value))}
                            className="input-field w-full py-1.5 text-xs text-center"
                            step={setting.data_type === 'float' ? 0.1 : 1}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
