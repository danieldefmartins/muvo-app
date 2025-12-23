import React from 'react';
import { usePlaceSignalSummary, REVIEW_DIMENSIONS } from '@/hooks/useReviews';
import { ReviewSignalIcon } from './ReviewSignalIcon';
import { ThumbsUp, AlertTriangle } from 'lucide-react';

interface PlaceSignalSummaryProps {
  placeId: string;
}

export function PlaceSignalSummary({ placeId }: PlaceSignalSummaryProps) {
  const { data: summary, isLoading } = usePlaceSignalSummary(placeId);

  if (isLoading || !summary) return null;

  const hasPositive = summary.knownFor.length > 0;
  const hasIssues = summary.commonIssues.length > 0;

  if (!hasPositive && !hasIssues) return null;

  const getDimensionLabel = (dimension: string) => {
    return REVIEW_DIMENSIONS.find((d) => d.id === dimension)?.label || dimension;
  };

  return (
    <div className="space-y-4">
      {hasPositive && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <ThumbsUp className="h-4 w-4" />
            <span className="font-medium text-sm">Known for</span>
          </div>
          <div className="flex gap-3">
            {summary.knownFor.map((item) => (
              <div key={item.dimension} className="flex items-center gap-2">
                <ReviewSignalIcon
                  dimension={item.dimension}
                  polarity="positive"
                  level={Math.round(item.avgLevel)}
                  selected
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium">{getDimensionLabel(item.dimension)}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.count} {item.count === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasIssues && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium text-sm">Common issues</span>
          </div>
          <div className="flex gap-3">
            {summary.commonIssues.map((item) => (
              <div key={item.dimension} className="flex items-center gap-2">
                <ReviewSignalIcon
                  dimension={item.dimension}
                  polarity="improvement"
                  level={Math.round(item.avgLevel)}
                  selected
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium">{getDimensionLabel(item.dimension)}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.count} {item.count === 1 ? 'mention' : 'mentions'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
