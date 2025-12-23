import { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PlacesMap, PlacesMapRef } from '@/components/PlacesMap';
import { PlaceFilters, PlaceFiltersState, SortOption } from '@/components/PlaceFilters';
import { QuickFilterChips } from '@/components/QuickFilterChips';
import { MapSearchBox } from '@/components/MapSearchBox';
import { MapPlaceCarousel } from '@/components/MapPlaceCarousel';
import { usePlaces, Place } from '@/hooks/usePlaces';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, MapPinOff, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const MapView = () => {
  const [searchParams] = useSearchParams();
  const { data: places, isLoading: isLoadingPlaces, error: placesError } = usePlaces();
  const mapRef = useRef<PlacesMapRef>(null);
  
  // Carousel state
  const [visiblePlaceIds, setVisiblePlaceIds] = useState<string[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lng: number; lat: number } | undefined>(undefined);

  // Parse URL params for initial map position
  const initialCenter = useMemo(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      return [parseFloat(lng), parseFloat(lat)] as [number, number];
    }
    return undefined;
  }, [searchParams]);

  const initialZoom = useMemo(() => {
    const zoom = searchParams.get('zoom');
    return zoom ? parseFloat(zoom) : undefined;
  }, [searchParams]);
  const { data: mapboxToken, isLoading: isLoadingToken, error: tokenError } = useMapboxToken();

  const [filters, setFilters] = useState<PlaceFiltersState>({
    category: null,
    features: [],
    openYearRound: false,
    petFriendly: false,
    bigRigFriendly: false,
  });

  const [sort, setSort] = useState<SortOption>('recently-updated');

  // Filter places (same logic as PlacesToStay)
  const filteredPlaces = useMemo(() => {
    if (!places) return [];

    let result = [...places];

    if (filters.category) {
      result = result.filter((p) => p.primaryCategory === filters.category);
    }

    if (filters.features.length > 0) {
      result = result.filter((p) =>
        filters.features.every((f) => p.features.includes(f))
      );
    }

    if (filters.petFriendly) {
      result = result.filter((p) => p.features.includes('Pet Friendly'));
    }

    if (filters.bigRigFriendly) {
      result = result.filter((p) => p.features.includes('Big Rig Friendly'));
    }

    if (filters.openYearRound) {
      result = result.filter((p) => p.openYearRound);
    }

    // Apply sorting
    if (sort === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => {
        if (a.isProRecommended !== b.isProRecommended) {
          return a.isProRecommended ? -1 : 1;
        }
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      });
    }

    return result;
  }, [places, filters, sort]);

  const isLoading = isLoadingPlaces || isLoadingToken;
  const hasError = placesError || tokenError;
  const hasActiveFilters = filters.category || filters.features.length > 0 || filters.openYearRound || filters.petFriendly || filters.bigRigFriendly;

  const clearFilters = useCallback(() => {
    setFilters({
      category: null,
      features: [],
      openYearRound: false,
      petFriendly: false,
      bigRigFriendly: false,
    });
  }, []);

  // Handle search selections
  const handleSearchLocation = useCallback((lng: number, lat: number, zoom?: number) => {
    mapRef.current?.flyTo(lng, lat, zoom || 12);
  }, []);

  const handleSearchPlaceSelect = useCallback((place: Place) => {
    mapRef.current?.flyTo(place.longitude, place.latitude, 14);
    setSelectedPlaceId(place.id);
    setTimeout(() => {
      mapRef.current?.openPopup(place.id);
    }, 1100);
  }, []);

  // Handle bounds/center changes from map (debounced via map component)
  const handleBoundsChange = useCallback((placeIds: string[]) => {
    setVisiblePlaceIds(placeIds);
  }, []);

  const handleCenterChange = useCallback((center: { lng: number; lat: number }) => {
    setMapCenter(center);
  }, []);

  // Handle place selection from map pin click
  const handleMapPlaceSelect = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
  }, []);

  // Handle carousel place selection - sync with map
  const handleCarouselPlaceSelect = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
    mapRef.current?.selectPlace(place.id, true);
  }, []);

  // Get visible places for carousel
  const visiblePlaces = useMemo(() => {
    if (!places) return [];
    return filteredPlaces.filter((p) => visiblePlaceIds.includes(p.id));
  }, [places, filteredPlaces, visiblePlaceIds]);

  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
      style={{ 
        // iOS safe area support
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <Header title="Map View" showBack />

      {/* Sticky toolbar - search + filters */}
      <div 
        className="sticky top-0 z-[50] bg-background border-b border-border"
        style={{ 
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="px-4 py-3 space-y-3 max-w-lg mx-auto w-full">
          {/* Row 1: Search input (full width) */}
          {mapboxToken && (
            <MapSearchBox
              mapboxToken={mapboxToken}
              places={places || []}
              onSelectLocation={handleSearchLocation}
              onSelectPlace={handleSearchPlaceSelect}
            />
          )}

          {/* Row 2: Sort + Filters + Place count */}
          <div className="flex items-center gap-2">
            <PlaceFilters
              filters={filters}
              onFiltersChange={setFilters}
              sort={sort}
              onSortChange={setSort}
              totalCount={places?.length || 0}
              filteredCount={filteredPlaces.length}
            />
            
            {/* Place count badge - inline with filters */}
            {!isLoading && !hasError && (
              <Badge variant="secondary" className="ml-auto shrink-0">
                {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Quick filter chips - scrollable row */}
      <QuickFilterChips filters={filters} onFiltersChange={setFilters} />
      {/* Map container - fills remaining viewport, leaving room for carousel */}
      <div 
        className="flex-1 relative"
        style={{ 
          minHeight: '200px',
          // Reserve space for carousel at bottom
          paddingBottom: '160px',
        }}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-[1]">
            <div className="text-center">
              <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {/* Error state - Map token error */}
        {tokenError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-[1]">
            <div className="text-center p-6 max-w-sm">
              <MapPinOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Map Unavailable</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The map couldn't be loaded. You can still browse places in list view.
              </p>
              <Button asChild>
                <Link to="/places">View as List</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Error state - Places error */}
        {placesError && !tokenError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-[1]">
            <div className="text-center p-6 max-w-sm">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Places</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Something went wrong loading the places data. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Map - no search inside (moved to toolbar) */}
        {mapboxToken && !isLoading && !hasError && (
          <PlacesMap
            ref={mapRef}
            places={filteredPlaces}
            mapboxToken={mapboxToken}
            className="h-full"
            initialCenter={initialCenter}
            initialZoom={initialZoom}
            showSearch={false}
            selectedPlaceId={selectedPlaceId}
            onPlaceSelect={handleMapPlaceSelect}
            onBoundsChange={handleBoundsChange}
            onCenterChange={handleCenterChange}
          />
        )}

        {/* No results state - overlay on map when filters return 0 places */}
        {!isLoading && !hasError && filteredPlaces.length === 0 && hasActiveFilters && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[20]">
            <div className="text-center p-6 max-w-sm">
              <FilterX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Places Match</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No places match your current filters. Try adjusting or clearing your filters.
              </p>
              <Button onClick={clearFilters} variant="outline" className="gap-2">
                <FilterX className="w-4 h-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Always-on bottom carousel */}
      {mapboxToken && !isLoading && !hasError && (
        <div className="fixed bottom-0 left-0 right-0 z-[40]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <MapPlaceCarousel
            places={visiblePlaces.length > 0 ? visiblePlaces : filteredPlaces}
            selectedPlaceId={selectedPlaceId}
            onPlaceSelect={handleCarouselPlaceSelect}
            mapCenter={mapCenter}
          />
        </div>
      )}
    </div>
  );
};

export default MapView;
