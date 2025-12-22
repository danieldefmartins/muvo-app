import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Maximize2 } from 'lucide-react';
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
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [longitude, latitude],
      zoom: 13,
      interactive: false,
      attributionControl: false,
      dragPan: false,
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add marker with pulse animation
    const el = document.createElement('div');
    el.className = 'place-mini-map-marker';
    el.innerHTML = `
      <div class="marker-pulse-ring"></div>
      <div class="marker-pin">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    navigate(`/map?lat=${latitude}&lng=${longitude}&zoom=14`);
  };

  return (
    <>
      {/* Marker animation styles */}
      <style>{`
        .place-mini-map-marker {
          position: relative;
          width: 32px;
          height: 32px;
        }
        .marker-pin {
          position: absolute;
          inset: 0;
          width: 32px;
          height: 32px;
          background: hsl(142, 76%, 36%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 2px solid white;
          z-index: 2;
        }
        .marker-pin svg {
          width: 16px;
          height: 16px;
        }
        .marker-pulse-ring {
          position: absolute;
          inset: -8px;
          width: 48px;
          height: 48px;
          background: hsl(142, 76%, 36%);
          border-radius: 50%;
          opacity: 0;
          z-index: 1;
          animation: marker-pulse 1s ease-out forwards;
        }
        @keyframes marker-pulse {
          0% {
            transform: scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
      
      <div
        className={cn(
          'relative w-full h-40 rounded-lg overflow-hidden cursor-pointer group border border-border',
          className
        )}
        onClick={handleClick}
      >
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Bottom gradient overlay for contrast */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
        
        {/* Always visible CTA label */}
        <div className="absolute bottom-2 right-2 z-10">
          <div className="bg-background/95 backdrop-blur-sm px-2.5 py-1.5 rounded-md shadow-md border border-border group-hover:bg-background group-hover:shadow-lg transition-all">
            <span className="text-xs font-medium flex items-center gap-1.5 text-foreground">
              <Maximize2 className="w-3 h-3" />
              Expand map
            </span>
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors pointer-events-none" />
      </div>
    </>
  );
}

// Fallback when no token available
export function PlaceMiniMapPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full h-40 rounded-lg overflow-hidden bg-muted flex items-center justify-center border border-border',
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
