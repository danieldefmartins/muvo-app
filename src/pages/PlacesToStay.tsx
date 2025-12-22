import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { PlaceCard } from '@/components/PlaceCard';
import { PlaceFilters, PlaceFiltersState, SortOption } from '@/components/PlaceFilters';
import { PlacesMap } from '@/components/PlacesMap';
import { usePlaces, Place } from '@/hooks/usePlaces';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Map, List, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'map';

const PlacesToStay = () => {
  const { data: places, isLoading, error } = usePlaces();
  const { data: mapboxToken, isLoading: isLoadingToken, error: tokenError } = useMapboxToken();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<PlaceFiltersState>({
    category: null,
    features: [],
    openYearRound: false,
    petFriendly: false,
    bigRigFriendly: false,
  });

  const [sort, setSort] = useState<SortOption>('recently-updated');

  // Filter and sort places
  const filteredAndSortedPlaces = useMemo(() => {
    if (!places) return [];

    let result = [...places];

    // Apply filters
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
      // Recently updated - pro recommended first, then by date
      result.sort((a, b) => {
        if (a.isProRecommended !== b.isProRecommended) {
          return a.isProRecommended ? -1 : 1;
        }
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      });
    }

    return result;
  }, [places, filters, sort]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Places to Stay" showBack />

      <main className="flex-1 flex flex-col">
        {/* Filters, Sort, and View Toggle */}
        <div className="container px-4 py-4 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2 mb-4">
            {/* View toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-none px-3 h-9',
                  viewMode === 'list' && 'bg-muted'
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-1.5" />
                List
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-none px-3 h-9 border-l border-border',
                  viewMode === 'map' && 'bg-muted'
                )}
                onClick={() => setViewMode('map')}
              >
                <Map className="w-4 h-4 mr-1.5" />
                Map
              </Button>
            </div>
            
            <div className="flex-1">
              <PlaceFilters
                filters={filters}
                onFiltersChange={setFilters}
                sort={sort}
                onSortChange={setSort}
                totalCount={places?.length || 0}
                filteredCount={filteredAndSortedPlaces.length}
              />
            </div>
          </div>

          {/* Results count - only show in list view */}
          {viewMode === 'list' && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? 'Loading...'
                  : `${filteredAndSortedPlaces.length} places near you`}
              </p>
            </div>
          )}
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="flex-1 relative min-h-[400px]">
            {isLoadingToken && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <Skeleton className="w-8 h-8 rounded-full mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
            
            {tokenError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center p-4">
                  <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-destructive font-medium mb-1">Map unavailable</p>
                  <p className="text-xs text-muted-foreground">
                    Mapbox token not configured. Please add it in the backend settings.
                  </p>
                </div>
              </div>
            )}

            {mapboxToken && !isLoadingToken && (
              <PlacesMap
                places={filteredAndSortedPlaces}
                mapboxToken={mapboxToken}
                className="h-full"
              />
            )}

            {/* Floating results count on map */}
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-border">
                <p className="text-xs font-medium">
                  {filteredAndSortedPlaces.length} places
                </p>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="container px-4 max-w-lg mx-auto w-full pb-4">
            {/* Error state */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                <p className="text-sm text-destructive">Failed to load places. Please try again.</p>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && filteredAndSortedPlaces.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No places match your filters.</p>
                <button
                  onClick={() =>
                    setFilters({
                      category: null,
                      features: [],
                      openYearRound: false,
                      petFriendly: false,
                      bigRigFriendly: false,
                    })
                  }
                  className="text-sm text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Places list */}
            {!isLoading && !error && filteredAndSortedPlaces.length > 0 && (
              <div className="space-y-3">
                {filteredAndSortedPlaces.map((place, index) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    className="animate-fade-in"
                    style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-center text-xs text-muted-foreground mt-8 pb-4">
              Information is based on community reports. Always verify locally.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlacesToStay;
