'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Search, MapPin, Navigation, Loader2, X } from 'lucide-react';
import { MapsService } from '@/lib/maps';
import { cn } from '@/lib/utils';

interface LocationResult {
  place_id: number;
  display_name: string;
  lat: number;
  lng: number;
  type: string;
}

interface LocationSearchProps {
  onSelect: (location: { lat: number; lng: number; display_name: string }) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  showCurrentLocation?: boolean;
}

export function LocationSearch({
  onSelect,
  placeholder = 'Search for a place...',
  className,
  defaultValue,
  showCurrentLocation = true,
}: LocationSearchProps) {
  const [query, setQuery] = useState(defaultValue || '');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(defaultValue || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await MapsService.searchPlacesViaProxy(q);
      setResults(
        data.map((r) => ({
          place_id: r.place_id,
          display_name: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          type: r.type,
        })),
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      setSelectedLabel('');
      setShowResults(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(val), 300);
    },
    [doSearch],
  );

  const handleSelect = useCallback(
    (result: LocationResult) => {
      setSelectedLabel(result.display_name);
      setQuery(result.display_name);
      setShowResults(false);
      onSelect({ lat: result.lat, lng: result.lng, display_name: result.display_name });
    },
    [onSelect],
  );

  const handleGetCurrentLocation = useCallback(async () => {
    try {
      const pos = await MapsService.getCurrentPosition();
      const { latitude, longitude } = pos.coords;
      const addr = await MapsService.reverseGeocodeViaProxy(latitude, longitude);
      const label = addr || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      setSelectedLabel(label);
      setQuery(label);
      setShowResults(false);
      onSelect({ lat: latitude, lng: longitude, display_name: label });
    } catch (err: any) {
      if (err.code === 1) {
        setQuery('Location permission denied');
      }
    }
  }, [onSelect]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSelectedLabel('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setShowResults(true); }}
          placeholder={placeholder}
          className="input-field w-full pl-9 pr-16 py-2.5 text-sm"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 size={14} className="animate-spin text-muted" />}
          {query && (
            <button onClick={handleClear} className="p-1 text-muted hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-[9999] top-full mt-1 w-full glass-card rounded-xl overflow-hidden shadow-xl border border-navy-border max-h-64 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-navy-border/50 transition-colors border-b border-navy-border/30 last:border-0"
            >
              <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{result.display_name}</p>
                <p className="text-[10px] text-muted mt-0.5 capitalize">{result.type.replace(/_/g, ' ')}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-[9999] top-full mt-1 w-full glass-card rounded-xl p-4 text-center shadow-xl border border-navy-border">
          <p className="text-sm text-muted">No results found</p>
        </div>
      )}

      {showCurrentLocation && !selectedLabel && (
        <button
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-navy-border/30 transition-colors rounded-lg w-full mt-1"
        >
          <Navigation size={14} />
          Use my current location
        </button>
      )}
    </div>
  );
}
