import { MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Place, formatLastUpdated } from '@/data/mockPlaces';
import { TrustBadge } from './TrustBadge';
import { PriceIndicator } from './PriceIndicator';
import { cn } from '@/lib/utils';

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
        'block bg-card rounded-lg border border-border p-4 transition-all duration-200',
        'hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-foreground text-lg leading-tight truncate">
              {place.name}
            </h3>
            <PriceIndicator level={place.priceLevel} className="flex-shrink-0" />
          </div>

          {/* Distance */}
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{place.distance} miles away</span>
          </div>

          {/* Summary */}
          <p className="text-sm text-secondary-foreground mb-3 line-clamp-2">
            {place.summary}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {place.isProRecommended && <TrustBadge type="pro" />}
            {place.isVerified && <TrustBadge type="verified" />}
            <TrustBadge type="updated" value={formatLastUpdated(place.lastUpdated)} />
            {place.hasConflict && <TrustBadge type="conflict" />}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
      </div>

      {/* Conflict warning */}
      {place.hasConflict && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-warning flex items-center gap-1">
            ⚠️ Some details reported differently by users
          </p>
        </div>
      )}
    </Link>
  );
}
