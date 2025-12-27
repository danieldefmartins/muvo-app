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
 * ROW 1: Positive (blue accent) - only positive polarity stamps
 * ROW 2: Neutral (amber/gold accent) - only neutral polarity stamps  
 * ROW 3: Negative (red accent) - only improvement polarity stamps
 * 
 * Each row shows up to 2 top items with ×N counts
 * Categories are NEVER mixed between rows
 */
export function MuvoReviewLine({ placeId, className }: MuvoReviewLineProps) {
  const { data: aggregates } = usePlaceStampAggregates(placeId);
  const { data: allStamps } = useAllStamps();

  const reviewLines = useMemo(() => {
    if (!aggregates || aggregates.length === 0) {
      return { positive: [], neutral: [], negative: [] };
    }

    // ROW 1: Get top 2 POSITIVE stamps only (polarity === 'positive')
    const positiveItems: ReviewItem[] = aggregates
      .filter(a => a.polarity === 'positive')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 2)
      .map(a => ({
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        votes: a.total_votes,
      }));

    // ROW 2: Get top 2 NEUTRAL stamps only (polarity === 'neutral')
    // These are "It feels" style tags - never quality judgments
    const neutralItems: ReviewItem[] = aggregates
      .filter(a => a.polarity === 'neutral')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 2)
      .map(a => ({
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        votes: a.total_votes,
      }));

    // ROW 3: Get top 2 NEGATIVE stamps only (polarity === 'improvement')
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
    <div className={cn("flex flex-col gap-2", className)}>
      {/* ROW 1: POSITIVE - Blue tint */}
      <div 
        className="px-2.5 py-1.5 rounded-md bg-primary/10 text-primary font-semibold"
        style={{ fontSize: '13px', lineHeight: '18px' }}
      >
        {reviewLines.positive.length > 0 ? (
          formatItems(reviewLines.positive)
        ) : (
          <span className="opacity-60 font-normal">Be the first to tap what this place is like →</span>
        )}
      </div>

      {/* ROW 2: NEUTRAL - Amber/Gold tint (style/vibe only) */}
      <div 
        className="px-2.5 py-1.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold"
        style={{ fontSize: '13px', lineHeight: '18px' }}
      >
        {reviewLines.neutral.length > 0 ? (
          formatItems(reviewLines.neutral)
        ) : (
          <span className="opacity-60 font-normal">Add how this place feels →</span>
        )}
      </div>

      {/* ROW 3: NEGATIVE - Red tint */}
      <div 
        className="px-2.5 py-1.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 font-semibold"
        style={{ fontSize: '13px', lineHeight: '18px' }}
      >
        {reviewLines.negative.length > 0 ? (
          formatItems(reviewLines.negative)
        ) : (
          <span className="opacity-60 font-normal">No negative taps reported</span>
        )}
      </div>
    </div>
  );
}
