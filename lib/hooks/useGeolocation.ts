'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number | null;
  error: string | null;
  loading: boolean;
  permission: PermissionState | 'prompt';
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  watch?: boolean;
}

const DEFAULT_OPTIONS: UseGeolocationOptions = {
  enableHighAccuracy: true,
  maximumAge: 5000,
  timeout: 10000,
  watch: false,
};

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    speed: null,
    heading: null,
    timestamp: null,
    error: null,
    loading: true,
    permission: 'prompt',
  });
  const watchIdRef = useRef<number | null>(null);

  const onSuccess = useCallback((pos: GeolocationPosition) => {
    setState({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      timestamp: pos.timestamp,
      error: null,
      loading: false,
      permission: 'granted',
    });
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error: err.message,
      loading: false,
      permission: err.code === err.PERMISSION_DENIED ? 'denied' : prev.permission,
    }));
  }, []);

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((prev) => ({ ...prev, error: 'Geolocation not available', loading: false }));
      return;
    }

    if (opts.watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: opts.enableHighAccuracy,
        maximumAge: opts.maximumAge,
        timeout: opts.timeout,
      });
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: opts.enableHighAccuracy,
        maximumAge: opts.maximumAge,
        timeout: opts.timeout,
      });
    }
  }, [opts.watch, opts.enableHighAccuracy, opts.maximumAge, opts.timeout, onSuccess, onError]);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    start();
  }, [start]);

  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState((prev) => ({ ...prev, permission: result.state }));
        result.addEventListener('change', () => {
          setState((prev) => ({ ...prev, permission: result.state }));
        });
      });
    }
  }, []);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  return { ...state, start, stop, refresh };
}
