import { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { Place } from '@/hooks/usePlaces';
import { PlaceMapCard } from './PlaceMapCard';
import { MapSearchBox } from './MapSearchBox';
import { createRoot, Root } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { hapticLight } from '@/lib/haptics';

interface PlacesMapProps {
  places: Place[];
  mapboxToken: string;
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  showSearch?: boolean;
  selectedPlaceId?: string | null;
  onPlaceSelect?: (place: Place) => void;
  onBoundsChange?: (visiblePlaceIds: string[]) => void;
  onCenterChange?: (center: { lng: number; lat: number }) => void;
}

export interface PlacesMapRef {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  openPopup: (placeId: string) => void;
  selectPlace: (placeId: string, centerOnPlace?: boolean) => void;
  getCenter: () => { lng: number; lat: number } | null;
}

// Create a separate query client for the popup
const popupQueryClient = new QueryClient();

// Type for supercluster point
interface PointProperties {
  cluster: boolean;
  placeId?: string;
  place?: Place;
  point_count?: number;
  point_count_abbreviated?: string;
}

type ClusterFeature = Supercluster.PointFeature<PointProperties> | Supercluster.ClusterFeature<PointProperties>;

export const PlacesMap = forwardRef<PlacesMapRef, PlacesMapProps>(function PlacesMap(
  { places, mapboxToken, className, initialCenter, initialZoom, showSearch = false, selectedPlaceId, onPlaceSelect, onBoundsChange, onCenterChange },
  ref
) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const placeMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const clusterMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const clusterRef = useRef<Supercluster<PointProperties, PointProperties> | null>(null);
  const placesMapRef = useRef<Map<string, Place>>(new Map());

  // Update places map for quick lookup
  useEffect(() => {
    placesMapRef.current.clear();
    places.forEach((p) => placesMapRef.current.set(p.id, p));
  }, [places]);

  // Create supercluster instance
  const cluster = useMemo(() => {
    const sc = new Supercluster<PointProperties, PointProperties>({
      radius: 60,
      maxZoom: 14,
    });

    const points: Supercluster.PointFeature<PointProperties>[] = places.map((place) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        placeId: place.id,
        place,
      },
      geometry: {
        type: 'Point',
        coordinates: [place.longitude, place.latitude],
      },
    }));

    sc.load(points);
    clusterRef.current = sc;
    return sc;
  }, [places]);

  // Open popup for a specific place
  const openPopupForPlace = useCallback((place: Place) => {
    if (!map.current) return;

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
      .addTo(map.current);

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

    onPlaceSelect?.(place);
  }, [onPlaceSelect]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    flyTo: (lng: number, lat: number, zoom?: number) => {
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: zoom || 14,
          duration: 1000,
        });
      }
    },
    openPopup: (placeId: string) => {
      const place = placesMapRef.current.get(placeId);
      if (place && map.current) {
        map.current.flyTo({
          center: [place.longitude, place.latitude],
          zoom: 14,
          duration: 1000,
        });
        // Delay popup to allow map to move
        setTimeout(() => {
          openPopupForPlace(place);
        }, 1100);
      }
    },
    selectPlace: (placeId: string, centerOnPlace: boolean = true) => {
      const place = placesMapRef.current.get(placeId);
      if (place && map.current) {
        if (centerOnPlace) {
          map.current.easeTo({
            center: [place.longitude, place.latitude],
            duration: 500,
          });
        }
        onPlaceSelect?.(place);
      }
    },
    getCenter: () => {
      if (map.current) {
        const center = map.current.getCenter();
        return { lng: center.lng, lat: center.lat };
      }
      return null;
    },
  }), [openPopupForPlace, onPlaceSelect]);

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

  // Notify about visible places when bounds change
  const notifyBoundsChange = useCallback(() => {
    if (!map.current) return;

    // Notify about center change
    if (onCenterChange) {
      const center = map.current.getCenter();
      onCenterChange({ lng: center.lng, lat: center.lat });
    }

    if (!onBoundsChange) return;

    const bounds = map.current.getBounds();
    const visibleIds = places
      .filter((p) => bounds.contains([p.longitude, p.latitude]))
      .map((p) => p.id);
    
    onBoundsChange(visibleIds);
  }, [places, onBoundsChange, onCenterChange]);

  // Update markers based on current zoom/bounds
  const updateMarkers = useCallback(() => {
    if (!map.current || !clusterRef.current) return;

    // Clear existing markers
    placeMarkersRef.current.forEach((marker) => marker.remove());
    placeMarkersRef.current.clear();
    clusterMarkersRef.current.forEach((marker) => marker.remove());
    clusterMarkersRef.current = [];
    popupRef.current?.remove();
    popupRootRef.current?.unmount();

    const bounds = map.current.getBounds();
    const zoom = Math.floor(map.current.getZoom());

    const clusters = clusterRef.current.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom
    );

    clusters.forEach((feature: ClusterFeature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;

      if (props.cluster) {
        // Cluster marker
        const count = props.point_count || 0;
        const el = document.createElement('div');
        el.className = 'cluster-marker cursor-pointer';
        
        // Size based on count
        const size = count < 10 ? 36 : count < 50 ? 44 : 52;
        
        el.innerHTML = `
          <div class="flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shadow-lg border-2 border-white" style="width: ${size}px; height: ${size}px;">
            ${props.point_count_abbreviated || count}
          </div>
        `;

        el.addEventListener('click', () => {
          hapticLight();
          if (!map.current || !clusterRef.current) return;
          const clusterId = (feature as Supercluster.ClusterFeature<PointProperties>).id as number;
          const expansionZoom = clusterRef.current.getClusterExpansionZoom(clusterId);
          map.current.flyTo({
            center: [lng, lat],
            zoom: expansionZoom,
            duration: 500,
          });
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        clusterMarkersRef.current.push(marker);
      } else {
        // Individual place marker
        const place = props.place!;
        const isSelected = selectedPlaceId === place.id;
        const el = document.createElement('div');
        el.className = 'place-marker cursor-pointer';
        el.setAttribute('data-place-id', place.id);
        
        el.innerHTML = `
          <div class="w-8 h-8 ${isSelected ? 'bg-accent scale-125' : 'bg-primary'} rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-primary-foreground">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;

        el.addEventListener('click', () => {
          hapticLight();
          openPopupForPlace(place);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        placeMarkersRef.current.set(place.id, marker);
      }
    });

    // Notify about visible places
    notifyBoundsChange();
  }, [selectedPlaceId, openPopupForPlace, notifyBoundsChange]);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapContainer.current || !mapboxToken) {
      console.log('Mapbox init blocked:', { hasContainer: !!mapContainer.current, hasToken: !!mapboxToken });
      return;
    }

    try {
      mapboxgl.accessToken = mapboxToken;

      const center: [number, number] = initialCenter || [-98.5, 39.8];
      const zoom = initialZoom || 3;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center,
        zoom,
      });

      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully');
        updateMarkers();
      });

      map.current.on('moveend', updateMarkers);
      map.current.on('zoomend', updateMarkers);

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: false }),
        'top-right'
      );
    } catch (error) {
      console.error('Mapbox initialization failed:', error);
    }

    // Cleanup
    return () => {
      placeMarkersRef.current.forEach((marker) => marker.remove());
      clusterMarkersRef.current.forEach((marker) => marker.remove());
      popupRef.current?.remove();
      popupRootRef.current?.unmount();
      userMarkerRef.current?.remove();
      map.current?.remove();
    };
  }, [mapboxToken, initialCenter, initialZoom, updateMarkers]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Remove existing user marker
    userMarkerRef.current?.remove();

    // Create user location marker
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.innerHTML = `
      <div class="relative">
        <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
        <div class="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
      </div>
    `;

    userMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat(userLocation)
      .addTo(map.current);
  }, [userLocation]);

  // Update cluster when places change and fit bounds
  useEffect(() => {
    if (!map.current || places.length === 0) return;

    // Wait for map to be loaded
    if (!map.current.loaded()) {
      map.current.on('load', () => {
        updateMarkers();
        fitBounds();
      });
    } else {
      updateMarkers();
      // Only fit bounds if no initial center provided
      if (!initialCenter) {
        fitBounds();
      }
    }

    function fitBounds() {
      if (!map.current || places.length === 0) return;

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
  }, [places, userLocation, updateMarkers, initialCenter]);

  // Handle search selection
  const handleSearchLocation = useCallback((lng: number, lat: number, zoom?: number) => {
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom || 12,
        duration: 1000,
      });
    }
  }, []);

  const handleSearchPlaceSelect = useCallback((place: Place) => {
    if (map.current) {
      map.current.flyTo({
        center: [place.longitude, place.latitude],
        zoom: 14,
        duration: 1000,
      });
      setTimeout(() => {
        openPopupForPlace(place);
      }, 1100);
    }
  }, [openPopupForPlace]);

  return (
    <div className={cn('relative w-full', className)} style={{ minHeight: '300px', height: '100%' }}>
      <div ref={mapContainer} className="absolute inset-0" style={{ minHeight: '300px' }} />
      
      {/* Search box - only show if enabled */}
      {showSearch && (
        <div className="absolute top-3 left-3 right-16 z-[10]">
          <MapSearchBox
            mapboxToken={mapboxToken}
            places={places}
            onSelectLocation={handleSearchLocation}
            onSelectPlace={handleSearchPlaceSelect}
          />
        </div>
      )}

      {/* Location button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-4 right-4 z-[10] shadow-lg bg-background/95 backdrop-blur-sm"
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
        .mapboxgl-popup {
          z-index: 30 !important;
        }
        .user-location-marker {
          z-index: 5;
        }
        .cluster-marker {
          z-index: 6;
        }
        .place-marker {
          z-index: 5;
        }
        .mapboxgl-ctrl-top-right {
          top: 10px !important;
          right: 10px !important;
        }
      `}</style>
    </div>
  );
});
