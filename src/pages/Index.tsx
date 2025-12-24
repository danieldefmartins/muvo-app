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

      {/* Hero Section - Exactly one full screen */}
      <section 
        className="relative w-full overflow-hidden hero-section"
        style={{ 
          height: '100dvh',
          minHeight: '100vh',
        }}
      >
        {/* Responsive height styles for guaranteed visibility */}
        <style>{`
          .hero-section {
            --icon-size: 54px;
            --icon-gap: 2rem;
            --label-size: 0.8125rem;
            --tagline-size: 0.9375rem;
            --content-gap: 0.875rem;
            --bottom-pad: 1.5rem;
          }
          @media (max-height: 750px) {
            .hero-section {
              --icon-size: 50px;
              --icon-gap: 1.75rem;
              --label-size: 0.75rem;
              --tagline-size: 0.875rem;
              --content-gap: 0.75rem;
              --bottom-pad: 1.25rem;
            }
          }
          @media (max-height: 680px) {
            .hero-section {
              --icon-size: 46px;
              --icon-gap: 1.5rem;
              --label-size: 0.6875rem;
              --tagline-size: 0.8125rem;
              --content-gap: 0.625rem;
              --bottom-pad: 1rem;
            }
          }
          @media (max-height: 600px) {
            .hero-section {
              --icon-size: 42px;
              --icon-gap: 1.25rem;
              --label-size: 0.625rem;
              --tagline-size: 0.75rem;
              --content-gap: 0.5rem;
              --bottom-pad: 0.75rem;
            }
          }
          @media (max-width: 360px) {
            .hero-section {
              --icon-size: 46px;
              --icon-gap: 1.25rem;
            }
          }
          .hero-search-compact input {
            height: 44px !important;
            font-size: 0.9375rem !important;
          }
          @media (max-height: 680px) {
            .hero-search-compact input {
              height: 40px !important;
              font-size: 0.875rem !important;
            }
          }
        `}</style>
        
        <img
          src={heroRvLandscape}
          alt="RV adventure in beautiful landscape"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/50" />
        
        {/* Hero Content Overlay - anchored to bottom, vertically centered content area */}
        <div className="absolute inset-0 flex flex-col justify-end">
          {/* Content stack - search + tagline + icons */}
          <div 
            className="flex flex-col items-center px-4 w-full"
            style={{ 
              paddingBottom: 'calc(var(--bottom-pad) + env(safe-area-inset-bottom, 0px))',
              gap: 'var(--content-gap)',
            }}
          >
            {/* Search bar */}
            <HomeSearchBar className="w-full max-w-md hero-search-compact" />
            
            {/* Tagline */}
            <p 
              className="text-white/90 text-center font-medium tracking-wide"
              style={{ fontSize: 'var(--tagline-size)' }}
            >
              Camp. Drive. Explore.
            </p>
            
            {/* 3 Shortcut Icons - guaranteed single row */}
            <div 
              className="flex justify-center items-start flex-nowrap"
              style={{ gap: 'var(--icon-gap)' }}
            >
              <Link to="/map" className="group flex flex-col items-center flex-shrink-0">
                <div 
                  className="rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg group-active:scale-95 transition-transform duration-150"
                  style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }}
                >
                  <Map className="text-primary" style={{ width: 'calc(var(--icon-size) * 0.43)', height: 'calc(var(--icon-size) * 0.43)' }} />
                </div>
                <span 
                  className="mt-1 font-medium text-white drop-shadow-md whitespace-nowrap"
                  style={{ fontSize: 'var(--label-size)' }}
                >
                  Map View
                </span>
              </Link>

              <Link to="/places" className="group flex flex-col items-center flex-shrink-0">
                <div 
                  className="rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg group-active:scale-95 transition-transform duration-150"
                  style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }}
                >
                  <Navigation className="text-primary" style={{ width: 'calc(var(--icon-size) * 0.43)', height: 'calc(var(--icon-size) * 0.43)' }} />
                </div>
                <span 
                  className="mt-1 font-medium text-white drop-shadow-md whitespace-nowrap"
                  style={{ fontSize: 'var(--label-size)' }}
                >
                  Places
                </span>
              </Link>

              <Link to="/route" className="group flex flex-col items-center flex-shrink-0">
                <div 
                  className="rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg group-active:scale-95 transition-transform duration-150"
                  style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }}
                >
                  <Route className="text-primary" style={{ width: 'calc(var(--icon-size) * 0.43)', height: 'calc(var(--icon-size) * 0.43)' }} />
                </div>
                <span 
                  className="mt-1 font-medium text-white drop-shadow-md whitespace-nowrap"
                  style={{ fontSize: 'var(--label-size)' }}
                >
                  Routes
                </span>
              </Link>
            </div>
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
