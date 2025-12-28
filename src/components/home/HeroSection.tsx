import { useState, useEffect } from 'react';
import { Truck, Zap, Signal } from 'lucide-react';
import { HomeSearchBar } from '@/components/HomeSearchBar';

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

export function HeroSection() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-advance hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden h-[60vh] max-h-[420px] sm:max-h-[480px]">
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      
      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-8">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-6 leading-tight">
          The fastest way to find<br />your perfect RV spot.
        </h1>
        
        {/* Search bar - full width on mobile */}
        <HomeSearchBar className="w-full max-w-md mb-4 px-0" />
        
        {/* Quick Filter Chips - wrap properly on mobile */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-white/90 text-sm">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Truck className="w-4 h-4" />
            Big Rig Friendly
          </span>
          <span className="text-white/50 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Zap className="w-4 h-4" />
            Hookups
          </span>
          <span className="text-white/50 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Signal className="w-4 h-4" />
            Cell Signal
          </span>
        </div>
      </div>

      {/* Slide Indicators */}
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
  );
}
