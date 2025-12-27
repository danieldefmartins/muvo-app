import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { usePlaceStampAggregates } from '@/hooks/useReviews';
import { useAllStamps, getStampLabel } from '@/hooks/useStamps';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MuvoReviewExpandedProps {
  placeId: string;
  className?: string;
}

/**
 * Full Place Page - Reviews Section
 * Default visible:
 * - Top 5 Positive
 * - Top 3 Neutral
 * - Top 2 Negative
 * 
 * Expandable to show all
 */
export function MuvoReviewExpanded({ placeId, className }: MuvoReviewExpandedProps) {
  const { data: aggregates, isLoading } = usePlaceStampAggregates(placeId);
  const { data: allStamps } = useAllStamps();
  
  const [showAllPositive, setShowAllPositive] = useState(false);
  const [showAllNeutral, setShowAllNeutral] = useState(false);
  const [showAllNegative, setShowAllNegative] = useState(false);

  const categorizedSignals = useMemo(() => {
    if (!aggregates || aggregates.length === 0) {
      return { positive: [], neutral: [], negative: [] };
    }

    const positive = aggregates
      .filter(a => a.polarity === 'positive')
      .sort((a, b) => b.total_votes - a.total_votes)
      .map(a => ({
        id: a.stamp_id || a.dimension,
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        votes: a.total_votes,
      }));

    const neutral = aggregates
      .filter(a => a.polarity === 'neutral')
      .sort((a, b) => b.total_votes - a.total_votes)
      .map(a => ({
        id: a.stamp_id || a.dimension,
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        votes: a.total_votes,
      }));

    const negative = aggregates
      .filter(a => a.polarity === 'improvement')
      .sort((a, b) => b.total_votes - a.total_votes)
      .map(a => ({
        id: a.stamp_id || a.dimension,
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        votes: a.total_votes,
      }));

    return { positive, neutral, negative };
  }, [aggregates, allStamps]);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse space-y-3", className)}>
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-8 bg-muted rounded w-2/3" />
      </div>
    );
  }

  const hasAnySignals = 
    categorizedSignals.positive.length > 0 || 
    categorizedSignals.neutral.length > 0 || 
    categorizedSignals.negative.length > 0;

  if (!hasAnySignals) {
    return (
      <div className={cn("text-center py-6", className)}>
        <p className="text-muted-foreground">No reviews yet</p>
        <p className="text-sm text-muted-foreground mt-1">Be the first to share what this place is like</p>
      </div>
    );
  }

  const visiblePositive = showAllPositive ? categorizedSignals.positive : categorizedSignals.positive.slice(0, 5);
  const visibleNeutral = showAllNeutral ? categorizedSignals.neutral : categorizedSignals.neutral.slice(0, 3);
  const visibleNegative = showAllNegative ? categorizedSignals.negative : categorizedSignals.negative.slice(0, 2);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Positive Section */}
      {categorizedSignals.positive.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <ThumbsUp className="w-4 h-4 text-amber-500" />
            <h4 className="font-semibold text-foreground text-sm">What people like</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {visiblePositive.map(signal => (
              <span
                key={signal.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              >
                {signal.label} <span className="ml-1 font-bold">×{signal.votes}</span>
              </span>
            ))}
          </div>
          {categorizedSignals.positive.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllPositive(!showAllPositive)}
              className="mt-2 text-xs text-primary h-auto py-1 px-2"
            >
              {showAllPositive ? (
                <>Show less <ChevronUp className="w-3 h-3 ml-1" /></>
              ) : (
                <>Show all {categorizedSignals.positive.length} positives <ChevronDown className="w-3 h-3 ml-1" /></>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Neutral Section - How the place feels */}
      {categorizedSignals.neutral.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-4 h-4 text-stone-500" />
            <h4 className="font-semibold text-foreground text-sm">How this place feels</h4>
            <span className="text-xs text-muted-foreground">(style, not quality)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleNeutral.map(signal => (
              <span
                key={signal.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20"
              >
                {signal.label} <span className="ml-1 font-bold">×{signal.votes}</span>
              </span>
            ))}
          </div>
          {categorizedSignals.neutral.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllNeutral(!showAllNeutral)}
              className="mt-2 text-xs text-primary h-auto py-1 px-2"
            >
              {showAllNeutral ? (
                <>Show less <ChevronUp className="w-3 h-3 ml-1" /></>
              ) : (
                <>Show all {categorizedSignals.neutral.length} neutral <ChevronDown className="w-3 h-3 ml-1" /></>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Negative Section */}
      {categorizedSignals.negative.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <ThumbsDown className="w-4 h-4 text-red-500" />
            <h4 className="font-semibold text-foreground text-sm">What didn't go well</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleNegative.map(signal => (
              <span
                key={signal.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              >
                {signal.label} <span className="ml-1 font-bold">×{signal.votes}</span>
              </span>
            ))}
          </div>
          {categorizedSignals.negative.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllNegative(!showAllNegative)}
              className="mt-2 text-xs text-primary h-auto py-1 px-2"
            >
              {showAllNegative ? (
                <>Show less <ChevronUp className="w-3 h-3 ml-1" /></>
              ) : (
                <>Show all {categorizedSignals.negative.length} negatives <ChevronDown className="w-3 h-3 ml-1" /></>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
