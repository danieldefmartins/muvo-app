import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PlacesMap } from '@/components/PlacesMap';
import { PlaceFilters, PlaceFiltersState, SortOption } from '@/components/PlaceFilters';
import { usePlaces } from '@/hooks/usePlaces';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, MapPinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MapView = () => {
  const [searchParams] = useSearchParams();
  const { data: places, isLoading: isLoadingPlaces, error: placesError } = usePlaces();

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Map View" showBack />

      {/* Filters bar */}
      <div className="container px-4 py-3 max-w-lg mx-auto w-full border-b border-border">
        <PlaceFilters
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          totalCount={places?.length || 0}
          filteredCount={filteredPlaces.length}
        />
      </div>

      {/* Full-screen map */}
      <div className="flex-1 relative">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {/* Error state - Map token error */}
        {tokenError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
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
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
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
            places={filteredPlaces}
            mapboxToken={mapboxToken}
            className="h-full"
            initialCenter={initialCenter}
            initialZoom={initialZoom}
            showSearch
          />
        )}

        {/* Floating results count */}
        {!isLoading && !hasError && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-border">
              <p className="text-xs font-medium">
                {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
