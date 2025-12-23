import { MapPin, Droplets, Zap, Wifi, Dog, Truck, ShowerHead, WashingMachine, Waves, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Place, PlaceFeature } from '@/hooks/usePlaces';
import { FavoriteButton } from './FavoriteButton';
import { WeatherBadge } from './WeatherBadge';
import { cn } from '@/lib/utils';
import { AspectRatio } from './ui/aspect-ratio';

interface PlaceCardProps {
  place: Place;
  className?: string;
  style?: React.CSSProperties;
}

// Map features to icons
const FEATURE_ICONS: Partial<Record<PlaceFeature, React.ElementType>> = {
  'Wi-Fi': Wifi,
  'Pet Friendly': Dog,
  'Big Rig Friendly': Truck,
  'Electric Hookups': Zap,
  'Dump Station': Droplets,
  'Fresh Water': Droplets,
  'Sewer Hookups': Droplets,
  'Showers': ShowerHead,
  'Laundry': WashingMachine,
  'Swimming Pool': Waves,
  'Hot Tub': Flame,
  'Heated Pool': Waves,
  'Heated Hot Tub': Flame,
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

export function PlaceCard({ place, className, style }: PlaceCardProps) {
  const featureIcons = getFeatureIcons(place.features);

  return (
    <Link
      to={`/place/${place.id}`}
      className={cn(
        'block rounded-xl overflow-hidden transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      style={style}
    >
      {/* Large Image with overlays */}
      <div className="relative">
        <AspectRatio ratio={4 / 3}>
          {place.coverImageUrl ? (
            <img
              src={place.coverImageUrl}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-muted-foreground/50" />
            </div>
          )}

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top-left: Category + Weather */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-background/95 text-foreground backdrop-blur-sm shadow-sm">
              {place.primaryCategory}
            </span>
            <WeatherBadge 
              latitude={place.latitude} 
              longitude={place.longitude} 
              variant="compact"
              className="shadow-sm"
            />
          </div>

          {/* Top-right: Favorite */}
          <div className="absolute top-3 right-3">
            <FavoriteButton placeId={place.id} variant="icon" />
          </div>

          {/* Bottom content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Place name */}
            <h3 className="font-display font-semibold text-white text-lg leading-tight mb-1 drop-shadow-md">
              {place.name}
            </h3>

            {/* Distance and price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white/90 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{place.distance} mi</span>
                <span className="text-white/60 mx-1">•</span>
                <span className="font-medium">{place.priceLevel}</span>
              </div>

              {/* Feature icons */}
              {featureIcons.length > 0 && (
                <div className="flex items-center gap-1">
                  {featureIcons.map(({ feature, Icon }) => (
                    <div
                      key={feature}
                      className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm"
                      title={feature}
                    >
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AspectRatio>
      </div>
    </Link>
  );
}
