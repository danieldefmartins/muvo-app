import { useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Place, PlaceFeature } from '@/hooks/usePlaces';
import { PlaceStampBadges } from './PlaceStampBadges';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { MapPin, Droplets, Zap, Wifi, Dog, Truck, ChevronRight, MapPinOff } from 'lucide-react';
import { hapticLight } from '@/lib/haptics';

interface MapPlaceCarouselProps {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceSelect: (place: Place) => void;
  mapCenter?: { lng: number; lat: number };
  className?: string;
}

// Feature icons for compact display
const FEATURE_ICONS: Partial<Record<PlaceFeature, React.ElementType>> = {
  'Wi-Fi': Wifi,
  'Pet Friendly': Dog,
  'Big Rig Friendly': Truck,
  'Electric Hookups': Zap,
  'Dump Station': Droplets,
  'Fresh Water': Droplets,
};

function getFeatureIcons(features: PlaceFeature[], max = 3) {
  const icons: { feature: PlaceFeature; Icon: React.ElementType }[] = [];
  const usedIcons = new Set<React.ElementType>();
  
  for (const feature of features) {
    if (icons.length >= max) break;
    const Icon = FEATURE_ICONS[feature];
    if (Icon && !usedIcons.has(Icon)) {
      icons.push({ feature, Icon });
      usedIcons.add(Icon);
    }
  }
  
  return icons;
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

interface CarouselCardProps {
  place: Place;
  isSelected: boolean;
  onSelect: () => void;
  distanceFromCenter?: number;
}

function CarouselCard({ place, isSelected, onSelect, distanceFromCenter: centerDist }: CarouselCardProps) {
  const featureIcons = getFeatureIcons(place.features);
  
  return (
    <div
      onClick={() => {
        hapticLight();
        onSelect();
      }}
      className={cn(
        'flex-shrink-0 w-64 bg-card border rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-200',
        isSelected 
          ? 'border-primary ring-2 ring-primary shadow-lg scale-[1.02]' 
          : 'border-border hover:border-primary/50 hover:shadow-lg'
      )}
    >
      {/* Image */}
      <div className="relative h-24">
        {place.coverImageUrl ? (
          <img
            src={place.coverImageUrl}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-background/95 text-foreground backdrop-blur-sm">
            {place.primaryCategory}
          </span>
        </div>

        {/* Verified badge */}
        {place.isVerified && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/90 text-primary-foreground">
              Verified
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5">
        <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-1">
          {place.name}
        </h3>

        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span>{centerDist !== undefined ? `${centerDist.toFixed(1)} mi` : `${place.distance} mi`}</span>
          <span className="mx-0.5">•</span>
          <span className="font-medium text-foreground">{place.priceLevel}</span>
        </div>

        {/* Review stamps - compact */}
        <PlaceStampBadges 
          placeId={place.id} 
          variant="compact" 
          maxGood={2} 
          maxBad={0}
          showReviewCount={false}
          className="mb-1.5"
        />

        {/* Feature icons + CTA */}
        <div className="flex items-center justify-between">
          {featureIcons.length > 0 && (
            <div className="flex items-center gap-1">
              {featureIcons.map(({ feature, Icon }) => (
                <div
                  key={feature}
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-muted"
                  title={feature}
                >
                  <Icon className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
          
          <Link
            to={`/place/${place.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline ml-auto"
          >
            Details
            <ChevronRight className="w-3 h-3" />
          </Link>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Sort places by distance from center
  const sortedPlaces = [...places].sort((a, b) => {
    const distA = distanceFromCenter(a, mapCenter);
    const distB = distanceFromCenter(b, mapCenter);
    return distA - distB;
  }).slice(0, 15); // Limit to 15 for performance

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

  // Empty state
  if (sortedPlaces.length === 0) {
    return (
      <div className={cn('bg-background/95 backdrop-blur-sm border-t border-border', className)}>
        <div className="flex items-center justify-center gap-2 py-4 px-4 text-muted-foreground">
          <MapPinOff className="w-5 h-5" />
          <span className="text-sm">No places in this area. Zoom out or move the map.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-background/95 backdrop-blur-sm border-t border-border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <span className="text-xs font-medium text-muted-foreground">
          {sortedPlaces.length} place{sortedPlaces.length !== 1 ? 's' : ''} in view
        </span>
      </div>
      
      {/* Horizontal scroll carousel */}
      <div 
        ref={containerRef}
        className="flex gap-3 overflow-x-auto pb-3 px-4 snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {sortedPlaces.map((place) => (
          <div
            key={place.id}
            ref={(el) => setCardRef(place.id, el)}
            className="snap-center"
          >
            <CarouselCard
              place={place}
              isSelected={selectedPlaceId === place.id}
              onSelect={() => onPlaceSelect(place)}
              distanceFromCenter={mapCenter ? distanceFromCenter(place, mapCenter) : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
