import { MapPin, Award, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Place, formatLastUpdated } from '@/hooks/usePlaces';
import { PriceIndicator } from './PriceIndicator';
import { cn } from '@/lib/utils';
import { AspectRatio } from './ui/aspect-ratio';

interface PlaceCardProps {
  place: Place;
  className?: string;
  style?: React.CSSProperties;
}

export function PlaceCard({ place, className, style }: PlaceCardProps) {
  return (
    <Link
      to={`/place/${place.id}`}
      className={cn(
        'block bg-card rounded-lg border border-border overflow-hidden transition-all duration-200',
        'hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      style={style}
    >
      {/* Image Section */}
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          {place.coverImageUrl ? (
            <img
              src={place.coverImageUrl}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No photo yet</span>
            </div>
          )}
        </AspectRatio>

        {/* Image Overlays */}
        {/* Top-left: Category badge */}
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-background/90 text-foreground backdrop-blur-sm">
            {place.primaryCategory}
          </span>
        </div>

        {/* Top-right: Price level */}
        <div className="absolute top-2 right-2">
          <PriceIndicator level={place.priceLevel} className="bg-background/90 backdrop-blur-sm" />
        </div>

        {/* Bottom-right: Status icons */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {place.isProRecommended && (
            <div 
              className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/90 text-accent-foreground backdrop-blur-sm"
              title="Pro Recommended"
            >
              <Award className="w-4 h-4" />
            </div>
          )}
          {place.hasConflict && (
            <div 
              className="flex items-center justify-center w-7 h-7 rounded-full bg-warning/90 text-warning-foreground backdrop-blur-sm"
              title="Has pending updates"
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Place name */}
        <h3 className="font-display font-semibold text-foreground text-lg leading-tight truncate mb-1">
          {place.name}
        </h3>

        {/* Distance */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{place.distance} miles away</span>
        </div>

        {/* Summary */}
        <p className="text-sm text-secondary-foreground mb-3 line-clamp-2">
          {place.summary}
        </p>

        {/* Last updated */}
        <p className="text-xs text-muted-foreground">
          Updated {formatLastUpdated(place.lastUpdated)}
        </p>
      </div>
    </Link>
  );
}
