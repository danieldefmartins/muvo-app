import { useMemo } from 'react';
import { usePlaceStampAggregates } from '@/hooks/useReviews';
import { useAllStamps, getStampLabel } from '@/hooks/useStamps';
import { cn } from '@/lib/utils';

interface MuvoReviewLineProps {
  placeId: string;
  className?: string;
}

/**
 * Single line review preview for place cards:
 * [1 Positive] | [1 Neutral] | [1 Negative]
 * 
 * Each segment has subtle color tinting:
 * - Positive: subtle gold
 * - Neutral: subtle blue
 * - Negative: subtle red
 */
export function MuvoReviewLine({ placeId, className }: MuvoReviewLineProps) {
  const { data: aggregates } = usePlaceStampAggregates(placeId);
  const { data: allStamps } = useAllStamps();

  const reviewSegments = useMemo(() => {
    if (!aggregates || aggregates.length === 0) {
      return null;
    }

    // Get top positive
    const topPositive = aggregates
      .filter(a => a.polarity === 'positive')
      .sort((a, b) => b.total_votes - a.total_votes)[0];

    // Get top neutral
    const topNeutral = aggregates
      .filter(a => a.polarity === 'neutral')
      .sort((a, b) => b.total_votes - a.total_votes)[0];

    // Get top negative/improvement
    const topNegative = aggregates
      .filter(a => a.polarity === 'improvement')
      .sort((a, b) => b.total_votes - a.total_votes)[0];

    return {
      positive: topPositive ? {
        label: topPositive.stamp_id ? getStampLabel(allStamps, topPositive.stamp_id) : topPositive.dimension,
        votes: topPositive.total_votes,
      } : null,
      neutral: topNeutral ? {
        label: topNeutral.stamp_id ? getStampLabel(allStamps, topNeutral.stamp_id) : topNeutral.dimension,
        votes: topNeutral.total_votes,
      } : null,
      negative: topNegative ? {
        label: topNegative.stamp_id ? getStampLabel(allStamps, topNegative.stamp_id) : topNegative.dimension,
        votes: topNegative.total_votes,
      } : null,
    };
  }, [aggregates, allStamps]);

  if (!reviewSegments) {
    return (
      <p 
        className={cn(
          "font-bold text-primary",
          className
        )}
        style={{ fontSize: '15px', lineHeight: '20px' }}
      >
        Be the first to tap what this place is like →
      </p>
    );
  }

  const hasAnySegment = reviewSegments.positive || reviewSegments.neutral || reviewSegments.negative;

  if (!hasAnySegment) {
    return (
      <p 
        className={cn(
          "font-bold text-primary",
          className
        )}
        style={{ fontSize: '15px', lineHeight: '20px' }}
      >
        Be the first to tap what this place is like →
      </p>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center flex-wrap gap-1.5 font-semibold",
        className
      )}
      style={{ fontSize: '14px', lineHeight: '18px' }}
    >
      {/* Positive segment - subtle gold tint */}
      {reviewSegments.positive && (
        <span 
          className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400"
        >
          {reviewSegments.positive.label} ×{reviewSegments.positive.votes}
        </span>
      )}

      {/* Separator */}
      {reviewSegments.positive && (reviewSegments.neutral || reviewSegments.negative) && (
        <span className="text-muted-foreground/30 mx-0.5">|</span>
      )}

      {/* Neutral segment - subtle blue tint */}
      {reviewSegments.neutral && (
        <span 
          className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400"
        >
          {reviewSegments.neutral.label} ×{reviewSegments.neutral.votes}
        </span>
      )}

      {/* Separator */}
      {reviewSegments.neutral && reviewSegments.negative && (
        <span className="text-muted-foreground/30 mx-0.5">|</span>
      )}

      {/* Negative segment - subtle red tint */}
      {reviewSegments.negative && (
        <span 
          className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400"
        >
          {reviewSegments.negative.label} ×{reviewSegments.negative.votes}
        </span>
      )}
    </div>
  );
}
