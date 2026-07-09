'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { TrackingInfo, RiderLocation } from '@/types';
import { trackingApi } from '@/lib/api';

interface UseOrderTrackingResult {
  tracking: TrackingInfo | null;
  riderLocations: RiderLocation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrderTracking(orderId: string | null): UseOrderTrackingResult {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [riderLocations, setRiderLocations] = useState<RiderLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await trackingApi.get(orderId);
      setTracking(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tracking');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const fetchRouteHistory = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await trackingApi.history(orderId);
      setRiderLocations(data?.rider_locations || []);
    } catch {
      // non-critical
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  useEffect(() => {
    if (tracking?.rider_id) {
      fetchRouteHistory();
    }
  }, [tracking?.rider_id, fetchRouteHistory]);

  useRealtimeSubscription({
    table: 'orders',
    filter: `id=eq.${orderId}`,
    event: 'UPDATE',
    onPayload: (payload) => {
      if (payload.new) {
        setTracking((prev) =>
          prev ? { ...prev, ...(payload.new as any) } : prev,
        );
      }
    },
    enabled: !!orderId,
  });

  useRealtimeSubscription({
    table: 'rider_locations',
    filter: tracking?.rider_id ? `rider_id=eq.${tracking.rider_id}` : undefined,
    event: 'INSERT',
    onPayload: (payload) => {
      const loc = payload.new as RiderLocation;
      if (loc) {
        setRiderLocations((prev) => [loc, ...prev].slice(0, 200));
        setTracking((prev) =>
          prev
            ? {
                ...prev,
                rider_lat: loc.latitude,
                rider_lng: loc.longitude,
              }
            : prev,
        );
      }
    },
    enabled: !!tracking?.rider_id,
  });

  return { tracking, riderLocations, loading, error, refetch: fetchTracking };
}
