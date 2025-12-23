import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StampDefinition } from '@/hooks/useStamps';

interface StampSelectorPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stamps: StampDefinition[];
  polarity: 'positive' | 'improvement';
  selectedStamps: Map<string, number>;
  onSelectStamp: (stamp: StampDefinition, level: number) => void;
  remainingVotes: number;
  maxVotes: number;
}

const LEVEL_LABELS = ['', 'Good', 'Great', 'Excellent'];
const IMPROVEMENT_LABELS = ['', 'Needs Work', 'Could Improve', 'Major Issue'];

export function StampSelectorPopup({
  open,
  onOpenChange,
  stamps,
  polarity,
  selectedStamps,
  onSelectStamp,
  remainingVotes,
  maxVotes,
}: StampSelectorPopupProps) {
  const [activeStamp, setActiveStamp] = useState<StampDefinition | null>(null);
  const [animatingLevel, setAnimatingLevel] = useState<number | null>(null);
  const [showLevelText, setShowLevelText] = useState(false);

  // Reset active stamp when popup opens
  useEffect(() => {
    if (open) {
      // Pre-select first stamp if none active
      if (!activeStamp && stamps.length > 0) {
        setActiveStamp(stamps[0]);
      }
    } else {
      setActiveStamp(null);
      setAnimatingLevel(null);
      setShowLevelText(false);
    }
  }, [open, stamps]);

  const currentLevel = activeStamp ? (selectedStamps.get(activeStamp.id) || 0) : 0;
  const labels = polarity === 'positive' ? LEVEL_LABELS : IMPROVEMENT_LABELS;

  const handleStampTap = () => {
    if (!activeStamp) return;

    const current = selectedStamps.get(activeStamp.id) || 0;
    let newLevel: number;

    if (current === 0) {
      // First tap - check if we have votes
      if (remainingVotes < 1) return;
      newLevel = 1;
    } else if (current < 3) {
      // Check if we can add another vote
      if (remainingVotes < 1) {
        // Can't increase, remove instead
        newLevel = 0;
      } else {
        newLevel = current + 1;
      }
    } else {
      // At level 3, remove the stamp
      newLevel = 0;
    }

    // Animate level text
    setAnimatingLevel(newLevel);
    setShowLevelText(true);
    
    onSelectStamp(activeStamp, newLevel);

    // Auto-close after selection with slight delay for feedback
    if (newLevel > 0) {
      setTimeout(() => {
        onOpenChange(false);
      }, 400);
    }

    // Reset animation after delay
    setTimeout(() => {
      setShowLevelText(false);
      setAnimatingLevel(null);
    }, 350);
  };

  const getActiveIcon = () => {
    if (!activeStamp?.icon) return LucideIcons.Circle;
    return (LucideIcons as any)[activeStamp.icon] || LucideIcons.Circle;
  };

  const ActiveIcon = getActiveIcon();

  const renderStrengthDots = (level: number) => {
    return (
      <div className="flex gap-1.5 justify-center">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-200',
              dot <= level
                ? polarity === 'positive'
                  ? 'bg-primary scale-110'
                  : level === 3
                  ? 'bg-destructive scale-110'
                  : 'bg-amber-500 scale-110'
                : 'bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
    );
  };

  const getActiveStyles = () => {
    if (currentLevel === 0) {
      return polarity === 'positive'
        ? 'bg-primary/10 text-primary border-primary/30'
        : 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    }

    if (polarity === 'positive') {
      switch (currentLevel) {
        case 1:
          return 'bg-primary/20 text-primary border-primary/50';
        case 2:
          return 'bg-primary/40 text-primary border-primary ring-2 ring-primary/40';
        case 3:
          return 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/60 shadow-lg shadow-primary/30';
        default:
          return 'bg-primary/10 text-primary border-primary/30';
      }
    } else {
      switch (currentLevel) {
        case 1:
          return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
        case 2:
          return 'bg-amber-500/40 text-amber-600 border-amber-500 ring-2 ring-amber-500/40';
        case 3:
          return 'bg-destructive text-destructive-foreground border-destructive ring-2 ring-destructive/40 shadow-lg shadow-destructive/30';
        default:
          return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {polarity === 'positive' ? 'What stood out?' : 'What needs improvement?'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Large Active Stamp Preview */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleStampTap}
              className={cn(
                'w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                'hover:scale-105 active:scale-95',
                getActiveStyles(),
                animatingLevel !== null && 'scale-110'
              )}
            >
              <ActiveIcon size={48} />
            </button>

            {/* Stamp Label */}
            <div className="text-center">
              <p className="text-lg font-semibold">{activeStamp?.label || 'Select a stamp'}</p>
              
              {/* Animated Level Text */}
              <div className="h-8 flex items-center justify-center">
                {showLevelText && animatingLevel !== null && animatingLevel > 0 ? (
                  <p
                    className={cn(
                      'text-sm font-medium animate-scale-in',
                      polarity === 'positive' ? 'text-primary' : animatingLevel === 3 ? 'text-destructive' : 'text-amber-500'
                    )}
                  >
                    {labels[animatingLevel]}
                  </p>
                ) : currentLevel > 0 ? (
                  <p
                    className={cn(
                      'text-sm font-medium',
                      polarity === 'positive' ? 'text-primary' : currentLevel === 3 ? 'text-destructive' : 'text-amber-500'
                    )}
                  >
                    {labels[currentLevel]}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Tap to select</p>
                )}
              </div>

              {/* Strength Dots */}
              {renderStrengthDots(currentLevel)}
            </div>
          </div>

          {/* Horizontal Scrollable Stamp List */}
          <div className="border-t border-border pt-4">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 px-2 py-2">
                {stamps.map((stamp) => {
                  const IconComponent = stamp.icon
                    ? (LucideIcons as any)[stamp.icon] || LucideIcons.Circle
                    : LucideIcons.Circle;
                  const stampLevel = selectedStamps.get(stamp.id) || 0;
                  const isActive = activeStamp?.id === stamp.id;

                  return (
                    <button
                      key={stamp.id}
                      onClick={() => setActiveStamp(stamp)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200',
                        'hover:bg-muted/50',
                        isActive && 'bg-muted ring-2 ring-primary/50',
                        stampLevel > 0 && !isActive && 'opacity-60'
                      )}
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all',
                          stampLevel > 0
                            ? polarity === 'positive'
                              ? 'bg-primary/20 text-primary border-primary/50'
                              : 'bg-amber-500/20 text-amber-500 border-amber-500/50'
                            : 'bg-muted text-muted-foreground border-border'
                        )}
                      >
                        <IconComponent size={20} />
                      </div>
                      <span className="text-xs text-center w-14 truncate">{stamp.label}</span>
                      {stampLevel > 0 && (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((dot) => (
                            <div
                              key={dot}
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                dot <= stampLevel
                                  ? polarity === 'positive'
                                    ? 'bg-primary'
                                    : 'bg-amber-500'
                                  : 'bg-muted-foreground/30'
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-1 pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Tap the stamp: 1× Good • 2× Great • 3× Excellent
            </p>
            <p className="text-xs text-muted-foreground">
              {remainingVotes} of {maxVotes} remaining
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
