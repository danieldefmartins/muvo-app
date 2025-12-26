import { useMemo } from 'react';
import { Place } from '@/hooks/usePlaces';
import { cn } from '@/lib/utils';
import { ShieldCheck, MapPin, ChevronRight, ThumbsDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getCategoryLabel } from '@/lib/categoryColors';
import { usePlaceStampAggregates } from '@/hooks/useReviews';
import { useAllStamps, getStampLabel, type StampDefinition } from '@/hooks/useStamps';
import { hapticLight } from '@/lib/haptics';

interface PlaceCardBottomSheetProps {
  place: Place;
  distance: number;
  isSelected?: boolean;
  onClick: () => void;
  variant?: 'peek' | 'list';
}

function getStampIcon(stamps: StampDefinition[] | undefined, stampId: string): React.ComponentType<any> {
  const stamp = stamps?.find(s => s.id === stampId);
  if (stamp?.icon) {
    const IconComponent = (LucideIcons as any)[stamp.icon];
    if (IconComponent) return IconComponent;
  }
  return LucideIcons.Sparkles;
}

export function PlaceCardBottomSheet({ 
  place, 
  distance, 
  isSelected, 
  onClick,
  variant = 'list'
}: PlaceCardBottomSheetProps) {
  const { data: aggregates } = usePlaceStampAggregates(place.id);
  const { data: allStamps } = useAllStamps();

  // Get tap-based review signals with labels
  const reviewSignals = useMemo(() => {
    if (!aggregates || aggregates.length === 0) {
      return { positive: [], improvement: [] };
    }

    const positive = aggregates
      .filter(a => a.polarity === 'positive')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 5)
      .map(a => ({
        id: a.stamp_id || a.dimension,
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        icon: a.stamp_id ? getStampIcon(allStamps, a.stamp_id) : LucideIcons.Sparkles,
        votes: a.total_votes,
      }));

    const improvement = aggregates
      .filter(a => a.polarity === 'improvement')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 2)
      .map(a => ({
        id: a.stamp_id || a.dimension,
        label: a.stamp_id ? getStampLabel(allStamps, a.stamp_id) : a.dimension,
        icon: a.stamp_id ? getStampIcon(allStamps, a.stamp_id) : LucideIcons.AlertTriangle,
        votes: a.total_votes,
      }));

    return { positive, improvement };
  }, [aggregates, allStamps]);

  const hasSignals = reviewSignals.positive.length > 0 || reviewSignals.improvement.length > 0;

  const handleClick = () => {
    hapticLight();
    onClick();
  };

  const isPeek = variant === 'peek';

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.98]',
        isPeek 
          ? 'bg-card rounded-2xl shadow-lg border border-border/50'
          : cn(
              'rounded-xl',
              isSelected 
                ? 'bg-primary/8 ring-1 ring-primary/30' 
                : 'bg-muted/40 hover:bg-muted/60'
            )
      )}
    >
      {/* Left accent bar - decorative only */}
      <div 
        className={cn(
          'absolute left-0 top-2 bottom-2 w-1 rounded-full',
          isPeek ? 'bg-gradient-to-b from-primary/60 to-primary/20' : 'bg-primary/30'
        )}
      />

      <div className={cn('pl-4', isPeek ? 'p-4' : 'p-3')}>
        {/* Row 1: Place Name - PRIMARY */}
        <div className="flex items-start gap-2 mb-1">
          <h3 className={cn(
            'font-semibold text-foreground line-clamp-1 flex-1',
            isPeek ? 'text-lg' : 'text-base'
          )}>
            {place.name}
          </h3>
          {place.isVerified && (
            <ShieldCheck className={cn(
              'text-primary flex-shrink-0',
              isPeek ? 'w-5 h-5' : 'w-4 h-4'
            )} />
          )}
        </div>

        {/* Row 2: TAP-BASED REVIEW SUMMARY - SECOND MAIN LINE */}
        {hasSignals && (
          <div className="mb-2 space-y-1">
            {/* Positive signals */}
            {reviewSignals.positive.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {reviewSignals.positive.slice(0, isPeek ? 5 : 3).map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <span 
                      key={signal.id}
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
                        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                        isPeek ? 'text-xs' : 'text-[11px]'
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {signal.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Improvement signals - only show on peek/expanded */}
            {isPeek && reviewSignals.improvement.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {reviewSignals.improvement.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <span 
                      key={signal.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs"
                    >
                      <Icon className="w-3 h-3" />
                      {signal.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* No signals placeholder */}
        {!hasSignals && (
          <p className={cn(
            'text-muted-foreground italic mb-2',
            isPeek ? 'text-sm' : 'text-xs'
          )}>
            No reviews yet — be the first!
          </p>
        )}

        {/* Row 3: Category Label */}
        <p className={cn(
          'text-muted-foreground mb-1.5',
          isPeek ? 'text-sm' : 'text-xs'
        )}>
          {getCategoryLabel(place.primaryCategory)}
        </p>

        {/* Row 4: Meta Row - Distance + Price + Verified */}
        <div className={cn(
          'flex items-center gap-2 text-muted-foreground',
          isPeek ? 'text-sm' : 'text-xs'
        )}>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{distance.toFixed(1)} mi</span>
          </div>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-medium">{place.priceLevel}</span>
          {place.isVerified && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-primary font-medium">Verified</span>
            </>
          )}
        </div>
      </div>

      {/* Subtle chevron - appears on right */}
      <ChevronRight className={cn(
        'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 transition-colors',
        isSelected && 'text-primary/50',
        isPeek ? 'w-5 h-5' : 'w-4 h-4'
      )} />
    </div>
  );
}
