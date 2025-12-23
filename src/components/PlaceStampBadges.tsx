import React from 'react';
import { usePlaceStampAggregates, usePlaceReviewCount, REVIEW_DIMENSIONS, ReviewDimension } from '@/hooks/useReviews';
import { 
  Star, HeartHandshake, DollarSign, Sparkles, MapPin, Sofa, Shield, Zap, Ban,
  MessageSquareText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<ReviewDimension, React.ElementType> = {
  quality: Star,
  service: HeartHandshake,
  value: DollarSign,
  cleanliness: Sparkles,
  location: MapPin,
  comfort: Sofa,
  reliability: Shield,
  speed: Zap,
  restrictions: Ban,
};

interface PlaceStampBadgesProps {
  placeId: string;
  maxGood?: number;
  maxBad?: number;
  showReviewCount?: boolean;
  variant?: 'default' | 'compact' | 'overlay';
  className?: string;
}

export function PlaceStampBadges({
  placeId,
  maxGood = 3,
  maxBad = 1,
  showReviewCount = true,
  variant = 'default',
  className,
}: PlaceStampBadgesProps) {
  const { data: aggregates, isLoading } = usePlaceStampAggregates(placeId);
  const { data: reviewCount } = usePlaceReviewCount(placeId);

  if (isLoading || !aggregates || aggregates.length === 0) return null;

  const positiveStamps = aggregates
    .filter(a => a.polarity === 'positive')
    .sort((a, b) => b.total_votes - a.total_votes)
    .slice(0, maxGood);

  const improvementStamps = aggregates
    .filter(a => a.polarity === 'improvement')
    .sort((a, b) => b.total_votes - a.total_votes)
    .slice(0, maxBad);

  if (positiveStamps.length === 0 && improvementStamps.length === 0) return null;

  const isOverlay = variant === 'overlay';
  const isCompact = variant === 'compact';

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Review count */}
      {showReviewCount && reviewCount !== undefined && reviewCount > 0 && (
        <div className={cn(
          'flex items-center gap-1 text-xs',
          isOverlay ? 'text-white/90' : 'text-muted-foreground'
        )}>
          <MessageSquareText className="w-3 h-3" />
          <span>{reviewCount}</span>
        </div>
      )}

      {/* Positive stamps */}
      {positiveStamps.map((stamp) => {
        const Icon = iconMap[stamp.dimension];
        const label = REVIEW_DIMENSIONS.find(d => d.id === stamp.dimension)?.label || stamp.dimension;
        
        return (
          <div
            key={`${stamp.dimension}-positive`}
            className={cn(
              'flex items-center gap-1 rounded-full',
              isOverlay 
                ? 'bg-primary/80 text-primary-foreground px-2 py-0.5 backdrop-blur-sm'
                : isCompact
                  ? 'bg-primary/10 text-primary px-1.5 py-0.5'
                  : 'bg-primary/10 text-primary px-2 py-1'
            )}
            title={`${label}: ${stamp.total_votes} votes`}
          >
            <Icon className={cn(isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
            {!isCompact && (
              <span className="text-xs font-medium">{label}</span>
            )}
          </div>
        );
      })}

      {/* Improvement stamps */}
      {improvementStamps.map((stamp) => {
        const Icon = iconMap[stamp.dimension];
        const label = REVIEW_DIMENSIONS.find(d => d.id === stamp.dimension)?.label || stamp.dimension;
        
        return (
          <div
            key={`${stamp.dimension}-improvement`}
            className={cn(
              'flex items-center gap-1 rounded-full',
              isOverlay 
                ? 'bg-amber-500/80 text-white px-2 py-0.5 backdrop-blur-sm'
                : isCompact
                  ? 'bg-amber-500/10 text-amber-600 px-1.5 py-0.5'
                  : 'bg-amber-500/10 text-amber-600 px-2 py-1'
            )}
            title={`${label}: ${stamp.total_votes} votes`}
          >
            <Icon className={cn(isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
            {!isCompact && (
              <span className="text-xs font-medium">{label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}