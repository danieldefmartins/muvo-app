import { useMemo } from 'react';
import { usePlaceStampAggregates } from '@/hooks/useReviews';
import { useAllStamps, getStampLabel } from '@/hooks/useStamps';
import { cn } from '@/lib/utils';

interface PlaceCardReviewLinesProps {
  placeId: string;
  className?: string;
}

/**
 * MUVO v1.7 - Place Card Review Display
 * Shows EXACTLY 3 stacked lines:
 * - Line 1: TOP 1 Positive (e.g., "Great Food ×42")
 * - Line 2: TOP 1 Neutral (e.g., "Rustic ×18")  
 * - Line 3: TOP 1 Negative (e.g., "Long Wait ×6") - omit if none
 * 
 * Tap counts (×N) ALWAYS visible, NEVER replaced by medals.
 */
export function PlaceCardReviewLines({ placeId, className }: PlaceCardReviewLinesProps) {
  const { data: aggregates } = usePlaceStampAggregates(placeId);
  const { data: allStamps } = useAllStamps();

  const reviewLines = useMemo(() => {
    if (!aggregates || aggregates.length === 0) {
      return { positive: null, neutral: null, negative: null };
    }

    // TOP 1 POSITIVE
    const positiveData = aggregates
      .filter(a => a.polarity === 'positive')
      .sort((a, b) => b.total_votes - a.total_votes)[0];

    // TOP 1 NEUTRAL  
    const neutralData = aggregates
      .filter(a => a.polarity === 'neutral')
      .sort((a, b) => b.total_votes - a.total_votes)[0];

    // TOP 1 NEGATIVE
    const negativeData = aggregates
      .filter(a => a.polarity === 'improvement')
      .sort((a, b) => b.total_votes - a.total_votes)[0];

    return {
      positive: positiveData ? {
        label: positiveData.stamp_id ? getStampLabel(allStamps, positiveData.stamp_id) : positiveData.dimension,
        votes: positiveData.total_votes,
      } : null,
      neutral: neutralData ? {
        label: neutralData.stamp_id ? getStampLabel(allStamps, neutralData.stamp_id) : neutralData.dimension,
        votes: neutralData.total_votes,
      } : null,
      negative: negativeData ? {
        label: negativeData.stamp_id ? getStampLabel(allStamps, negativeData.stamp_id) : negativeData.dimension,
        votes: negativeData.total_votes,
      } : null,
    };
  }, [aggregates, allStamps]);

  // If no reviews at all, show nothing (cards will just show place info)
  const hasAnyReviews = reviewLines.positive || reviewLines.neutral || reviewLines.negative;
  if (!hasAnyReviews) return null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* LINE 1: POSITIVE - White text on card overlay */}
      {reviewLines.positive && (
        <div className="text-[15px] leading-tight font-semibold text-white drop-shadow-md">
          {reviewLines.positive.label} <span className="font-bold">×{reviewLines.positive.votes}</span>
        </div>
      )}

      {/* LINE 2: NEUTRAL - Slightly dimmer */}
      {reviewLines.neutral && (
        <div className="text-[14px] leading-tight font-medium text-white/80 drop-shadow-md">
          {reviewLines.neutral.label} <span className="font-bold">×{reviewLines.neutral.votes}</span>
        </div>
      )}

      {/* LINE 3: NEGATIVE - Only show if exists, red tint */}
      {reviewLines.negative && (
        <div className="text-[14px] leading-tight font-medium text-red-300 drop-shadow-md">
          {reviewLines.negative.label} <span className="font-bold">×{reviewLines.negative.votes}</span>
        </div>
      )}
    </div>
  );
}
