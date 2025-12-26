import { Place, PlaceHours } from '@/hooks/usePlaces';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { getCategoryLabel } from '@/lib/categoryColors';
import { hapticLight } from '@/lib/haptics';
import { MuvoReviewLine } from '@/components/MuvoReviewLine';
import { MuvoMedalBadge } from '@/components/MuvoMedalBadge';
import { useMuvoScore } from '@/hooks/useMuvoScore';

interface PlaceCardBottomSheetProps {
  place: Place;
  distance: number;
  isSelected?: boolean;
  onClick: () => void;
  variant?: 'peek' | 'list';
}

export function PlaceCardBottomSheet({ 
  place, 
  distance, 
  isSelected, 
  onClick,
  variant = 'list'
}: PlaceCardBottomSheetProps) {
  // Use the server-computed MUVO score data
  const { data: muvoData } = useMuvoScore(place.id);
  
  // Medal level comes from server (database trigger computed)
  const medalLevel = muvoData?.muvo_medal_level ?? null;

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
        'bg-card rounded-2xl',
        isPeek 
          ? 'shadow-lg border border-border/30'
          : 'shadow-md hover:shadow-lg'
      )}
      style={{
        boxShadow: isPeek 
          ? '0 8px 24px -6px rgba(0, 0, 0, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.06)'
          : '0 4px 16px -4px rgba(0, 0, 0, 0.1), 0 2px 6px -2px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Medal Badge - Top Right Corner */}
      {medalLevel && (
        <div className="absolute top-3 right-3 z-10">
          <MuvoMedalBadge level={medalLevel} size="sm" />
        </div>
      )}

      <div className={cn('pr-12', isPeek ? 'p-4' : 'p-3.5')}>
        {/* A) PLACE NAME - Largest text, bold */}
        <h3 
          className="font-bold text-foreground line-clamp-2 mb-2"
          style={{ fontSize: '18px', lineHeight: '22px' }}
        >
          {place.name}
        </h3>

        {/* B) REVIEW SUMMARY LINE - Second biggest and boldest */}
        <div className="mb-2.5">
          <MuvoReviewLine placeId={place.id} />
        </div>

        {/* C) METADATA LINE - Category + Distance */}
        <div 
          className="flex items-center justify-between text-muted-foreground"
          style={{ fontSize: '13px', lineHeight: '16px' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{getCategoryLabel(place.primaryCategory)}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>{distance.toFixed(1)} mi</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-semibold">{place.priceLevel}</span>
          </div>

          {/* E) EXTERNAL RATINGS - Bottom right, small, informational */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            {/* Placeholder for external ratings when available */}
          </div>
        </div>
      </div>

      {/* Chevron - right side */}
      <ChevronRight 
        className="absolute right-3 bottom-4 text-muted-foreground/40 w-[18px] h-[18px]" 
      />
    </div>
  );
}
