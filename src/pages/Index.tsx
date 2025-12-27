import { Check, Compass, TrendingUp, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HomeSearchBar } from '@/components/HomeSearchBar';
import { usePlaces } from '@/hooks/usePlaces';
import { PlaceCard } from '@/components/PlaceCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

// Import hero images
import heroBeach from '@/assets/hero-beach.jpg';
import heroCanyon from '@/assets/hero-canyon.jpg';
import heroGlacier from '@/assets/hero-glacier.jpg';
import heroMountains from '@/assets/hero-mountains.jpg';
import heroNorthernLights from '@/assets/hero-northern-lights.jpg';
import heroRedwoods from '@/assets/hero-redwoods.jpg';
import heroRushmore from '@/assets/hero-rushmore.jpg';
import heroWaterfall from '@/assets/hero-waterfall.jpg';

const heroImages = [
  { src: heroWaterfall, alt: 'Majestic waterfall in nature' },
  { src: heroRushmore, alt: 'Mount Rushmore National Memorial' },
  { src: heroNorthernLights, alt: 'Northern Lights aurora borealis' },
  { src: heroMountains, alt: 'Scenic mountain landscape' },
  { src: heroGlacier, alt: 'Glacier national park' },
  { src: heroCanyon, alt: 'Grand canyon views' },
  { src: heroRedwoods, alt: 'Redwood forest trees' },
  { src: heroBeach, alt: 'Beautiful beach sunset' },
];

const Index = () => {
  const { data: places } = usePlaces();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  // Get trending places for carousel
  const trendingPlaces = places?.slice(0, 8) || [];

  // Auto-advance hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance trending carousel
  useEffect(() => {
    if (!carouselApi) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselApi]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Hero Section - Full viewport height accounting for header (56px) and bottom nav (64px + safe area) */}
      <section 
        className="relative w-full overflow-hidden"
        style={{ 
          height: 'calc(100dvh - 56px - 64px - env(safe-area-inset-bottom, 0px))',
          minHeight: 'calc(100vh - 56px - 64px - env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Rotating Hero Images */}
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
        
        {/* Hero Content - Centered vertically */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          {/* Search bar */}
          <HomeSearchBar className="w-full max-w-md" />
          
          {/* Tagline */}
          <p className="text-white/90 text-base sm:text-lg text-center mt-4 font-medium tracking-wide">
            Camp. Drive. Explore.
          </p>
        </div>

        {/* Slide Indicators - positioned above the bottom nav area */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentHeroIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <main className="container px-4 pb-12 max-w-2xl mx-auto pt-8">

        {/* Why Travelers Use MUVO */}
        <section className="mb-12">
          <h2 className="font-display text-page-title text-foreground mb-5 text-center">
            Why travelers use MUVO
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-accent" />
              </div>
              <p className="text-secondary text-muted-foreground">
                Real experiences, not star ratings
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-accent" />
              </div>
              <p className="text-secondary text-muted-foreground">
                See what actually stood out
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-accent" />
              </div>
              <p className="text-secondary text-muted-foreground">
                Decide based on what matters to you
              </p>
            </div>
          </div>
        </section>

        {/* Trending Near You Carousel */}
        {trendingPlaces.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-page-title text-foreground mb-4">
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
                  <CarouselItem key={place.id} className="pl-3 basis-[90%] sm:basis-[85%]">
                    <PlaceCard place={place} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>
        )}

        {/* Helpful Travel Insight (Blog Light) - Single rotating topic */}
        <section className="mb-10">
          <h2 className="font-display text-page-title text-foreground mb-4">
            Travel insight
          </h2>
          <div className="rounded-xl bg-card border border-border p-5 shadow-card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Compass className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-place-name text-foreground mb-1.5 line-clamp-2">
                  Best routes for first-time full-timers
                </h3>
                <p className="text-secondary text-muted-foreground line-clamp-2 mb-3">
                  Discover beginner-friendly routes with reliable campgrounds, services, and scenic stops along the way.
                </p>
                <button className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                  Read more
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* New RV Trends & Insights - Single informational card */}
        <section className="mb-10">
          <h2 className="font-display text-page-title text-foreground mb-4">
            RV trends & insights
          </h2>
          <div className="rounded-xl bg-card border border-border p-5 shadow-card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-place-name text-foreground mb-1.5 line-clamp-2">
                  Why Class B vans are dominating 2025
                </h3>
                <p className="text-secondary text-muted-foreground line-clamp-2 mb-3">
                  Compact, fuel-efficient, and easier to park—camper vans are becoming the go-to for weekend adventurers and remote workers.
                </p>
                <button className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                  Explore trend
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

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
