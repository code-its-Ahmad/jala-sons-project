'use client';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  category: string;
  importance: number;
  address?: Record<string, string>;
}

interface ORSGeoJSON {
  type: string;
  coordinates: number[][];
}

interface ORSDirectionResponse {
  geojson: ORSGeoJSON;
  distance_meters: number;
  duration_seconds: number;
}

interface GraphHopperInstruction {
  text: string;
  distance: number;
  time: number;
  sign: number;
  street_name: string;
}

interface GraphHopperRouteResponse {
  primary: {
    geojson: ORSGeoJSON;
    instructions: GraphHopperInstruction[];
    distance: number;
    time: number;
  };
  alternative: {
    geojson: ORSGeoJSON;
    distance: number;
    time: number;
  } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const ORS_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || '';
const GH_KEY = process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY || '';

export class MapsService {
  private static NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
  private static ORS_BASE = 'https://api.openrouteservice.org/v2';
  private static GH_BASE = 'https://graphhopper.com/api/1';

  static async searchPlaces(query: string, limit = 5): Promise<NominatimResult[]> {
    if (!query || query.length < 2) return [];
    const resp = await fetch(
      `${this.NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}&countrycodes=pk`,
      { headers: { 'User-Agent': 'JalalSons/1.0' } },
    );
    if (!resp.ok) return [];
    const data: NominatimResult[] = await resp.json();
    return data.map((r) => ({
      ...r,
      display_name: r.display_name?.replace(/, Pakistan$/, '') || r.display_name,
    }));
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const resp = await fetch(
        `${this.NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'User-Agent': 'JalalSons/1.0' } },
      );
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.display_name?.replace(/, Pakistan$/, '') || null;
    } catch {
      return null;
    }
  }

  static async searchPlacesViaProxy(query: string, limit = 5): Promise<NominatimResult[]> {
    try {
      const resp = await fetch(`${API_URL}/tracking/geocode?q=${encodeURIComponent(query)}&limit=${limit}`);
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.data || [];
    } catch {
      return this.searchPlaces(query, limit);
    }
  }

  static async reverseGeocodeViaProxy(lat: number, lng: number): Promise<string | null> {
    try {
      const resp = await fetch(`${API_URL}/tracking/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.display_name || null;
    } catch {
      return this.reverseGeocode(lat, lng);
    }
  }

  static async getORSRoute(
    origin: [number, number],
    dest: [number, number],
    profile: 'driving-car' | 'foot-walking' | 'cycling-regular' = 'driving-car',
  ): Promise<ORSDirectionResponse | null> {
    if (!ORS_KEY) return null;
    try {
      const resp = await fetch(`${this.ORS_BASE}/directions/${profile}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ORS_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [[origin[1], origin[0]], [dest[1], dest[0]]],
        }),
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      const route = data.routes?.[0];
      if (!route) return null;
      const geometry = route.geometry;
      if (geometry?.coordinates) {
        geometry.coordinates = geometry.coordinates.map(
          (c: number[]) => [c[1], c[0]],
        );
      }
      return {
        geojson: geometry,
        distance_meters: route.summary?.distance || 0,
        duration_seconds: route.summary?.duration || 0,
      };
    } catch {
      return null;
    }
  }

  static async getGraphHopperRoute(
    origin: [number, number],
    dest: [number, number],
    vehicle: 'car' | 'bike' | 'foot' = 'car',
  ): Promise<GraphHopperRouteResponse | null> {
    if (!GH_KEY) return null;
    try {
      const resp = await fetch(
        `${this.GH_BASE}/route?point=${origin[0]},${origin[1]}&point=${dest[0]},${dest[1]}` +
        `&vehicle=${vehicle}&instructions=true&alternative_route.max_paths=2&key=${GH_KEY}`,
      );
      if (!resp.ok) return null;
      const data = await resp.json();
      const paths = data.paths || [];
      if (!paths.length) return null;
      return {
        primary: {
          geojson: paths[0].points,
          instructions: paths[0].instructions || [],
          distance: paths[0].distance || 0,
          time: paths[0].time || 0,
        },
        alternative: paths.length > 1 ? {
          geojson: paths[1].points,
          distance: paths[1].distance || 0,
          time: paths[1].time || 0,
        } : null,
      };
    } catch {
      return null;
    }
  }

  static async getORSMatrix(
    origins: [number, number][],
    destinations: [number, number][],
  ): Promise<{ durations: number[][]; distances: number[][] } | null> {
    if (!ORS_KEY) return null;
    try {
      const locations = [...origins.map((o) => [o[1], o[0]]), ...destinations.map((d) => [d[1], d[0]])];
      const resp = await fetch(`${this.ORS_BASE}/matrix/driving-car`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ORS_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locations,
          sources: origins.map((_, i) => i),
          destinations: destinations.map((_, i) => i + origins.length),
          metrics: ['duration', 'distance'],
        }),
      });
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  }

  static async getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not available'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
        ...options,
      });
    });
  }

  static haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dlat = ((lat2 - lat1) * Math.PI) / 180;
    const dlng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dlat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dlng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  static isORSConfigured(): boolean {
    return !!ORS_KEY;
  }

  static isGraphHopperConfigured(): boolean {
    return !!GH_KEY;
  }
}
