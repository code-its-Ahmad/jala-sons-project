'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    speed: null,
    heading: null,
    error: null,
    loading: true,
  });

  const watchIdRef = useRef<number | null>(null);

  const onSuccess = useCallback((pos: GeolocationPosition) => {
    setState({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      error: null,
      loading: false,
    });
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error: err.message,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation not supported',
        loading: false,
      }));
      return;
    }

    const geoOptions: PositionOptions = { enableHighAccuracy, timeout, maximumAge };

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, geoOptions);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enableHighAccuracy, timeout, maximumAge, watch, onSuccess, onError]);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) return;
    setState((prev) => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [enableHighAccuracy, timeout, maximumAge, onSuccess, onError]);

  return { ...state, refresh };
}
