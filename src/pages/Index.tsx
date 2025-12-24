import { Map, Navigation, Route, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { HomeSearchBar } from '@/components/HomeSearchBar';
import { usePlaces } from '@/hooks/usePlaces';
import { PlaceStampBadges } from '@/components/PlaceStampBadges';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

// Import hero image
import heroRvLandscape from '@/assets/hero-rv-landscape.jpg';

const Index = () => {
  const { data: places } = usePlaces();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  
  // Get trending places for carousel
  const trendingPlaces = places?.slice(0, 8) || [];

  // Auto-advance trending carousel
  useEffect(() => {
    if (!carouselApi) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselApi]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Full Screen */}
      <section className="relative h-screen w-full overflow-hidden">
        <img
          src={heroRvLandscape}
          alt="RV adventure in beautiful landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pt-safe">
          <p className="text-white/90 text-lg sm:text-xl text-center mb-2">
            Find the right stop for your trip
          </p>
          <p className="text-white/60 text-sm text-center mb-8">
            Real experiences. No star ratings.
          </p>
          
          {/* Search Bar */}
          <HomeSearchBar className="w-full max-w-lg px-4" />
        </div>

        {/* Floating Action Icons - Bottom of Hero */}
        <div className="absolute bottom-8 left-0 right-0 px-4">
          <div className="flex justify-center gap-8 max-w-md mx-auto">
            <Link to="/map" className="group flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <span className="mt-2 text-sm font-medium text-white drop-shadow-md">
                Map View
              </span>
            </Link>

            <Link to="/places" className="group flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                <Navigation className="w-6 h-6 text-primary" />
              </div>
              <span className="mt-2 text-sm font-medium text-white drop-shadow-md">
                Places
              </span>
            </Link>

            <Link to="/route" className="group flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                <Route className="w-6 h-6 text-primary" />
              </div>
              <span className="mt-2 text-sm font-medium text-white drop-shadow-md">
                Routes
              </span>
            </Link>
          </div>
        </div>
      </section>

      <main className="container px-4 pb-12 max-w-2xl mx-auto pt-8">

        {/* Why Travelers Use MUVO */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-foreground mb-5 text-center">
            Why travelers use MUVO
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-accent" />
              </div>
              <p className="text-muted-foreground">
                Real experiences, not star ratings
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-accent" />
              </div>
              <p className="text-muted-foreground">
                See what actually stood out
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-accent" />
              </div>
              <p className="text-muted-foreground">
                Decide based on what matters to you
              </p>
            </div>
          </div>
        </section>

        {/* Trending Near You Carousel */}
        {trendingPlaces.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Trending near you
            </h2>
            <Carousel
              setApi={setCarouselApi}
              opts={{
                loop: true,
                align: 'start',
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3">
                {trendingPlaces.map((place) => (
                  <CarouselItem key={place.id} className="pl-3 basis-[70%] sm:basis-[45%]">
                    <Link to={`/place/${place.id}`} className="block group">
                      <div className="rounded-xl overflow-hidden bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-200">
                        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                          {place.coverImageUrl ? (
                            <img 
                              src={place.coverImageUrl} 
                              alt={place.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                              <Map className="w-8 h-8 text-accent/40" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm text-foreground leading-tight group-hover:text-accent transition-colors line-clamp-1">
                            {place.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                            {place.primaryCategory}
                          </p>
                          <PlaceStampBadges 
                            placeId={place.id} 
                            variant="compact" 
                            maxGood={2} 
                            maxBad={0}
                            showReviewCount={false}
                          />
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Reviews powered by Tavvy
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
