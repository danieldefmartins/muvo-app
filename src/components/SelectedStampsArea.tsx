import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StampDefinition } from '@/hooks/useStamps';

interface SelectedStampsAreaProps {
  positiveStamps: StampDefinition[];
  improvementStamps: StampDefinition[];
  selectedPositive: Map<string, number>;
  selectedImprovement: Map<string, number>;
  onAddPositive: () => void;
  onAddImprovement: () => void;
  onTapPositive: (stamp: StampDefinition) => void;
  onTapImprovement: (stamp: StampDefinition) => void;
  onRemovePositive: (stampId: string) => void;
  onRemoveImprovement: (stampId: string) => void;
  totalPositiveVotes: number;
  totalImprovementVotes: number;
  maxPositiveVotes: number;
  maxImprovementVotes: number;
}

const LEVEL_LABELS = ['', 'Good', 'Great', 'Excellent'];
const IMPROVEMENT_LABELS = ['', 'Needs Work', 'Could Improve', 'Major Issue'];

export function SelectedStampsArea({
  positiveStamps,
  improvementStamps,
  selectedPositive,
  selectedImprovement,
  onAddPositive,
  onAddImprovement,
  onTapPositive,
  onTapImprovement,
  onRemovePositive,
  onRemoveImprovement,
  totalPositiveVotes,
  totalImprovementVotes,
  maxPositiveVotes,
  maxImprovementVotes,
}: SelectedStampsAreaProps) {
  const canAddPositive = totalPositiveVotes < maxPositiveVotes;
  const canAddImprovement = totalImprovementVotes < maxImprovementVotes;
  const positiveAtLimit = !canAddPositive;
  const improvementAtLimit = !canAddImprovement;

  const renderSelectedStamp = (
    stamp: StampDefinition,
    level: number,
    polarity: 'positive' | 'improvement',
    onTap: () => void,
    onRemove: () => void
  ) => {
    const IconComponent = stamp.icon
      ? (LucideIcons as any)[stamp.icon] || LucideIcons.Circle
      : LucideIcons.Circle;
    
    const labels = polarity === 'positive' ? LEVEL_LABELS : IMPROVEMENT_LABELS;

    const getStyles = () => {
      if (polarity === 'positive') {
        switch (level) {
          case 1:
            return 'bg-primary/20 text-primary border-primary/50';
          case 2:
            return 'bg-primary/40 text-primary border-primary ring-2 ring-primary/40';
          case 3:
            return 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/60 shadow-lg shadow-primary/30';
          default:
            return 'bg-muted text-muted-foreground border-border';
        }
      } else {
        switch (level) {
          case 1:
            return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
          case 2:
            return 'bg-amber-500/40 text-amber-600 border-amber-500 ring-2 ring-amber-500/40';
          case 3:
            return 'bg-destructive text-destructive-foreground border-destructive ring-2 ring-destructive/40 shadow-lg shadow-destructive/30';
          default:
            return 'bg-muted text-muted-foreground border-border';
        }
      }
    };

    return (
      <div key={stamp.id} className="flex flex-col items-center gap-1.5 relative group animate-fade-in">
        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted-foreground/80 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X size={12} />
        </button>

        <button
          type="button"
          onClick={onTap}
          className={cn(
            'w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            'hover:scale-105 active:scale-95',
            getStyles()
          )}
        >
          <IconComponent size={28} />
        </button>
        
        <div className="text-center w-18">
          <p className="text-xs font-medium text-foreground leading-tight truncate max-w-16">
            {stamp.label}
          </p>
          {/* Strength Dots */}
          <div className="flex gap-0.5 justify-center mt-0.5">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  dot <= level
                    ? polarity === 'positive'
                      ? 'bg-primary'
                      : level === 3
                      ? 'bg-destructive'
                      : 'bg-amber-500'
                    : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{labels[level]}</p>
        </div>
      </div>
    );
  };

  const renderAddButton = (onClick: () => void, disabled: boolean, polarity: 'positive' | 'improvement') => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-1.5',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <div
        className={cn(
          'w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-200',
          !disabled && 'hover:scale-105 active:scale-95',
          polarity === 'positive'
            ? disabled
              ? 'border-muted-foreground/30 text-muted-foreground/30'
              : 'border-primary/50 text-primary/50 hover:border-primary hover:text-primary'
            : disabled
              ? 'border-muted-foreground/30 text-muted-foreground/30'
              : 'border-amber-500/50 text-amber-500/50 hover:border-amber-500 hover:text-amber-500'
        )}
      >
        <Plus size={24} />
      </div>
      <p className="text-xs text-muted-foreground">
        {polarity === 'positive' ? '+ Add what stood out' : '+ Add issue'}
      </p>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Positive Stamps Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">What was GREAT?</h3>
          <span className={cn(
            'text-sm',
            positiveAtLimit ? 'text-amber-500 font-medium' : 'text-muted-foreground'
          )}>
            {totalPositiveVotes} / {maxPositiveVotes}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4 items-start">
          {Array.from(selectedPositive.entries()).map(([stampId, level]) => {
            const stamp = positiveStamps.find(s => s.id === stampId);
            if (!stamp) return null;
            return renderSelectedStamp(
              stamp,
              level,
              'positive',
              () => onTapPositive(stamp),
              () => onRemovePositive(stampId)
            );
          })}
          {renderAddButton(onAddPositive, !canAddPositive, 'positive')}
        </div>

        {/* Limit reached hint */}
        {positiveAtLimit && selectedPositive.size > 0 && (
          <div className="flex items-center gap-2 py-2 px-3 bg-amber-500/10 rounded-lg border border-amber-500/20 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-600">
              You've reached the max for Good stamps.
            </p>
          </div>
        )}
      </div>

      {/* Improvement Stamps Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">What needs IMPROVEMENT?</h3>
          <span className={cn(
            'text-sm',
            improvementAtLimit ? 'text-amber-500 font-medium' : 'text-muted-foreground'
          )}>
            {totalImprovementVotes} / {maxImprovementVotes}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4 items-start">
          {Array.from(selectedImprovement.entries()).map(([stampId, level]) => {
            const stamp = improvementStamps.find(s => s.id === stampId);
            if (!stamp) return null;
            return renderSelectedStamp(
              stamp,
              level,
              'improvement',
              () => onTapImprovement(stamp),
              () => onRemoveImprovement(stampId)
            );
          })}
          {renderAddButton(onAddImprovement, !canAddImprovement, 'improvement')}
        </div>

        {/* Limit reached hint */}
        {improvementAtLimit && selectedImprovement.size > 0 && (
          <div className="flex items-center gap-2 py-2 px-3 bg-amber-500/10 rounded-lg border border-amber-500/20 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-600">
              You've reached the max for Improvement stamps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
