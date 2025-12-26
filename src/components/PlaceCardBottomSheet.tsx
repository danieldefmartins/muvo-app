import { useMemo } from 'react';
import { Place, PlaceHours } from '@/hooks/usePlaces';
import { cn } from '@/lib/utils';
import { ShieldCheck, MapPin, ChevronRight, Clock } from 'lucide-react';
import { getCategoryLabel } from '@/lib/categoryColors';
import { usePlaceStampAggregates } from '@/hooks/useReviews';
import { hapticLight } from '@/lib/haptics';
import { MuvoReviewLine } from '@/components/MuvoReviewLine';
import { MuvoMedalBadge, calculateMedalLevel } from '@/components/MuvoMedalBadge';

interface PlaceCardBottomSheetProps {
  place: Place;
  distance: number;
  isSelected?: boolean;
  onClick: () => void;
  variant?: 'peek' | 'list';
}

// Format hours status for display
function getHoursStatus(place: Place): { text: string; isOpen: boolean | null } {
  if (place.is24_7) {
    return { text: 'Open 24/7', isOpen: true };
  }

  if (!place.hoursJson) {
    return { text: 'Hours not provided', isOpen: null };
  }

  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[now.getDay()];
  const todayHours = place.hoursJson[today];

  if (!todayHours || todayHours.closed) {
    return { text: 'Closed today', isOpen: false };
  }

  const currentTime = now.getHours() * 100 + now.getMinutes();
  const openTime = parseInt(todayHours.open.replace(':', ''));
  const closeTime = parseInt(todayHours.close.replace(':', ''));

  if (currentTime >= openTime && currentTime < closeTime) {
    const closeFormatted = formatTime(todayHours.close);
    return { text: `Open · Closes ${closeFormatted}`, isOpen: true };
  } else if (currentTime < openTime) {
    const openFormatted = formatTime(todayHours.open);
    return { text: `Closed · Opens ${openFormatted}`, isOpen: false };
  } else {
    // Find next opening day
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (now.getDay() + i) % 7;
      const nextDay = days[nextDayIndex];
      const nextHours = place.hoursJson[nextDay];
      if (nextHours && !nextHours.closed) {
        const dayName = i === 1 ? 'tomorrow' : nextDay.charAt(0).toUpperCase() + nextDay.slice(1);
        return { text: `Closed · Opens ${dayName}`, isOpen: false };
      }
    }
    return { text: 'Closed', isOpen: false };
  }
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function PlaceCardBottomSheet({ 
  place, 
  distance, 
  isSelected, 
  onClick,
  variant = 'list'
}: PlaceCardBottomSheetProps) {
  const { data: aggregates } = usePlaceStampAggregates(place.id);

  // Calculate medal level from aggregates
  const medalLevel = useMemo(() => {
    if (!aggregates || aggregates.length === 0) return null;
    
    const totalPositive = aggregates
      .filter(a => a.polarity === 'positive')
      .reduce((sum, a) => sum + a.total_votes, 0);
    
    const totalNegative = aggregates
      .filter(a => a.polarity === 'improvement')
      .reduce((sum, a) => sum + a.total_votes, 0);
    
    const reviewCount = aggregates.reduce((sum, a) => sum + a.review_count, 0);
    
    return calculateMedalLevel(totalPositive, totalNegative, reviewCount);
  }, [aggregates]);

  const hoursStatus = getHoursStatus(place);

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
      {/* Left accent bar - refined */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"
        style={{ borderRadius: '16px 0 0 16px' }}
      />

      <div className={cn('pl-4', isPeek ? 'p-4' : 'p-3.5')}>
        {/* Line 1: Place Name - 18px bold + Medal Badge */}
        <div className="flex items-start gap-2 mb-2 pr-8">
          <h3 
            className="font-bold text-foreground line-clamp-1 flex-1"
            style={{ fontSize: '18px', lineHeight: '22px' }}
          >
            {place.name}
          </h3>
          {medalLevel && (
            <MuvoMedalBadge level={medalLevel} size="sm" className="flex-shrink-0" />
          )}
          {place.isVerified && !medalLevel && (
            <ShieldCheck className="w-[18px] h-[18px] text-primary flex-shrink-0 mt-0.5" />
          )}
        </div>

        {/* Line 2: MUVO Review Summary - [1 Positive] | [1 Neutral] | [1 Negative] */}
        <div className="mb-2.5">
          <MuvoReviewLine placeId={place.id} />
        </div>

        {/* Line 3: Category + Key Details - 14px medium */}
        <p 
          className="text-muted-foreground mb-2"
          style={{ fontSize: '14px', lineHeight: '18px', fontWeight: 500 }}
        >
          {getCategoryLabel(place.primaryCategory)}
        </p>

        {/* Line 4: Meta Row - 13px, icons + text */}
        <div 
          className="flex items-center flex-wrap gap-x-2 gap-y-1 text-muted-foreground"
          style={{ fontSize: '13px', lineHeight: '16px', fontWeight: 500 }}
        >
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{distance.toFixed(1)} mi</span>
          </div>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-semibold">{place.priceLevel}</span>
          {place.isVerified && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-primary font-semibold">Verified</span>
            </>
          )}
          <span className="text-muted-foreground/40">·</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className={cn(
              hoursStatus.isOpen === true && 'text-emerald-600 dark:text-emerald-400',
              hoursStatus.isOpen === false && 'text-amber-600 dark:text-amber-400',
              hoursStatus.isOpen === null && 'text-muted-foreground'
            )}>
              {hoursStatus.text}
            </span>
          </div>
        </div>
      </div>

      {/* Chevron - right side, consistent */}
      <ChevronRight 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-[18px] h-[18px]" 
      />
    </div>
  );
}
