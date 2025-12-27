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
 * MUVO v1.7 - Three-line stacked review display for place cards/sheets:
 * ROW 1: POSITIVE (blue accent) - top 3 items
 * ROW 2: NEUTRAL (amber/gold accent) - top 2 items (style/vibe only)
 * ROW 3: NEGATIVE (red accent) - top 1 item
 * 
 * Tap counts (×N) ALWAYS visible.
 * Categories NEVER mixed between rows.
 * Improved readability with larger fonts per v1.7.
 */
export function MuvoReviewLine({ placeId, className }: MuvoReviewLineProps) {
  const { data: aggregates } = usePlaceStampAggregates(placeId);
  const { data: allStamps } = useAllStamps();

  const reviewLines = useMemo(() => {
    if (!aggregates || aggregates.length === 0) {
      return { positive: [], neutral: [], negative: [] };
    }

    // ROW 1: Get top 3 POSITIVE stamps (polarity === 'positive')
    const positiveItems: ReviewItem[] = aggregates
      .filter(a => a.polarity === 'positive')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 3)
      .map(a => ({
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        votes: a.total_votes,
      }));

    // ROW 2: Get top 2 NEUTRAL stamps (polarity === 'neutral')
    // These are "It feels" style tags - never quality judgments
    const neutralItems: ReviewItem[] = aggregates
      .filter(a => a.polarity === 'neutral')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 2)
      .map(a => ({
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        votes: a.total_votes,
      }));

    // ROW 3: Get top 1 NEGATIVE stamp (polarity === 'improvement')
    const negativeItems: ReviewItem[] = aggregates
      .filter(a => a.polarity === 'improvement')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 1)
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
      <span key={idx} className="whitespace-nowrap">
        {item.label} <span className="font-bold">×{item.votes}</span>
        {idx < items.length - 1 && <span className="mx-2 opacity-40">•</span>}
      </span>
    ));
  };

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {/* ROW 1: POSITIVE - Blue tint */}
      <div 
        className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-semibold"
        style={{ fontSize: '15px', lineHeight: '22px' }}
      >
        {reviewLines.positive.length > 0 ? (
          formatItems(reviewLines.positive)
        ) : (
          <span className="opacity-60 font-normal">Be the first to tap what this place is like →</span>
        )}
      </div>

      {/* ROW 2: NEUTRAL - Amber/Gold tint (style/vibe only) */}
      <div 
        className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold"
        style={{ fontSize: '15px', lineHeight: '22px' }}
      >
        {reviewLines.neutral.length > 0 ? (
          formatItems(reviewLines.neutral)
        ) : (
          <span className="opacity-60 font-normal">Add how this place feels →</span>
        )}
      </div>

      {/* ROW 3: NEGATIVE - Red tint (omit if no negatives) */}
      {reviewLines.negative.length > 0 && (
        <div 
          className="px-3 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-semibold"
          style={{ fontSize: '15px', lineHeight: '22px' }}
        >
          {formatItems(reviewLines.negative)}
        </div>
      )}
    </div>
  );
}
