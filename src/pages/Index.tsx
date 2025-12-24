import { Map, Check } from 'lucide-react';
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

      {/* Hero Section - Full viewport height with rotating images */}
      <section 
        className="relative w-full overflow-hidden"
        style={{ 
          height: 'calc(100dvh - 56px)',
          minHeight: 'calc(100vh - 56px)',
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

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
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
