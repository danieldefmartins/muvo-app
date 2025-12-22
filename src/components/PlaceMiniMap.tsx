import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PlaceMiniMapProps {
  latitude: number;
  longitude: number;
  name: string;
  mapboxToken: string;
  className?: string;
}

export function PlaceMiniMap({ latitude, longitude, name, mapboxToken, className }: PlaceMiniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [longitude, latitude],
      zoom: 12,
      interactive: false, // Static map for preview
    });

    // Add marker
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-primary-foreground">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `;

    new mapboxgl.Marker({ element: el })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, mapboxToken]);

  const handleClick = () => {
    // Navigate to map view centered on this place
    navigate(`/map?lat=${latitude}&lng=${longitude}&zoom=14`);
  };

  return (
    <div
      className={cn(
        'relative w-full h-40 rounded-lg overflow-hidden cursor-pointer group',
        className
      )}
      onClick={handleClick}
    >
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <span className="text-xs font-medium flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            View on map
          </span>
        </div>
      </div>
    </div>
  );
}

// Fallback when no token available
export function PlaceMiniMapPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full h-40 rounded-lg overflow-hidden bg-muted flex items-center justify-center',
        className
      )}
    >
      <div className="text-center">
        <MapPin className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
        <span className="text-xs text-muted-foreground">Map preview</span>
      </div>
    </div>
  );
}
