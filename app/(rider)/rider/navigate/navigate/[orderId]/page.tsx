'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Navigation as NavIcon, ArrowLeft, CheckCircle, Store, Home } from 'lucide-react';
import { LeafletMap } from '@/components/shared/LeafletMap';
import { ordersApi, trackingApi, riderApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

export default function NavigationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'to_store' | 'to_customer' | 'arrived'>('to_store');
  const [riderLat, setRiderLat] = useState<number>(31.5204);
  const [riderLng, setRiderLng] = useState<number>(74.3587);
  const wsRef = useRef<WebSocket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const reconnTimerRef = useRef<any>(null);

  useEffect(() => {
    loadData();
    initGps();
    return () => {
      stopGps();
      if (wsRef.current) wsRef.current.close();
      if (reconnTimerRef.current) clearTimeout(reconnTimerRef.current);
    };
  }, [orderId]);

  async function loadData() {
    try {
      const [orderRes, routeRes] = await Promise.all([
        ordersApi.get(orderId),
        trackingApi.route(orderId).catch(() => null),
      ]);
      setOrder(orderRes);
      setRoute(routeRes);
      if (orderRes.status === 'out_for_delivery' || orderRes.status === 'delivered') {
        setPhase('to_customer');
      }
    } catch {}
    setLoading(false);
  }

  async function connectWs() {
    try {
      const token = (await import('@/lib/supabase')).supabase.auth.getSession().then(r => r.data?.session?.access_token);
      const t = await token;
      if (!t) return;
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/rider/location/${orderId}?token=${t}`;
      if (wsRef.current) wsRef.current.close();
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => {};
      wsRef.current.onclose = () => {
        reconnTimerRef.current = setTimeout(connectWs, 3000);
      };
      wsRef.current.onerror = () => {
        wsRef.current?.close();
      };
    } catch {}
  }

  function initGps() {
    if (!('geolocation' in navigator)) return;
    connectWs();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        setRiderLat(latitude);
        setRiderLng(longitude);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            lat: latitude,
            lng: longitude,
            speed: speed || 0,
            heading: pos.coords.heading || 0,
          }));
        }
      },
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
  }

  function stopGps() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  }

  async function handleArrived() {
    try {
      await riderApi.pickup(orderId);
      setPhase('to_customer');
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  }

  async function handleDelivered() {
    try {
      await riderApi.deliver(orderId);
      router.push('/rider');
    } catch (err: any) {
      alert(err.message || 'Failed to mark delivered');
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Order not found</p>
        <button onClick={() => router.push('/rider')} className="btn-primary mt-4">Back</button>
      </div>
    );
  }

  const storeCoords: [number, number] = [31.5204, 74.3587];
  const deliveryCoords: [number, number] = [
    order.delivery_lat || 31.5204,
    order.delivery_lng || 74.3587,
  ];
  const destinationCoords = phase === 'to_store' ? storeCoords : deliveryCoords;

  return (
    <div className="relative h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between p-4 bg-navy border-b border-navy-border z-10">
        <button onClick={() => router.push('/rider')} className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-xs text-muted">
            {phase === 'to_store' ? 'Heading to Store' : phase === 'to_customer' ? 'Delivering to Customer' : 'Arrived'}
          </p>
          <p className="font-mono text-xs font-medium">
            #{order.id.substring(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative">
        <LeafletMap
          center={riderLat !== 31.5204 ? [riderLat, riderLng] : destinationCoords}
          zoom={15}
          height="100%"
          markers={[
            {
              position: [riderLat, riderLng] as [number, number],
              label: 'You',
              color: '#FF6B35',
              type: 'rider' as const,
            },
            {
              position: destinationCoords,
              label: phase === 'to_store' ? 'Store' : 'Delivery',
              color: '#22C55E',
              type: 'destination' as const,
            },
          ]}
          route={route?.route?.geojson || route?.turn_by_turn?.primary?.geojson}
          className="w-full h-full"
        />

        {route?.turn_by_turn?.primary?.instructions && (
          <div className="absolute top-4 left-4 right-4 glass-card p-3 rounded-xl z-[1000]">
            <div className="flex items-center gap-2 mb-1">
              <NavIcon size={16} className="text-primary flex-shrink-0" />
              <span className="text-xs font-medium truncate">
                {route.turn_by_turn.primary.instructions[0]?.text || 'Follow route'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted">
              <span>{Math.round(route.turn_by_turn.primary.distance / 1000)} km</span>
              <span>~{Math.round(route.turn_by_turn.primary.time / 60000)} min</span>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 glass-card px-3 py-1.5 rounded-full text-xs font-mono z-[1000]">
          {(navigator as any)?.geolocation ? 'GPS Active' : 'GPS Off'}
        </div>
      </div>

      <div className="p-4 bg-navy border-t border-navy-border">
        {phase === 'to_store' && (
          <button
            onClick={handleArrived}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 rounded-xl"
          >
            <Store size={20} /> I've Arrived at Store
          </button>
        )}
        {phase === 'to_customer' && (
          <button
            onClick={handleDelivered}
            className="w-full py-4 text-lg flex items-center justify-center gap-3 rounded-xl bg-success hover:bg-success/80 text-white font-medium transition-colors"
          >
            <CheckCircle size={20} /> Order Delivered
          </button>
        )}
      </div>
    </div>
  );
}
