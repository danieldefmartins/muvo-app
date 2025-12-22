import { Header } from '@/components/Header';
import { PlaceCard } from '@/components/PlaceCard';
import { usePlaces } from '@/hooks/usePlaces';
import { Skeleton } from '@/components/ui/skeleton';

const PlacesToStay = () => {
  const { data: places, isLoading, error } = usePlaces();

  // Sort: Pro Recommended first, then by lastUpdated, then by distance
  const sortedPlaces = places ? [...places].sort((a, b) => {
    // Pro recommended first
    if (a.isProRecommended !== b.isProRecommended) {
      return a.isProRecommended ? -1 : 1;
    }
    // Then by recently verified
    if (a.lastUpdated.getTime() !== b.lastUpdated.getTime()) {
      return b.lastUpdated.getTime() - a.lastUpdated.getTime();
    }
    // Then by distance
    return a.distance - b.distance;
  }) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Places to Stay" showBack showMap />

      <main className="container px-4 py-6 max-w-lg mx-auto">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${sortedPlaces.length} places near you`}
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

        {/* Places list */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {sortedPlaces.map((place, index) => (
              <PlaceCard
                key={place.id}
                place={place}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
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
