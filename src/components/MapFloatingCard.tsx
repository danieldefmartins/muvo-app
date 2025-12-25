import { useNavigate } from 'react-router-dom';
import { Place } from '@/hooks/usePlaces';
import { cn } from '@/lib/utils';
import { ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { hapticLight } from '@/lib/haptics';
import { usePlaceStampAggregates, usePlaceReviewCount } from '@/hooks/useReviews';
import { useAllStamps, type StampDefinition } from '@/hooks/useStamps';
import { useMemo } from 'react';

interface MapFloatingCardProps {
  place: Place;
  isSelected: boolean;
  onSelect: () => void;
  distance: number;
}

function getStampIcon(stamps: StampDefinition[] | undefined, stampId: string): React.ComponentType<any> {
  const stamp = stamps?.find(s => s.id === stampId);
  if (stamp?.icon) {
    const IconComponent = (LucideIcons as any)[stamp.icon];
    if (IconComponent) return IconComponent;
  }
  return Sparkles;
}

// Derive confidence label from review data
function getConfidenceLabel(reviewCount: number, positiveCount: number, improvementCount: number): {
  label: string;
  variant: 'positive' | 'neutral' | 'caution';
} {
  if (reviewCount === 0) {
    return { label: 'No reports yet', variant: 'neutral' };
  }
  
  if (reviewCount < 3) {
    return { label: 'Limited reports', variant: 'neutral' };
  }
  
  const ratio = positiveCount / (positiveCount + improvementCount + 1);
  
  if (ratio >= 0.7 && reviewCount >= 5) {
    return { label: 'Often recommended', variant: 'positive' };
  }
  
  if (ratio >= 0.5) {
    return { label: 'Good for overnight', variant: 'positive' };
  }
  
  if (ratio >= 0.3) {
    return { label: 'Mixed experiences', variant: 'neutral' };
  }
  
  return { label: 'Proceed with caution', variant: 'caution' };
}

// Determine micro tag
function getMicroTag(reviewCount: number): { label: string; icon: React.ComponentType<any> } | null {
  // Popular if many reviews
  if (reviewCount >= 10) {
    return { label: 'Popular', icon: TrendingUp };
  }
  
  // Community favorite threshold
  if (reviewCount >= 5) {
    return { label: 'Favorite', icon: Sparkles };
  }
  
  return null;
}

export function MapFloatingCard({ place, isSelected, onSelect, distance }: MapFloatingCardProps) {
  const navigate = useNavigate();
  const { data: aggregates } = usePlaceStampAggregates(place.id);
  const { data: reviewCount = 0 } = usePlaceReviewCount(place.id);
  const { data: allStamps } = useAllStamps();

  // Get top experience signals (positive stamps only, max 3)
  const experienceSignals = useMemo(() => {
    if (!aggregates || aggregates.length === 0) return [];
    
    return aggregates
      .filter(a => a.polarity === 'positive')
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 3)
      .map(stamp => ({
        id: stamp.stamp_id || stamp.dimension,
        icon: stamp.stamp_id ? getStampIcon(allStamps, stamp.stamp_id) : Sparkles,
      }));
  }, [aggregates, allStamps]);

  // Get confidence label
  const confidenceInfo = useMemo(() => {
    const positiveCount = aggregates?.filter(a => a.polarity === 'positive').length || 0;
    const improvementCount = aggregates?.filter(a => a.polarity === 'improvement').length || 0;
    return getConfidenceLabel(reviewCount, positiveCount, improvementCount);
  }, [reviewCount, aggregates]);

  // Get micro tag
  const microTag = useMemo(() => getMicroTag(reviewCount), [reviewCount]);

  const handleClick = () => {
    hapticLight();
    if (isSelected) {
      navigate(`/place/${place.id}`);
    } else {
      onSelect();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex-shrink-0 w-[90vw] max-w-[380px] bg-card/98 backdrop-blur-md rounded-2xl cursor-pointer transition-all duration-200',
        isSelected ? 'ring-2 ring-primary' : ''
      )}
      style={{
        boxShadow: isSelected 
          ? '0 8px 32px -4px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.2)' 
          : '0 6px 24px -4px rgba(0, 0, 0, 0.3), 0 2px 8px -2px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div className="p-3">
        {/* Row 1: Name + Verification + Micro Tag */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1 flex-1">
            {place.name}
          </h3>
          {place.isVerified && (
            <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
          )}
          {microTag && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium flex-shrink-0">
              <microTag.icon className="w-3 h-3" />
              {microTag.label}
            </div>
          )}
        </div>

        {/* Row 2: Experience Signals */}
        {experienceSignals.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            {experienceSignals.map((signal, idx) => {
              const IconComponent = signal.icon;
              return (
                <div
                  key={signal.id + idx}
                  className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center"
                >
                  <IconComponent className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
                </div>
              );
            })}
          </div>
        )}

        {/* Row 3: Distance + Price */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
          <span>{distance.toFixed(1)} mi</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-medium">{place.priceLevel}</span>
        </div>

        {/* Row 4: Confidence Label */}
        <div className="flex items-center justify-between">
          <span className={cn(
            'text-xs font-medium',
            confidenceInfo.variant === 'positive' && 'text-emerald-600 dark:text-emerald-400',
            confidenceInfo.variant === 'neutral' && 'text-muted-foreground',
            confidenceInfo.variant === 'caution' && 'text-amber-600 dark:text-amber-400'
          )}>
            {confidenceInfo.label}
          </span>
          
          {/* Tap hint chevron */}
          <div className={cn(
            "flex-shrink-0 transition-colors",
            isSelected ? "text-primary" : "text-muted-foreground/30"
          )}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
