import { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Place } from '@/hooks/usePlaces';
import { cn } from '@/lib/utils';
import { MapPinOff, ShieldCheck } from 'lucide-react';
import { hapticLight } from '@/lib/haptics';
import { PlaceStampBadges } from './PlaceStampBadges';

interface MapPlaceCarouselProps {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceSelect: (place: Place) => void;
  mapCenter?: { lng: number; lat: number };
  className?: string;
}

// Calculate distance from center
function distanceFromCenter(place: Place, center?: { lng: number; lat: number }): number {
  if (!center) return 0;
  const R = 3959; // Earth's radius in miles
  const dLat = ((place.latitude - center.lat) * Math.PI) / 180;
  const dLng = ((place.longitude - center.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((center.lat * Math.PI) / 180) *
      Math.cos((place.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface FloatingCardProps {
  place: Place;
  isSelected: boolean;
  onSelect: () => void;
  onTap: () => void;
  distance: number;
}

function FloatingCard({ place, isSelected, onSelect, onTap, distance }: FloatingCardProps) {
  const handleClick = () => {
    hapticLight();
    if (isSelected) {
      // Second tap on selected card opens detail
      onTap();
    } else {
      // First tap selects the card
      onSelect();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex-shrink-0 w-[85vw] max-w-[360px] bg-card/98 backdrop-blur-md rounded-xl cursor-pointer transition-all duration-200',
        isSelected 
          ? 'ring-2 ring-primary shadow-2xl scale-[1.02]' 
          : 'shadow-lg hover:shadow-xl'
      )}
      style={{
        boxShadow: isSelected 
          ? '0 12px 32px -8px rgba(0, 0, 0, 0.35)' 
          : '0 8px 24px -6px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div className="flex items-center gap-3 p-2.5">
        {/* Thumbnail - smaller */}
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          {place.coverImageUrl ? (
            <img
              src={place.coverImageUrl}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
              <span className="text-lg">📍</span>
            </div>
          )}
        </div>

        {/* Content - compact */}
        <div className="flex-1 min-w-0">
          {/* Name + verified */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1 flex-1">
              {place.name}
            </h3>
            {place.isVerified && (
              <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            )}
          </div>

          {/* Distance + Price */}
          <p className="text-xs text-muted-foreground mb-1.5">
            {distance.toFixed(1)} mi · {place.priceLevel}
          </p>

          {/* Experience stamps - icons only */}
          <PlaceStampBadges 
            placeId={place.id} 
            variant="compact" 
            maxGood={3} 
            maxBad={0}
            showReviewCount={false}
          />
        </div>

        {/* Tap hint chevron */}
        <div className={cn(
          "flex-shrink-0 transition-colors",
          isSelected ? "text-primary" : "text-muted-foreground/40"
        )}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function MapPlaceCarousel({ 
  places, 
  selectedPlaceId, 
  onPlaceSelect,
  mapCenter,
  className 
}: MapPlaceCarouselProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Sort places by distance from center
  const sortedPlaces = [...places].sort((a, b) => {
    const distA = distanceFromCenter(a, mapCenter);
    const distB = distanceFromCenter(b, mapCenter);
    return distA - distB;
  }).slice(0, 15);

  // Scroll to selected place card
  useEffect(() => {
    if (selectedPlaceId && containerRef.current) {
      const card = cardRefs.current.get(selectedPlaceId);
      if (card) {
        card.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedPlaceId]);

  const setCardRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);

  const handleTap = (placeId: string) => {
    navigate(`/place/${placeId}`);
  };

  // Empty state - floating pill
  if (sortedPlaces.length === 0) {
    return (
      <div className={cn('px-4 pb-4', className)}>
        <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-card/95 backdrop-blur-md rounded-full shadow-lg text-muted-foreground">
          <MapPinOff className="w-4 h-4" />
          <span className="text-sm">No places here. Zoom out or move the map.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('pb-4', className)}>
      {/* Floating horizontal scroll carousel */}
      <div 
        ref={containerRef}
        className="flex gap-2.5 overflow-x-auto px-3 snap-x snap-mandatory pb-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {sortedPlaces.map((place) => {
          const dist = mapCenter ? distanceFromCenter(place, mapCenter) : place.distance;
          return (
            <div
              key={place.id}
              ref={(el) => setCardRef(place.id, el)}
              className="snap-center first:pl-1 last:pr-1"
            >
              <FloatingCard
                place={place}
                isSelected={selectedPlaceId === place.id}
                onSelect={() => onPlaceSelect(place)}
                onTap={() => handleTap(place.id)}
                distance={dist}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
