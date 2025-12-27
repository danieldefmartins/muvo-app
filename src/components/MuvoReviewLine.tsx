import { useMemo } from 'react';
import { usePlaceStampAggregates } from '@/hooks/useReviews';
import { useAllStamps, getStampLabel } from '@/hooks/useStamps';
import { cn } from '@/lib/utils';

interface MuvoReviewLineProps {
  placeId: string;
  className?: string;
}

interface ReviewItem {
  label: string;
  votes: number;
}

/**
 * Three-line stacked review display for place cards:
 * Line 1: Positive (blue accent)
 * Line 2: Neutral (gold/gray accent)
 * Line 3: Negative (red accent)
 * 
 * Each line shows up to 2 top items with ×N counts
 */
export function MuvoReviewLine({ placeId, className }: MuvoReviewLineProps) {
  const { data: aggregates } = usePlaceStampAggregates(placeId);
  const { data: allStamps } = useAllStamps();

  const reviewLines = useMemo(() => {
    if (!aggregates || aggregates.length === 0) {
      return { positive: [], neutral: [], negative: [] };
    }

    // Get top 2 positive
    const positiveItems: ReviewItem[] = aggregates
      .filter(a => a.polarity === 'positive')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 2)
      .map(a => ({
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        votes: a.total_votes,
      }));

    // Get top 2 neutral
    const neutralItems: ReviewItem[] = aggregates
      .filter(a => a.polarity === 'neutral')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 2)
      .map(a => ({
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        votes: a.total_votes,
      }));

    // Get top 2 negative/improvement
    const negativeItems: ReviewItem[] = aggregates
      .filter(a => a.polarity === 'improvement')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 2)
      .map(a => ({
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        votes: a.total_votes,
      }));

    return {
      positive: positiveItems,
      neutral: neutralItems,
      negative: negativeItems,
    };
  }, [aggregates, allStamps]);

  const formatItems = (items: ReviewItem[]) => {
    return items.map((item, idx) => (
      <span key={idx}>
        {item.label} ×{item.votes}
        {idx < items.length - 1 && <span className="mx-1.5 opacity-40">•</span>}
      </span>
    ));
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Positive Line */}
      <div 
        className="px-2 py-1 rounded-md bg-primary/8 text-primary font-semibold"
        style={{ fontSize: '13px', lineHeight: '18px' }}
      >
        {reviewLines.positive.length > 0 ? (
          formatItems(reviewLines.positive)
        ) : (
          <span className="opacity-70">Be the first to tap what this place is like →</span>
        )}
      </div>

      {/* Neutral Line */}
      <div 
        className="px-2 py-1 rounded-md bg-amber-500/8 text-amber-700 dark:text-amber-400 font-semibold"
        style={{ fontSize: '13px', lineHeight: '18px' }}
      >
        {reviewLines.neutral.length > 0 ? (
          formatItems(reviewLines.neutral)
        ) : (
          <span className="opacity-70">Add how this place feels →</span>
        )}
      </div>

      {/* Negative Line */}
      <div 
        className="px-2 py-1 rounded-md bg-red-500/8 text-red-600 dark:text-red-400 font-semibold"
        style={{ fontSize: '13px', lineHeight: '18px' }}
      >
        {reviewLines.negative.length > 0 ? (
          formatItems(reviewLines.negative)
        ) : (
          <span className="opacity-70">No negative taps reported</span>
        )}
      </div>
    </div>
  );
}
