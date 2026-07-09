'use client';

import { useEffect, useRef, useCallback } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type TableName = 'orders' | 'inventory' | 'rider_locations' | 'notifications' | 'substitution_offers' | 'agent_logs' | 'riders' | 'tracking_points' | 'stores';

interface UseRealtimeSubscriptionOptions {
  table: TableName;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onPayload: (payload: RealtimePostgresChangesPayload<any>) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription({
  table,
  filter,
  event = '*',
  onPayload,
  enabled = true,
}: UseRealtimeSubscriptionOptions) {
  const callbackRef = useRef(onPayload);
  callbackRef.current = onPayload;

  const stableCallback = useCallback(
    (payload: RealtimePostgresChangesPayload<any>) => {
      callbackRef.current(payload);
    },
    [],
  );

  useEffect(() => {
    if (!enabled) return;

    const channelName = `${table}-${event}-${filter || 'all'}-${Date.now()}`;
    const channelConfig: Record<string, any> = {
      event: event as any,
      schema: 'public',
      table,
    };
    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig as any, stableCallback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, enabled, stableCallback]);
}
