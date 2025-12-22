import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { PlaceCard } from '@/components/PlaceCard';
import { PlaceFilters, PlaceFiltersState, SortOption } from '@/components/PlaceFilters';
import { usePlaces, Place } from '@/hooks/usePlaces';
import { Skeleton } from '@/components/ui/skeleton';

const PlacesToStay = () => {
  const { data: places, isLoading, error } = usePlaces();

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
    <div className="min-h-screen bg-background">
      <Header title="Places to Stay" showBack showMap />

      <main className="container px-4 py-4 max-w-lg mx-auto">
        {/* Filters and Sort */}
        <div className="mb-4">
          <PlaceFilters
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            totalCount={places?.length || 0}
            filteredCount={filteredAndSortedPlaces.length}
          />
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading...'
              : `${filteredAndSortedPlaces.length} places near you`}
          </p>
        </div>

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
      </main>
    </div>
  );
};

export default PlacesToStay;
