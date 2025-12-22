import { Header } from '@/components/Header';
import { PlaceCard } from '@/components/PlaceCard';
import { mockPlaces } from '@/data/mockPlaces';

const PlacesToStay = () => {
  // Sort: Pro Recommended first, then by lastUpdated, then by distance
  const sortedPlaces = [...mockPlaces].sort((a, b) => {
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
  });

  return (
    <div className="min-h-screen bg-background">
      <Header title="Places to Stay" showBack showMap />

      <main className="container px-4 py-6 max-w-lg mx-auto">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {sortedPlaces.length} places near you
          </p>
        </div>

        {/* Places list */}
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

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-8 pb-4">
          Information is based on community reports. Always verify locally.
        </p>
      </main>
    </div>
  );
};

export default PlacesToStay;
