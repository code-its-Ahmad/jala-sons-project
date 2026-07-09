'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Crosshair, LocateFixed, Route } from 'lucide-react';
import { MapsService } from '@/lib/maps';
import { LocationSearch } from './LocationSearch';
import { cn } from '@/lib/utils';

interface MapMarker {
  position: [number, number];
  label?: string;
  color?: string;
  type?: 'rider' | 'store' | 'destination' | 'user' | 'search';
}

interface RouteData {
  coordinates?: [number, number][];
  geojson?: any;
  distance_meters?: number;
  duration_seconds?: number;
  instructions?: { text: string; distance: number; time: number }[];
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  route?: any;
  height?: string;
  className?: string;
  interactive?: boolean;
  showSearch?: boolean;
  showLocateButton?: boolean;
  onClick?: (lat: number, lng: number) => void;
  onLocationSelect?: (location: { lat: number; lng: number; display_name: string }) => void;
  onRouteCalculated?: (route: RouteData | null) => void;
}

export function LeafletMap({
  center = [31.5204, 74.3587],
  zoom = 14,
  markers = [],
  route,
  height = '300px',
  className = '',
  interactive = true,
  showSearch = false,
  showLocateButton = true,
  onClick,
  onLocationSelect,
  onRouteCalculated,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const initMap = useCallback(async () => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    try {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: true,
        zoomSnap: 1,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      if (onClick && interactive) {
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          onClick(lat, lng);
          setSelectedCoords([lat, lng]);
        });
      }

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
      setMapReady(true);
    } catch {}
  }, []);

  useEffect(() => {
    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initMap]);

  const clearMarkers = useCallback(async () => {
    if (!mapInstanceRef.current) return;
    markersRef.current.forEach((m) => mapInstanceRef.current.removeLayer(m));
    markersRef.current = [];
  }, []);

  const clearPolylines = useCallback(async () => {
    if (!mapInstanceRef.current) return;
    polylinesRef.current.forEach((p) => mapInstanceRef.current.removeLayer(p));
    polylinesRef.current = [];
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;
    (async () => {
      const L = (await import('leaflet')).default;
      await clearMarkers();
      const allMarkers = [...markers];
      if (userLocation && !allMarkers.find((m) => m.type === 'user')) {
        allMarkers.push({
          position: userLocation,
          label: 'You',
          color: '#3B82F6',
          type: 'user',
        });
      }
      if (selectedCoords && !allMarkers.find((m) => m.type === 'search')) {
        allMarkers.push({
          position: selectedCoords,
          label: 'Selected',
          color: '#8B5CF6',
          type: 'search',
        });
      }
      allMarkers.forEach((m) => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: getMarkerHtml(m.color || getDefaultColor(m.type), m.type),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker(m.position, { icon }).addTo(mapInstanceRef.current).bindPopup(m.label || '');
        markersRef.current.push(marker);
      });
    })();
  }, [markers, userLocation, selectedCoords, clearMarkers]);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;
    (async () => {
      const L = (await import('leaflet')).default;
      await clearPolylines();
      if (route) {
        let coords: [number, number][] = [];
        const extractCoords = (obj: any): [number, number][] => {
          if (!obj) return [];
          if (obj.coordinates && Array.isArray(obj.coordinates[0])) {
            return obj.coordinates as [number, number][];
          }
          if (Array.isArray(obj) && obj.length > 0 && Array.isArray(obj[0])) {
            return obj as [number, number][];
          }
          return [];
        };
        if (route.geojson) {
          coords = extractCoords(route.geojson);
        } else if (route.coordinates) {
          coords = extractCoords(route);
        } else if (route.type === 'LineString' || route.type === 'MultiLineString') {
          coords = extractCoords(route);
        } else if (Array.isArray(route)) {
          coords = extractCoords(route);
        }
        if (coords.length > 0) {
          const polyline = L.polyline(coords, {
            color: '#FF6B35',
            weight: 3,
            opacity: 0.8,
          }).addTo(mapInstanceRef.current);
          polylinesRef.current.push(polyline);
          mapInstanceRef.current.fitBounds(polyline.getBounds().pad(0.1));
        }
      }
    })();
  }, [route, clearPolylines]);

  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom());
    }
  }, [center]);

  const handleLocate = useCallback(async () => {
    setIsLocating(true);
    try {
      const pos = await MapsService.getCurrentPosition();
      const { latitude, longitude } = pos.coords;
      setUserLocation([latitude, longitude]);
      mapInstanceRef.current?.setView([latitude, longitude], 15);
      onClick?.(latitude, longitude);
    } catch (err: any) {
      if (err.code === 1) {
        alert('Please enable location access in your browser settings');
      }
    } finally {
      setIsLocating(false);
    }
  }, [onClick]);

  const handleLocationSearch = useCallback(
    (location: { lat: number; lng: number; display_name: string }) => {
      setSelectedCoords([location.lat, location.lng]);
      mapInstanceRef.current?.setView([location.lat, location.lng], 15);
      onLocationSelect?.(location);
    },
    [onLocationSelect],
  );

  return (
    <div className={cn('relative rounded-xl overflow-hidden', className)} style={{ height, minHeight: height }}>
      <div ref={mapRef} className="w-full h-full" />

      {showSearch && (
        <div className="absolute top-3 left-3 right-12 z-[1000]">
          <LocationSearch onSelect={handleLocationSearch} placeholder="Search places..." />
        </div>
      )}

      {showLocateButton && mapReady && (
        <button
          onClick={handleLocate}
          disabled={isLocating}
          className="absolute bottom-3 right-3 z-[1000] w-10 h-10 glass-card rounded-full flex items-center justify-center hover:bg-navy-border transition-all disabled:opacity-50 border border-navy-border"
          title="My Location"
        >
          {isLocating ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <LocateFixed size={18} className="text-primary" />
          )}
        </button>
      )}

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-navy-light z-10">
          <div className="text-center text-muted">
            <MapPin size={32} className="mx-auto mb-2" />
            <p className="text-sm">Loading Map...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getDefaultColor(type?: string): string {
  switch (type) {
    case 'rider': return '#FF6B35';
    case 'store': return '#22C55E';
    case 'destination': return '#22C55E';
    case 'user': return '#3B82F6';
    case 'search': return '#8B5CF6';
    default: return '#FF6B35';
  }
}

function getMarkerHtml(color: string, type?: string): string {
  const icon =
    type === 'rider' ? '\u{1F6CD}'
    : type === 'store' ? '\u{1F3EA}'
    : type === 'user' ? '\u{1F464}'
    : type === 'search' ? '\u{1F4CD}'
    : '\u{1F4CD}';
  return `<div style="
    width: 32px; height: 32px;
    background: ${color};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    border: 2px solid white;
  ">${icon}</div>`;
}
