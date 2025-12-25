import { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PlacesMap, PlacesMapRef } from '@/components/PlacesMap';
import { MapSearchBar } from '@/components/MapSearchBar';
import { MapFilterChips } from '@/components/MapFilterChips';
import { MapBottomSheet } from '@/components/MapBottomSheet';
import { usePlaces, Place } from '@/hooks/usePlaces';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { useAuth } from '@/hooks/useAuth';
import { useFooter } from '@/contexts/FooterContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, MapPinOff, FilterX, ArrowLeft, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceFiltersState, SortOption } from '@/components/PlaceFilters';

const MapView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: places, isLoading: isLoadingPlaces, error: placesError } = usePlaces();
  const mapRef = useRef<PlacesMapRef>(null);
  const { user, signOut } = useAuth();
  const { setMapInteracting } = useFooter();
  
  // Bottom sheet state
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lng: number; lat: number } | undefined>(undefined);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

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

  // Filter places
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
    setIsSearchFocused(false);
  }, []);

  const handleSearchPlaceSelect = useCallback((place: Place) => {
    mapRef.current?.flyTo(place.longitude, place.latitude, 14);
    setSelectedPlaceId(place.id);
    setIsSearchFocused(false);
    setTimeout(() => {
      mapRef.current?.openPopup(place.id);
    }, 1100);
  }, []);

  // Handle bounds/center changes from map
  const handleBoundsChange = useCallback((placeIds: string[]) => {
    // No longer using carousel - we use bottom sheet now
  }, []);

  const handleCenterChange = useCallback((center: { lng: number; lat: number }) => {
    setMapCenter(center);
  }, []);

  // Handle place selection from map pin click
  const handleMapPlaceSelect = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
    setSelectedPlace(place);
  }, []);

  // Handle bottom sheet close
  const handleSheetClose = useCallback(() => {
    setSelectedPlace(null);
    setSelectedPlaceId(null);
  }, []);

  // Handle sheet state change
  const handleSheetStateChange = useCallback((state: 'hidden' | 'peek' | 'expanded') => {
    setIsSheetExpanded(state === 'expanded');
  }, []);

  // Handle map interaction for footer auto-hide
  const handleMapInteractionStart = useCallback(() => {
    setMapInteracting(true);
  }, [setMapInteracting]);

  const handleMapInteractionEnd = useCallback(() => {
    setMapInteracting(false);
  }, [setMapInteracting]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div 
      className="relative bg-background overflow-hidden"
      style={{ 
        height: '100dvh',
        minHeight: '-webkit-fill-available',
      }}
    >
      {/* Full-screen map container */}
      <div className="absolute inset-0">
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

        {/* Map */}
        {mapboxToken && !isLoading && !hasError && (
          <PlacesMap
            ref={mapRef}
            places={filteredPlaces}
            mapboxToken={mapboxToken}
            className="h-full w-full"
            initialCenter={initialCenter}
            initialZoom={initialZoom}
            showSearch={false}
            selectedPlaceId={selectedPlaceId}
            onPlaceSelect={handleMapPlaceSelect}
            onBoundsChange={handleBoundsChange}
            onCenterChange={handleCenterChange}
            onInteractionStart={handleMapInteractionStart}
            onInteractionEnd={handleMapInteractionEnd}
          />
        )}
      </div>

      {/* Search dimmer overlay */}
      {isSearchFocused && (
        <div 
          className="absolute inset-0 bg-black/30 z-[45] transition-opacity duration-200"
          onClick={() => setIsSearchFocused(false)}
        />
      )}

      {/* Floating top controls container - unified frosted glass */}
      <div 
        className="absolute top-0 left-0 right-0 z-[50] pointer-events-none"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Header buttons row */}
        <div className="flex items-center justify-between px-4 py-3 pointer-events-auto">
          {/* Back button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card/[0.88] backdrop-blur-xl shadow-lg border-0 hover:bg-card/95"
            style={{ boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.2)' }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* User/Profile button */}
          {user ? (
            <Button
              variant="secondary"
              size="icon"
              onClick={handleSignOut}
              className="w-10 h-10 rounded-full bg-card/[0.88] backdrop-blur-xl shadow-lg border-0 hover:bg-card/95"
              style={{ boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.2)' }}
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              asChild
              variant="secondary"
              size="icon"
              className="w-10 h-10 rounded-full bg-card/[0.88] backdrop-blur-xl shadow-lg border-0 hover:bg-card/95"
              style={{ boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.2)' }}
            >
              <Link to="/auth" aria-label="Sign in">
                <User className="w-5 h-5" />
              </Link>
            </Button>
          )}
        </div>

        {/* Search + Filters container with frosted glass */}
        <div className="px-4 pb-3 space-y-2 pointer-events-auto">
          <MapSearchBar
            mapboxToken={mapboxToken || ''}
            places={places || []}
            onSelectLocation={handleSearchLocation}
            onSelectPlace={handleSearchPlaceSelect}
            onFocusChange={setIsSearchFocused}
            isFocused={isSearchFocused}
          />
          
          <MapFilterChips 
            filters={filters} 
            onFiltersChange={setFilters}
            filteredCount={filteredPlaces.length}
          />
        </div>
      </div>

      {/* No results state - floating pill */}
      {!isLoading && !hasError && filteredPlaces.length === 0 && hasActiveFilters && (
        <div className="absolute inset-0 flex items-center justify-center z-[30] pointer-events-none">
          <div className="text-center p-6 max-w-sm bg-card/95 backdrop-blur-md rounded-2xl shadow-xl pointer-events-auto">
            <FilterX className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">No Places Match</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your filters
            </p>
            <Button onClick={clearFilters} variant="outline" size="sm" className="gap-2">
              <FilterX className="w-4 h-4" />
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Sheet */}
      {mapboxToken && !isLoading && !hasError && (
        <MapBottomSheet
          place={selectedPlace}
          places={filteredPlaces}
          mapCenter={mapCenter}
          onClose={handleSheetClose}
          onSheetStateChange={handleSheetStateChange}
        />
      )}
    </div>
  );
};

export default MapView;
