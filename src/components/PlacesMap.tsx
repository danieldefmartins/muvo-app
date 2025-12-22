import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Place } from '@/hooks/usePlaces';
import { PlaceMapCard } from './PlaceMapCard';
import { createRoot, Root } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface PlacesMapProps {
  places: Place[];
  mapboxToken: string;
  className?: string;
}

// Create a separate query client for the popup
const popupQueryClient = new QueryClient();

export function PlacesMap({ places, mapboxToken, className }: PlacesMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Request user location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setUserLocation(coords);
        setIsLocating(false);
        
        // Center map on user location
        if (map.current) {
          map.current.flyTo({
            center: coords,
            zoom: 10,
            duration: 1500,
          });
        }
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [-98.5, 39.8], // Center of US
      zoom: 3,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: false }),
      'top-right'
    );

    // Cleanup
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      popupRef.current?.remove();
      popupRootRef.current?.unmount();
      userMarkerRef.current?.remove();
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Remove existing user marker
    userMarkerRef.current?.remove();

    // Create user location marker
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.innerHTML = `
      <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
    `;

    userMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat(userLocation)
      .addTo(map.current);
  }, [userLocation]);

  // Update markers when places change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    popupRef.current?.remove();
    popupRootRef.current?.unmount();

    if (places.length === 0) return;

    // Create markers for each place
    places.forEach((place) => {
      const el = document.createElement('div');
      el.className = 'place-marker cursor-pointer';
      el.innerHTML = `
        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-primary-foreground">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        // Close existing popup
        popupRef.current?.remove();
        popupRootRef.current?.unmount();

        // Create popup container
        const popupContainer = document.createElement('div');
        
        // Create popup
        popupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: true,
          maxWidth: 'none',
          offset: 25,
          className: 'place-popup',
        })
          .setLngLat([place.longitude, place.latitude])
          .setDOMContent(popupContainer)
          .addTo(map.current!);

        // Render React component in popup
        popupRootRef.current = createRoot(popupContainer);
        popupRootRef.current.render(
          <QueryClientProvider client={popupQueryClient}>
            <BrowserRouter>
              <PlaceMapCard 
                place={place} 
                onClose={() => {
                  popupRef.current?.remove();
                }}
              />
            </BrowserRouter>
          </QueryClientProvider>
        );
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all places
    if (places.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      places.forEach((place) => {
        bounds.extend([place.longitude, place.latitude]);
      });

      // Include user location in bounds if available
      if (userLocation) {
        bounds.extend(userLocation);
      }

      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 12,
        duration: 1000,
      });
    }
  }, [places, userLocation]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Location button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-4 right-4 z-10 shadow-lg"
        onClick={requestLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Navigation className="w-4 h-4" />
        )}
      </Button>

      {/* Custom styles for markers and popups */}
      <style>{`
        .place-popup .mapboxgl-popup-content {
          padding: 0;
          background: transparent;
          box-shadow: none;
        }
        .place-popup .mapboxgl-popup-tip {
          display: none;
        }
        .user-location-marker {
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
