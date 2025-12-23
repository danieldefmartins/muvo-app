import React from 'react';
import { usePlaceStampAggregates, usePlaceReviewCount } from '@/hooks/useReviews';
import { useAllStamps, getStampLabel } from '@/hooks/useStamps';
import { CheckCircle, AlertTriangle, MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { data: allStamps } = useAllStamps();

  if (isLoading || !aggregates || aggregates.length === 0) return null;

  // Sort by total_votes descending, then review_count as tie-breaker
  const sortedAggregates = [...aggregates].sort((a, b) => {
    if (b.total_votes !== a.total_votes) return b.total_votes - a.total_votes;
    return b.review_count - a.review_count;
  });

  const positiveStamps = sortedAggregates
    .filter(a => a.polarity === 'positive')
    .slice(0, maxGood);

  const improvementStamps = sortedAggregates
    .filter(a => a.polarity === 'improvement')
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
        const label = stamp.stamp_id 
          ? getStampLabel(allStamps, stamp.stamp_id)
          : stamp.dimension;
        
        return (
          <div
            key={stamp.stamp_id || `${stamp.dimension}-positive`}
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
            <CheckCircle className={cn(isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
            {!isCompact && (
              <>
                <span className="text-xs font-medium">{label}</span>
                <span className="text-xs opacity-70">({stamp.total_votes})</span>
              </>
            )}
          </div>
        );
      })}

      {/* Improvement stamps */}
      {improvementStamps.map((stamp) => {
        const label = stamp.stamp_id 
          ? getStampLabel(allStamps, stamp.stamp_id)
          : stamp.dimension;
        
        return (
          <div
            key={stamp.stamp_id || `${stamp.dimension}-improvement`}
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
            <AlertTriangle className={cn(isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
            {!isCompact && (
              <>
                <span className="text-xs font-medium">{label}</span>
                <span className="text-xs opacity-70">({stamp.total_votes})</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}