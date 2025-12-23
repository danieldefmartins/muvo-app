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

  // HIDE negative/improvement stamps on list cards (variant != 'default')
  // Only show on full detail page (default variant) when there's enough positive signal
  const showImprovementStamps = variant === 'default' && positiveStamps.length >= 2;
  const improvementStamps = showImprovementStamps 
    ? sortedAggregates.filter(a => a.polarity === 'improvement').slice(0, maxBad)
    : [];

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

      {/* Positive stamps - show ×N for vote count instead of repeating icons */}
      {positiveStamps.map((stamp) => {
        const label = stamp.stamp_id 
          ? getStampLabel(allStamps, stamp.stamp_id)
          : stamp.dimension;
        const voteCount = stamp.review_count; // Number of reviews with this stamp
        
        return (
          <div
            key={stamp.stamp_id || `${stamp.dimension}-positive`}
            className={cn(
              'flex items-center gap-1 rounded-full',
              isOverlay 
                ? 'bg-primary/80 text-primary-foreground px-2 py-0.5 backdrop-blur-sm'
                : isCompact
                  ? 'bg-primary/10 text-primary px-1.5 py-0.5'
                  : 'bg-primary/10 text-primary px-2.5 py-1'
            )}
            title={`${label}: ${voteCount} ${voteCount === 1 ? 'review' : 'reviews'}`}
          >
            <CheckCircle className={cn(isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
            {!isCompact && (
              <>
                <span className="text-sm font-medium">{label}</span>
                {voteCount > 1 && (
                  <span className="text-sm font-semibold opacity-80">×{voteCount}</span>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Improvement stamps - show ×N for vote count instead of repeating icons */}
      {improvementStamps.map((stamp) => {
        const label = stamp.stamp_id 
          ? getStampLabel(allStamps, stamp.stamp_id)
          : stamp.dimension;
        const voteCount = stamp.review_count;
        
        return (
          <div
            key={stamp.stamp_id || `${stamp.dimension}-improvement`}
            className={cn(
              'flex items-center gap-1 rounded-full',
              isOverlay 
                ? 'bg-amber-500/80 text-white px-2 py-0.5 backdrop-blur-sm'
                : isCompact
                  ? 'bg-amber-500/10 text-amber-600 px-1.5 py-0.5'
                  : 'bg-amber-500/10 text-amber-600 px-2.5 py-1'
            )}
            title={`${label}: ${voteCount} ${voteCount === 1 ? 'review' : 'reviews'}`}
          >
            <AlertTriangle className={cn(isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
            {!isCompact && (
              <>
                <span className="text-sm font-medium">{label}</span>
                {voteCount > 1 && (
                  <span className="text-sm font-semibold opacity-80">×{voteCount}</span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}