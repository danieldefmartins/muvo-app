import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MedalLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | null;

interface MuvoMedalBadgeProps {
  level: MedalLevel;
  score?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const medalStyles: Record<NonNullable<MedalLevel>, { bg: string; text: string; border: string; glow: string }> = {
  bronze: {
    bg: 'bg-amber-700/20',
    text: 'text-amber-700 dark:text-amber-500',
    border: 'border-amber-700/30',
    glow: 'shadow-amber-500/20',
  },
  silver: {
    bg: 'bg-slate-400/20',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-400/30',
    glow: 'shadow-slate-400/20',
  },
  gold: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-500/30',
    glow: 'shadow-yellow-500/30',
  },
  platinum: {
    bg: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-400/30',
    glow: 'shadow-indigo-500/30',
  },
};

const sizeStyles = {
  sm: {
    wrapper: 'w-6 h-6',
    icon: 'w-3.5 h-3.5',
    text: 'text-[10px]',
  },
  md: {
    wrapper: 'w-8 h-8',
    icon: 'w-4 h-4',
    text: 'text-xs',
  },
  lg: {
    wrapper: 'w-10 h-10',
    icon: 'w-5 h-5',
    text: 'text-sm',
  },
};

/**
 * MUVO Medal Badge
 * 
 * Medals recognize CONSISTENCY over time.
 * - Bronze / Silver / Gold / Platinum
 * - Number inside medal = MUVO Score (optional)
 * - Does NOT replace tap counts
 */
export function MuvoMedalBadge({ level, score, className, size = 'md' }: MuvoMedalBadgeProps) {
  if (!level) return null;

  const style = medalStyles[level];
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full border shadow-lg',
        style.bg,
        style.text,
        style.border,
        style.glow,
        sizeStyle.wrapper,
        className
      )}
      title={`${level.charAt(0).toUpperCase() + level.slice(1)} Medal${score ? ` - Score: ${score}` : ''}`}
    >
      <Award className={cn(sizeStyle.icon)} strokeWidth={2.5} />
      
      {/* Score overlay */}
      {score !== undefined && size !== 'sm' && (
        <span 
          className={cn(
            'absolute -bottom-1 -right-1 rounded-full bg-background border px-1 font-bold',
            style.border,
            style.text,
            sizeStyle.text
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}

/**
 * Calculate medal level based on place stats
 * This is a placeholder - actual thresholds will be defined in future prompt
 */
export function calculateMedalLevel(
  positiveVotes: number,
  negativeVotes: number,
  _reviewCount: number
): MedalLevel {
  // Placeholder logic - real thresholds TBD
  const ratio = positiveVotes / Math.max(negativeVotes, 1);
  
  if (positiveVotes < 10) return null; // Not enough data
  
  if (ratio >= 10 && positiveVotes >= 100) return 'platinum';
  if (ratio >= 5 && positiveVotes >= 50) return 'gold';
  if (ratio >= 3 && positiveVotes >= 25) return 'silver';
  if (ratio >= 2 && positiveVotes >= 10) return 'bronze';
  
  return null;
}
